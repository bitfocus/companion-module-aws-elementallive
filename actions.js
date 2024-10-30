import { actionOptions } from './options'

export function getActions() {
	let actions = {
		startLiveEvent: {
			name: 'Start Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				let start = { start: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/start`, start)
			},
		},
		stopLiveEvent: {
			name: 'Stop Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				let stop = { stop: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/stop`, stop)
			},
		},
		cancelLiveEvent: {
			name: 'Cancel Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				let cancel = { cancel: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/cancel`, cancel)
			},
		},
		archiveLiveEvent: {
			name: 'Archive Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				let archive = { archive: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/archive`, archive)
			},
		},
		resetLiveEvent: {
			name: 'Reset Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				let reset = { reset: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/reset`, reset)
			},
		},
		muteAudio: {
			name: 'Mute/Unmute Audio',
			options: [actionOptions.id, actionOptions.mute],
			callback: async (action) => {
				if (action.options.mute) {
					let mute = { mute_audio: '' }
					this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/mute_audio`, mute)
				} else {
					let unmute = { unmute_audio: '' }
					this.sendPostRequest(
						`live_events/${await this.parseVariablesInString(action.options.id)}/unmute_audio`,
						unmute,
					)
				}
			},
		},
		setAudioGain: {
			name: 'Set Audio Gain',
			options: [actionOptions.id, actionOptions.gain],
			callback: async (action) => {
				let audioGain = { gain: action.options.gain }
				this.sendPostRequest(
					`live_events/${await this.parseVariablesInString(action.options.id)}/adjust_audio_gain`,
					audioGain,
				)
			},
		},
		insertSCTE35Message: {
			name: 'Insert SCTE35',
			options: [actionOptions.id, actionOptions.duration],
			callback: async (action) => {
				let spliceMessage = { cue_point: { duration: action.options.duration, splice_offset: 0 } }
				this.sendPostRequest(
					`live_events/${await this.parseVariablesInString(action.options.id)}/cue_point`,
					spliceMessage,
				)
			},
		},
	}
	return actions
}
