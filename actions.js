export function getActions() {
	let actions = {
		startLiveEvent: {
			name: 'Start Live Event',
			options: [
				{
					id: 'id',
					type: 'textinput',
					label: 'Event ID',
					default: '',
				},
			],
			callback: (action) => {
				let start = { start: '' }
				this.sendPostRequest(`live_events/${action.options.id}/start`, start)
			},
		},
		stopLiveEvent: {
			name: 'Stop Live Event',
			options: [
				{
					id: 'id',
					type: 'textinput',
					label: 'Event ID',
					default: '',
				},
			],
			callback: (action) => {
				let stop = { stop: '' }
				this.sendPostRequest(`live_events/${action.options.id}/stop`, stop)
			},
		},
		cancelLiveEvent: {
			name: 'Cancel Live Event',
			options: [
				{
					id: 'id',
					type: 'textinput',
					label: 'Event ID',
					default: '',
				},
			],
			callback: (action) => {
				let cancel = { cancel: '' }
				this.sendPostRequest(`live_events/${action.options.id}/cancel`, cancel)
			},
		},
		archiveLiveEvent: {
			name: 'Archive Live Event',
			options: [
				{
					id: 'id',
					type: 'textinput',
					label: 'Event ID',
					default: '',
				},
			],
			callback: (action) => {
				let archive = { archive: '' }
				this.sendPostRequest(`live_events/${action.options.id}/archive`, archive)
			},
		},
		resetLiveEvent: {
			name: 'Reset Live Event',
			options: [
				{
					id: 'id',
					type: 'textinput',
					label: 'Event ID',
					default: '',
				},
			],
			callback: (action) => {
				let reset = { reset: '' }
				this.sendPostRequest(`live_events/${action.options.id}/reset`, reset)
			},
		},
		muteAudio: {
			name: 'Mute/Unmute Audio',
			options: [
				{
					id: 'id',
					type: 'textinput',
					label: 'Event ID',
					default: '',
				},
				{
					id: 'mute',
					type: 'checkbox',
					label: 'Mute',
					default: true,
				},
			],
			callback: (action) => {
				if (action.options.mute) {
					let mute = { mute_audio: '' }
					this.sendPostRequest(`live_events/${action.options.id}/mute_audio`, mute)
				} else {
					let unmute = { unmute_audio: '' }
					this.sendPostRequest(`live_events/${action.options.id}/unmute_audio`, unmute)
				}
			},
		},
		setAudioGain: {
			name: 'Set Audio Gain',
			options: [
				{
					id: 'id',
					type: 'textinput',
					label: 'Event ID',
					default: '',
				},
				{
					id: 'gain',
					type: 'number',
					label: 'Gain (dB)',
					default: 0,
					min: -60,
					max: 60,
					range: true,
				},
			],
			callback: (action) => {
				let audioGain = { gain: action.options.gain }
				this.sendPostRequest(`live_events/${action.options.id}/adjust_audio_gain`, audioGain)
			},
		},
	}
	return actions
}
