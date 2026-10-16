import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { getActions } from './actions.js'
import { getPresets } from './presets.js'
import { getVariables } from './variables.js'
import { getFeedbacks } from './feedbacks.js'
import UpgradeScripts from './upgrades.js'

import { createHash } from 'node:crypto'
import fetch from 'node-fetch'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration.js'
dayjs.extend(duration)

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '',
	allowBooleanAttributes: true,
	ignoreDeclaration: true,
})

const REQUEST_TIMEOUT = 5000
// The event list and system status change rarely, so refresh them less often than event status
const FULL_REFRESH_INTERVAL = 5000
const COMMAND_SETTLE_DELAY = 1500

class ElementalLiveInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		// Feedback/action instance id -> event id, so only events used on buttons are polled
		this.subscriptions = new Map()
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		this.initConnection()

		this.initActions()
		this.initPresets()
		this.initVariables()
		this.initFeedbacks()
	}

	async destroy() {
		this.stopPoll()
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		this.initConnection()
		this.refreshDefinitions()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Device IP',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'number',
				id: 'pollInterval',
				label: 'Poll Interval (ms)',
				width: 4,
				default: 500,
				min: 250,
				max: 60000,
			},
			{
				type: 'static-text',
				id: 'monitorInfo',
				width: 12,
				value:
					'The module polls only the events that buttons use in an action or feedback. If a button only shows an event variable, add the event below.',
			},
			{
				type: 'multidropdown',
				id: 'monitorEvents',
				label: 'Also Monitor Events',
				width: 12,
				default: [],
				choices: [{ id: 'all', label: 'All Events' }, ...(this.getEventChoices?.() ?? [])],
			},
			{
				type: 'checkbox',
				id: 'useAuth',
				label: 'Enable API Authentication',
				width: 12,
				default: false,
			},
			{
				type: 'textinput',
				id: 'username',
				label: 'Username',
				width: 6,
				isVisible: (options) => options.useAuth,
			},
			{
				type: 'textinput',
				id: 'apiKey',
				label: 'API Key',
				width: 6,
				isVisible: (options) => options.useAuth,
			},
			{
				type: 'static-text',
				id: 'rejectUnauthorizedInfo',
				width: 12,
				value: `
							<hr />
							<h5>WARNING</h5>
							This module rejects server certificates considered invalid for the following reasons:
							<ul>
								<li>Certificate is expired</li>
								<li>Certificate has the wrong host</li>
								<li>Untrusted root certificate</li>
								<li>Certificate is self-signed</li>
							</ul>
							<p>
								We DO NOT recommend turning off this option. However, if you NEED to connect to a host
								with a self-signed certificate you will need to set <strong>Unauthorized Certificates</strong>
								to <strong>Accept</strong>.
							</p>
							<p><strong>USE AT YOUR OWN RISK!<strong></p>
						`,
			},
			{
				type: 'dropdown',
				id: 'rejectUnauthorized',
				label: 'Unauthorized Certificates',
				width: 6,
				default: true,
				choices: [
					{ id: true, label: 'Reject' },
					{ id: false, label: 'Accept - Use at your own risk!' },
				],
			},
		]
	}

	initVariables() {
		const variables = getVariables.bind(this)()
		this.setVariableDefinitions(variables)
	}

	initFeedbacks() {
		const feedbacks = getFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets() {
		const presets = getPresets.bind(this)()
		this.setPresetDefinitions(presets)
	}

	initActions() {
		const actions = getActions.bind(this)()
		this.setActionDefinitions(actions)
	}

	refreshDefinitions() {
		this.initActions()
		this.initFeedbacks()
		this.initPresets()
		this.initVariables()
	}

	getMonitoredEventIds() {
		let monitorEvents = (this.config.monitorEvents ?? []).map((id) => `${id}`)
		if (monitorEvents.includes('all')) {
			return Object.keys(this.live_events)
		}
		let ids = new Set([...this.subscriptions.values(), ...monitorEvents])
		return [...ids].filter((id) => this.live_events[id])
	}

	// Called from action/feedback subscribe callbacks
	trackEvent(instanceId, eventId) {
		let before = this.getMonitoredEventIds().join(',')
		if (eventId === undefined || eventId === '') {
			this.subscriptions.delete(instanceId)
		} else {
			this.subscriptions.set(instanceId, `${eventId}`)
		}
		this.onMonitoredEventsChanged(before)
	}

	untrackEvent(instanceId) {
		let before = this.getMonitoredEventIds().join(',')
		this.subscriptions.delete(instanceId)
		this.onMonitoredEventsChanged(before)
	}

	onMonitoredEventsChanged(before) {
		let after = this.getMonitoredEventIds()
		if (after.join(',') === before) {
			return
		}
		this.initVariables()
		// Fetch newly monitored events now so their variables fill in before the next poll
		let previous = before.split(',')
		for (let id of after.filter((id) => !previous.includes(id))) {
			this.updateEventStatus(id).then(() => this.checkFeedbacks())
		}
	}

	getEventChoices() {
		return Object.values(this.live_events ?? {}).map((event) => ({
			id: `${event.id}`,
			label: event.name ? `${event.id}: ${event.name}` : `${event.id}`,
		}))
	}

	getAuthHeaders(request) {
		if (!this.config.useAuth) {
			return {}
		}
		// X-Auth-Key = md5(api_key + md5(url + user + api_key + expires)), where url is the
		// request path without query string, /api prefix, or trailing slash
		const md5 = (value) => createHash('md5').update(value).digest('hex')
		const path = `/${request}`.split('?')[0].replace(/\/+$/, '')
		const user = this.config.username ?? ''
		const apiKey = this.config.apiKey ?? ''
		const expires = String(Math.floor(Date.now() / 1000) + 30)

		return {
			'X-Auth-User': user,
			'X-Auth-Expires': expires,
			'X-Auth-Key': md5(apiKey + md5(path + user + apiKey + expires)),
		}
	}

	async sendRequest(method, request, body) {
		if (!this.config.rejectUnauthorized) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
		} else {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
		}
		let url = `https://${this.config.host}/${request}`

		// Status endpoints only support JSON, while commands only support XML
		let headers =
			method === 'GET'
				? { Accept: 'application/json', 'Content-type': 'application/json' }
				: { 'Content-Type': 'application/xml', Accept: 'application/xml' }

		let res
		try {
			res = await fetch(url, {
				method,
				headers: { ...headers, ...this.getAuthHeaders(request) },
				body: body ? new XMLBuilder({}).build(body) : undefined,
				signal: AbortSignal.timeout(REQUEST_TIMEOUT),
			})
		} catch (error) {
			let errorText = String(error)
			if (
				errorText.match('ETIMEDOUT') ||
				errorText.match('ENOTFOUND') ||
				errorText.match('ECONNREFUSED') ||
				error.name === 'TimeoutError'
			) {
				this.updateStatus(InstanceStatus.ConnectionFailure)
			}
			this.log('debug', `${method} ${request}: ${errorText}`)
			return null
		}

		if (res.status == 401) {
			this.updateStatus(InstanceStatus.BadConfig, 'Authentication Error')
			return null
		}

		this.updateStatus(InstanceStatus.Ok)

		let text = await res.text()
		if (!res.ok) {
			let message = this.getErrorMessage(text)
			this.log(method === 'GET' ? 'debug' : 'warn', `${method} ${request} failed (HTTP ${res.status}) ${message}`)
			return null
		}
		if (!text) {
			return {}
		}

		try {
			let data = method === 'GET' ? JSON.parse(text) : parser.parse(text)
			let message = method === 'GET' ? '' : this.getErrorMessage(data)
			if (message) {
				this.log('warn', `${method} ${request}: ${message}`)
			}
			return data
		} catch (error) {
			this.log('debug', `${method} ${request}: unable to parse response: ${error}`)
			return null
		}
	}

	getErrorMessage(data) {
		let text = typeof data === 'string' ? data.trim() : ''
		if (text) {
			try {
				data = parser.parse(text)
			} catch {
				return text
			}
		}
		let errors = data?.errors ?? data?.response?.errors
		if (errors) {
			let message = [errors.error ?? []]
				.flat()
				.map((error) => error?.message ?? error)
				.join(', ')
			// Some replies put the explanation next to the error, e.g. "Invalid command" plus "Live Event 27 is not running"
			return [message, errors.message].filter(Boolean).join(': ')
		}
		if (data?.response?.status === 'error') {
			return data.response.message ?? ''
		}
		// Some errors come back as plain text, e.g. "Input not found"
		return text.startsWith('<') ? '' : text
	}

	sendGetRequest(request) {
		return this.sendRequest('GET', request)
	}

	async sendPostRequest(request, body) {
		let result = await this.sendRequest('POST', request, body)

		// Refresh the event now so buttons show the result of the command, then again shortly
		// after, because the encoder applies some commands with a delay
		let eventId = request.match(/^live_events\/([^/]+)\//)?.[1]
		if (eventId && this.live_events[eventId]) {
			await this.updateEventStatus(eventId)
			this.checkFeedbacks()
			setTimeout(async () => {
				if (this.live_events[eventId]) {
					await this.updateEventStatus(eventId)
					this.checkFeedbacks()
				}
			}, COMMAND_SETTLE_DELAY)
		}
		return result
	}

	initConnection() {
		this.live_events = {}
		this.system = {}
		this.lastFullRefresh = 0

		this.startPoll()
		this.pollDevice()
	}

	startPoll() {
		this.stopPoll()

		this.poll = setInterval(() => {
			this.pollDevice()
		}, this.config.pollInterval || 500)
	}

	stopPoll() {
		if (this.poll) {
			clearInterval(this.poll)
			delete this.poll
		}
	}

	async pollDevice() {
		// Skip this tick if the previous poll is still waiting on the encoder
		if (this.polling) {
			return
		}
		this.polling = true

		try {
			if (Date.now() - this.lastFullRefresh >= FULL_REFRESH_INTERVAL) {
				this.lastFullRefresh = Date.now()
				await Promise.all([this.updateEventList(), this.updateSystemStatus()])
			}

			await Promise.all(this.getMonitoredEventIds().map((id) => this.updateEventStatus(id)))

			this.checkFeedbacks()
		} finally {
			this.polling = false
		}
	}

	async updateEventList() {
		let data = await this.sendGetRequest('live_events')
		if (!Array.isArray(data)) {
			return
		}

		let events = {}
		for (let eventData of data) {
			let liveEvent = eventData?.live_event
			if (!liveEvent?.id) {
				continue
			}
			events[liveEvent.id] = {
				...this.live_events[liveEvent.id],
				id: liveEvent.id,
				name: liveEvent.name,
				status: liveEvent.status ?? this.live_events[liveEvent.id]?.status,
			}
		}

		// Rebuild definitions only when events were added, removed or renamed
		let signature = (list) =>
			Object.values(list)
				.map((event) => `${event.id}:${event.name}`)
				.join('|')
		let changed = signature(events) !== signature(this.live_events)

		this.live_events = events
		if (changed) {
			this.refreshDefinitions()
		}

		let values = {}
		for (let event of Object.values(events)) {
			values[`event_${event.id}_name`] = event.name
		}
		this.setVariableValues(values)
	}

	async updateEventStatus(id) {
		let data = await this.sendGetRequest(`live_events/${id}/status`)
		let status = data?.live_event
		if (!status || !this.live_events[id]) {
			return
		}

		let inputs = Array.isArray(status.inputs) ? status.inputs : []
		let activeInput = inputs.find((input) => `${input.id}` === `${status.active_input}`)
		let alerts = Array.isArray(status.alerts) ? status.alerts : []
		let lastAlert = alerts[alerts.length - 1]

		// Each output is listed twice: once with its status and once with its start/stop/pause capabilities
		let outputs = {}
		for (let output of Array.isArray(status.outputs) ? status.outputs : []) {
			outputs[output.id] = { ...outputs[output.id], ...output, id: `${output.id}` }
		}

		let event = this.live_events[id]
		let outputsChanged = Object.keys(outputs).join(',') !== Object.keys(event.outputs ?? {}).join(',')
		event.status = status.status
		event.inputs = inputs
		event.outputs = outputs
		event.activeInputId = status.active_input
		event.activeInputLabel = activeInput?.input_label ?? ''
		event.alertCount = alerts.length

		if (outputsChanged) {
			this.initVariables()
		}

		let outputValues = {}
		for (let output of Object.values(outputs)) {
			outputValues[`event_${id}_output_${output.id}_status`] = output.output_status ?? ''
		}

		this.setVariableValues({
			...outputValues,
			[`event_${id}_status`]: status.status,
			[`event_${id}_average_fps`]: status.average_fps,
			[`event_${id}_duration`]: this.formatElapsed(status),
			[`event_${id}_active_input`]: event.activeInputLabel || status.active_input || '',
			[`event_${id}_audio_level`]: status.audio_level ?? '',
			[`event_${id}_alert_count`]: alerts.length,
			[`event_${id}_last_alert`]: lastAlert?.message ?? '',
		})
	}

	formatElapsed(status) {
		if (status.elapsed_time_in_words) {
			return status.elapsed_time_in_words
		}
		if (status.elapsed === undefined || status.elapsed === null || status.elapsed === '') {
			return ''
		}
		let elapsed = dayjs.duration(Number(status.elapsed), 'seconds')
		let hours = String(Math.floor(elapsed.asHours())).padStart(2, '0')
		return `${hours}:${elapsed.format('mm:ss')}`
	}

	async updateSystemStatus() {
		let data = await this.sendGetRequest('system_status.json')
		if (!data?.status) {
			return
		}

		let gpus = Array.isArray(data.gpu) ? data.gpu : []
		let gpuAverage = gpus.length ? gpus.reduce((sum, gpu) => sum + Number(gpu.pct), 0) / gpus.length : undefined

		this.system = {
			status: data.status,
			cpu: data.cpu?.pct,
			memory: data.mem?.pct,
			gpu: gpuAverage,
		}

		this.setVariableValues({
			system_status: data.status,
			system_cpu: data.cpu?.pct,
			system_memory: data.mem?.pct,
			system_gpu: gpuAverage === undefined ? '' : Math.round(gpuAverage),
		})
	}
}

runEntrypoint(ElementalLiveInstance, UpgradeScripts)
