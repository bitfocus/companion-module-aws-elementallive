import { Regex, combineRgb } from '@companion-module/base'

const eventStatusChoices = [
	{ id: 'running', label: 'Running' },
	{ id: 'pending', label: 'Pending' },
	{ id: 'complete', label: 'Complete' },
	{ id: 'error', label: 'Error' },
	{ id: 'preprocessing', label: 'Preprocessing' },
	{ id: 'postprocessing', label: 'Postprocessing' },
]

/*const systemStatusChoices = [
		{ id: 'green_status', label: 'Running' },
		{ id: 'orange_status', label: 'Pending' },
	]
*/

export const actionOptions = {
	id: {
		id: 'id',
		type: 'textinput',
		label: 'Event ID',
		default: '',
		useVariables: { local: true },
		regex: Regex.SOMETHING,
	},
	mute: {
		id: 'mute',
		type: 'checkbox',
		label: 'Mute',
		default: true,
	},
	useVar: {
		id: 'useVar',
		type: 'checkbox',
		label: 'Use Variable?',
		default: false,
	},
	gain: {
		id: 'gain',
		type: 'number',
		label: 'Gain (dB)',
		default: 0,
		min: -60,
		max: 60,
		range: true,
		isVisible: (options) => !options.useVar,
	},
	gainVar: {
		id: 'gainVar',
		type: 'textinput',
		label: 'Gain (dB)',
		default: '0',
		useVariables: { local: true },
		regex: Regex.SOMETHING,
		tooltip: 'Variable should return a number between -60 and 60. Other values will be ignored.',
		isVisible: (options) => options.useVar,
	},
	duration: {
		id: 'duration',
		type: 'number',
		label: 'Duration',
		default: '',
		isVisible: (options) => !options.useVar,
	},
	durationVar: {
		id: 'durationVar',
		type: 'textinput',
		label: 'Duration',
		default: '0',
		useVariables: { local: true },
		regex: Regex.SOMETHING,
		tooltip: 'Variable should return a number between >= 0. Other values will be ignored.',
		isVisible: (options) => options.useVar,
	},
}

export const Colors = {
	White: combineRgb(255, 255, 255),
	Black: combineRgb(0, 0, 0),
	Gray: combineRgb(110, 110, 110),
	Red: combineRgb(200, 0, 0),
	Green: combineRgb(0, 200, 0),
	Orange: combineRgb(255, 102, 0),
}

export const feedbackOptions = {
	id: {
		type: 'number',
		label: 'Event ID',
		id: 'id',
		default: '',
		isVisible: (options) => !options.useVar,
	},
	idVar: {
		type: 'textinput',
		label: 'Event ID',
		id: 'idVar',
		default: '',
		useVariables: { local: true },
		regex: Regex.SOMETHING,
		isVisible: (options) => options.useVar,
	},
	useVar: {
		id: 'useVar',
		type: 'checkbox',
		label: 'Use Variable?',
		default: false,
	},
	status: {
		type: 'dropdown',
		label: 'Status',
		id: 'status',
		default: 'running',
		choices: eventStatusChoices,
	},
}
