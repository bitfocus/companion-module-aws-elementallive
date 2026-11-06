import { combineRgb } from '@companion-module/base'

export function getFeedbacks() {
	const feedbacks = {}

	const ColorRed = combineRgb(200, 0, 0)
	const ColorGreen = combineRgb(0, 200, 0)
	const ColorOrange = combineRgb(255, 102, 0)

	const eventChoices = this.getEventChoices()
	const eventOption = {
		type: 'dropdown',
		label: 'Event',
		id: 'id',
		default: eventChoices[0]?.id ?? '',
		choices: eventChoices,
		allowCustom: true,
	}

	let eventStatusChoices = [
		{ id: 'running', label: 'Running' },
		{ id: 'pending', label: 'Pending' },
		{ id: 'complete', label: 'Complete' },
		{ id: 'error', label: 'Error' },
		{ id: 'preprocessing', label: 'Preprocessing' },
		{ id: 'postprocessing', label: 'Postprocessing' },
		{ id: 'cancelled', label: 'Cancelled' },
		{ id: 'archived', label: 'Archived' },
	]

	let systemStatusChoices = [
		{ id: 'green_status', label: 'Green' },
		{ id: 'orange_status', label: 'Orange' },
		{ id: 'red_status', label: 'Red' },
	]

	feedbacks['eventStatus'] = {
		type: 'boolean',
		name: 'Live Event Status',
		description: "Change style if an event's current status matches the selected status",
		defaultStyle: {
			bgcolor: ColorGreen,
		},
		options: [
			eventOption,
			{
				type: 'dropdown',
				label: 'Status',
				id: 'status',
				default: 'running',
				choices: eventStatusChoices,
			},
		],
		callback: (feedback) => {
			return this.live_events?.[`${feedback.options.id}`]?.status === feedback.options.status
		},
	}

	feedbacks['eventHasAlerts'] = {
		type: 'boolean',
		name: 'Live Event Has Alerts',
		description: 'Change style if an event has any active alerts',
		defaultStyle: {
			bgcolor: ColorRed,
		},
		options: [eventOption],
		callback: (feedback) => {
			return (this.live_events?.[`${feedback.options.id}`]?.alertCount ?? 0) > 0
		},
	}

	feedbacks['audioMuted'] = {
		type: 'boolean',
		name: 'Audio Muted',
		description:
			'Change style if audio was muted from Companion. The encoder does not report mute state, so changes made elsewhere are not reflected',
		defaultStyle: {
			bgcolor: ColorRed,
		},
		options: [eventOption],
		callback: (feedback) => {
			return this.live_events?.[`${feedback.options.id}`]?.muted === true
		},
	}

	feedbacks['activeInput'] = {
		type: 'boolean',
		name: 'Active Input',
		description: "Change style if the selected input is an event's active input",
		defaultStyle: {
			bgcolor: ColorGreen,
		},
		options: [
			eventOption,
			{
				type: 'dropdown',
				label: 'Select Input By',
				id: 'by',
				default: 'label',
				choices: [
					{ id: 'label', label: 'Input Label' },
					{ id: 'id', label: 'Input ID' },
				],
			},
			{
				type: 'textinput',
				label: 'Input',
				id: 'input',
				default: '',
			},
		],
		callback: (feedback) => {
			let event = this.live_events?.[`${feedback.options.id}`]
			if (!event || event.activeInputId === undefined) {
				return false
			}
			if (feedback.options.by === 'id') {
				return `${event.activeInputId}` === `${feedback.options.input}`
			}
			return event.activeInputLabel === feedback.options.input
		},
	}

	feedbacks['outputStatus'] = {
		type: 'boolean',
		name: 'Output Status',
		description: "Change style if an output's status matches the selected status",
		defaultStyle: {
			bgcolor: ColorGreen,
		},
		options: [
			eventOption,
			{
				type: 'textinput',
				label: 'Output ID',
				id: 'output',
				default: '',
			},
			{
				type: 'dropdown',
				label: 'Status',
				id: 'status',
				default: 'running',
				choices: [
					{ id: 'running', label: 'Running' },
					{ id: 'paused', label: 'Paused' },
					{ id: 'stopped', label: 'Stopped' },
					{ id: 'failed', label: 'Failed' },
				],
				allowCustom: true,
			},
		],
		callback: (feedback) => {
			let output = this.live_events?.[`${feedback.options.id}`]?.outputs?.[`${feedback.options.output}`]
			return output?.output_status === feedback.options.status
		},
	}

	feedbacks['systemStatus'] = {
		type: 'boolean',
		name: 'System Status',
		description: "Change style if the encoder's overall status matches the selected status",
		defaultStyle: {
			bgcolor: ColorOrange,
		},
		options: [
			{
				type: 'dropdown',
				label: 'Status',
				id: 'status',
				default: 'orange_status',
				choices: systemStatusChoices,
				allowCustom: true,
			},
		],
		callback: (feedback) => {
			return this.system?.status === feedback.options.status
		},
	}

	// Track which events are used on buttons so only those are polled
	for (let definition of Object.values(feedbacks)) {
		if (definition.options.some((option) => option.id === 'id')) {
			definition.subscribe = (info) => this.trackEvent(info.id, info.options.id)
			definition.unsubscribe = (info) => this.untrackEvent(info.id)
		}
	}

	return feedbacks
}
