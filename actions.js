import { actionOptions } from './options'

export function getActions() {
	let actions = {
		startLiveEvent: {
			name: 'Start Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				const start = { start: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/start`, start)
			},
		},
		stopLiveEvent: {
			name: 'Stop Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				const stop = { stop: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/stop`, stop)
			},
		},
		cancelLiveEvent: {
			name: 'Cancel Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				const cancel = { cancel: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/cancel`, cancel)
			},
		},
		archiveLiveEvent: {
			name: 'Archive Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				const archive = { archive: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/archive`, archive)
			},
		},
		resetLiveEvent: {
			name: 'Reset Live Event',
			options: [actionOptions.id],
			callback: async (action) => {
				const reset = { reset: '' }
				this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/reset`, reset)
			},
		},
		muteAudio: {
			name: 'Mute/Unmute Audio',
			options: [actionOptions.id, actionOptions.mute],
			callback: async (action) => {
				if (action.options.mute) {
					const mute = { mute_audio: '' }
					this.sendPostRequest(`live_events/${await this.parseVariablesInString(action.options.id)}/mute_audio`, mute)
				} else {
					const unmute = { unmute_audio: '' }
					this.sendPostRequest(
						`live_events/${await this.parseVariablesInString(action.options.id)}/unmute_audio`,
						unmute,
					)
				}
			},
		},
		setAudioGain: {
			name: 'Set Audio Gain',
			options: [actionOptions.id, actionOptions.gain, actionOptions.gainVar, actionOptions.useVar],
			callback: async (action) => {
				const gain = action.options.useVar
					? Number(await this.parseVariablesInString(action.options.gainVar))
					: action.options.gain
				if (isNaN(gain) || gain < -60 || gain > 60) return
				const audioGain = { gain: gain }
				this.sendPostRequest(
					`live_events/${await this.parseVariablesInString(action.options.id)}/adjust_audio_gain`,
					audioGain,
				)
			},
		},
		insertSCTE35Message: {
			name: 'Insert SCTE35',
			options: [actionOptions.id, actionOptions.duration, actionOptions.durationVar, actionOptions.useVar],
			callback: async (action) => {
				const duration = action.options.useVar
					? Number(await this.parseVariablesInString(action.options.durationVar))
					: action.options.duration
				if (isNaN(duration) || duration < 0) return
				const spliceMessage = { cue_point: { duration: duration, splice_offset: 0 } }
				this.sendPostRequest(
					`live_events/${await this.parseVariablesInString(action.options.id)}/cue_point`,
					spliceMessage,
				)
			},
		},
	}
	return actions
}
