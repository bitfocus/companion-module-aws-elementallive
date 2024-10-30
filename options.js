import { Regex } from '@companion-module/base'

export const actionOptions = {
	id: {
		id: 'id',
		type: 'textinput',
		label: 'Event ID',
		default: '',
		useVariables: true,
		regex: Regex.SOMETHING,
	},
	mute: {
		id: 'mute',
		type: 'checkbox',
		label: 'Mute',
		default: true,
	},
	gain: {
		id: 'gain',
		type: 'number',
		label: 'Gain (dB)',
		default: 0,
		min: -60,
		max: 60,
		range: true,
	},
	duration: {
		id: 'duration',
		type: 'number',
		label: 'Duration',
		default: '',
	},
}
