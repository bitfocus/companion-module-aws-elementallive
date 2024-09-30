import { combineRgb } from '@companion-module/base'

export function getFeedbacks() {
	const feedbacks = {}

	const ColorWhite = combineRgb(255, 255, 255)
	const ColorBlack = combineRgb(0, 0, 0)
	const ColorGray = combineRgb(110, 110, 110)
	const ColorRed = combineRgb(200, 0, 0)
	const ColorGreen = combineRgb(0, 200, 0)
	const ColorOrange = combineRgb(255, 102, 0)

	let eventStatusChoices = [
		{ id: 'running', label: 'Running' },
		{ id: 'pending', label: 'Pending' },
		{ id: 'complete', label: 'Complete' },
		{ id: 'error', label: 'Error' },
		{id: 'preprocessing', label: 'Preprocessing'},
		{id: 'postprocessing', label: 'Postprocessing'},
	]

	let systemStatusChoices = [
		{ id: 'green_status', label: 'Running' },
		{ id: 'orange_status', label: 'Pending' },
	]

	feedbacks['eventStatus'] = {
		type: 'boolean',
		name: 'Live Event Status',
		description: "Change style if an event's current status matches the selected status",
		defaultStyle: {
			bgcolor: ColorGreen,
		},
		options: [
			{
				type: 'number',
				label: 'Event ID',
				id: 'id',
				default: '',
			},
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

	return feedbacks
}
