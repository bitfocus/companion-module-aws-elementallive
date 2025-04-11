import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { getActions } from './actions.js'
import { getPresets } from './presets.js'
import { getVariables } from './variables.js'
import { getFeedbacks } from './feedbacks.js'
import UpgradeScripts from './upgrades.js'

import fetch from 'node-fetch'
import { XMLBuilder } from 'fast-xml-parser'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration.js'
dayjs.extend(duration)

class ElementalLiveInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
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

	sendGetRequest(request) {
		if (!this.config.rejectUnauthorized) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
		} else {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
		}
		let url = `https://${this.config.host}/${request}`

		return fetch(url, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-type': 'application/json',
			},
		})
			.then((res) => {
				if (res.status == 200) {
					this.updateStatus(InstanceStatus.Ok)

					return res.text()
				} else if (res.status == 401) {
					this.updateStatus(InstanceStatus.BadConfig, 'Authentication Error')
				}
			})
			.then((data) => {
				let object = JSON.parse(data)
				if ('live_event' in object) {
					this.processStatus(object)
				} else {
					this.processData(object)
				}
			})
			.catch((error) => {
				let errorText = String(error)
				if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND') || errorText.match('ECONNREFUSED')) {
					this.updateStatus(InstanceStatus.ConnectionFailure)
				}
				this.log('debug', errorText)
			})
	}

	sendPostRequest(request, body) {
		if (!this.config.rejectUnauthorized) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
		} else {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
		}
		let output
		if (body) {
			let builder = new XMLBuilder({})
			output = builder.build(body)
		}

		let url = `https://${this.config.host}/${request}`

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'text/xml',
				Accept: 'application/xml',
			},
			body: output,
		})
			.then((res) => {
				if (res.status == 200) {
					this.updateStatus(InstanceStatus.Ok)

					return res.text()
				} else if (res.status == 401) {
					this.updateStatus(InstanceStatus.AuthenticationFailure, 'Authentication Error')
				}
			})
			.then((data) => {
				if (data) {
					let object = JSON.parse(data)
					this.processData(object)
				} else {
					this.log('debug', 'No response received')
				}
			})
			.catch((error) => {
				let errorText = String(error)
				if (errorText.match('ETIMEDOUT') || errorText.match('ENOTFOUND') || errorText.match('ECONNREFUSED')) {
					this.updateStatus(InstanceStatus.ConnectionFailure)
				}
				this.log('debug', errorText)
			})
	}

	initConnection() {
		this.live_events = {}
		this.system = {}
		this.sendGetRequest('live_events')

		this.startPoll()
	}

	startPoll() {
		this.stopPoll()

		this.poll = setInterval(() => {
			this.pollDevice()
		}, 500)
	}

	stopPoll() {
		if (this.poll) {
			clearInterval(this.poll)
			delete this.poll
		}
	}

	pollDevice() {
		this.sendGetRequest('live_events')
		this.checkFeedbacks()
	}

	processData(data) {
		data.forEach((eventData) => {
			let liveEventData = eventData.live_event
			let oldEventCount = Object.keys(this.live_events).length
			let newEventCount = Object.keys(data).length

			let changed = oldEventCount != newEventCount || oldEventCount === 0 ? true : false

			this.live_events[liveEventData.id] = { ...liveEventData }
			if (changed) {
				this.initVariables()
				this.initPresets()
			}
			this.setVariableValues({
				[`event_${liveEventData.id}_name`]: liveEventData.name,
			})

			this.sendGetRequest(`live_events/${liveEventData.id}/status`)
		})
	}

	processStatus(data) {
		this.live_events[data.live_event.id] = { ...this.live_events[data.live_event.id], ...data.live_event }
		this.setVariableValues({
			[`event_${data.live_event.id}_status`]: data.live_event.status,
			[`event_${data.live_event.id}_average_fps`]: data.live_event.average_fps,
		})
	}
}

runEntrypoint(ElementalLiveInstance, UpgradeScripts)
