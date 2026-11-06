export function getActions() {
	const eventChoices = this.getEventChoices()
	const eventOption = {
		id: 'id',
		type: 'dropdown',
		label: 'Event',
		default: eventChoices[0]?.id ?? '',
		choices: eventChoices,
		allowCustom: true,
	}

	const setMuted = (id, muted) => {
		if (this.live_events[id]) {
			this.live_events[id].muted = muted
			this.checkFeedbacks('audioMuted')
		}
	}

	let actions = {
		startLiveEvent: {
			name: 'Start Live Event',
			options: [eventOption],
			callback: (action) => {
				let start = { start: '' }
				this.sendPostRequest(`live_events/${action.options.id}/start`, start)
			},
		},
		stopLiveEvent: {
			name: 'Stop Live Event',
			options: [eventOption],
			callback: (action) => {
				let stop = { stop: '' }
				this.sendPostRequest(`live_events/${action.options.id}/stop`, stop)
			},
		},
		cancelLiveEvent: {
			name: 'Cancel Live Event',
			options: [eventOption],
			callback: (action) => {
				let cancel = { cancel: '' }
				this.sendPostRequest(`live_events/${action.options.id}/cancel`, cancel)
			},
		},
		archiveLiveEvent: {
			name: 'Archive Live Event',
			options: [eventOption],
			callback: (action) => {
				let archive = { archive: '' }
				this.sendPostRequest(`live_events/${action.options.id}/archive`, archive)
			},
		},
		resetLiveEvent: {
			name: 'Reset Live Event',
			options: [eventOption],
			callback: (action) => {
				let reset = { reset: '' }
				this.sendPostRequest(`live_events/${action.options.id}/reset`, reset)
			},
		},
		muteAudio: {
			name: 'Mute/Unmute Audio',
			options: [
				eventOption,
				{
					id: 'mute',
					type: 'checkbox',
					label: 'Mute',
					default: true,
				},
			],
			callback: async (action) => {
				let id = action.options.id
				if (action.options.mute) {
					let mute = { mute_audio: '' }
					if (await this.sendPostRequest(`live_events/${id}/mute_audio`, mute)) setMuted(id, true)
				} else {
					let unmute = { unmute_audio: '' }
					if (await this.sendPostRequest(`live_events/${id}/unmute_audio`, unmute)) setMuted(id, false)
				}
			},
		},
		setAudioGain: {
			name: 'Set Audio Gain',
			options: [
				eventOption,
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
			callback: async (action) => {
				let id = action.options.id
				let audioGain = { gain: action.options.gain }
				// The encoder treats -60 dB as muted
				if (await this.sendPostRequest(`live_events/${id}/adjust_audio_gain`, audioGain)) {
					setMuted(id, action.options.gain <= -60)
				}
			},
		},
		activateInput: {
			name: 'Switch Input',
			description: 'Switch a running event to another input in its input list',
			options: [
				eventOption,
				{
					id: 'by',
					type: 'dropdown',
					label: 'Select Input By',
					default: 'label',
					choices: [
						{ id: 'label', label: 'Input Label' },
						{ id: 'id', label: 'Input ID' },
					],
				},
				{
					id: 'input',
					type: 'textinput',
					label: 'Input',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				let input = await context.parseVariablesInString(action.options.input)
				let key = action.options.by === 'id' ? 'input_id' : 'input_label'
				this.sendPostRequest(`live_events/${action.options.id}/activate_input`, {
					activate_input: { [key]: input },
				})
			},
		},
		prepareInput: {
			name: 'Prepare Input',
			description: 'Decode an input ahead of time so a later switch to it is faster',
			options: [
				eventOption,
				{
					id: 'by',
					type: 'dropdown',
					label: 'Select Input By',
					default: 'label',
					choices: [
						{ id: 'label', label: 'Input Label' },
						{ id: 'id', label: 'Input ID' },
						{ id: 'cancel', label: 'Cancel Preparation' },
					],
				},
				{
					id: 'input',
					type: 'textinput',
					label: 'Input',
					default: '',
					useVariables: true,
					isVisible: (options) => options.by !== 'cancel',
				},
				{
					id: 'slot',
					type: 'dropdown',
					label: 'Preparation Slot',
					default: 0,
					choices: [
						{ id: 0, label: '1' },
						{ id: 1, label: '2' },
					],
				},
				{
					id: 'perpetual',
					type: 'checkbox',
					label: 'Keep Prepared After Switching',
					default: false,
					isVisible: (options) => options.by !== 'cancel',
				},
			],
			callback: async (action, context) => {
				let options = action.options
				let prepare = {}
				if (options.by === 'cancel') {
					// This input ID tells the encoder to stop preparing the slot
					prepare.input_id = '0xffffffff'
				} else {
					let input = await context.parseVariablesInString(options.input)
					prepare[options.by === 'id' ? 'input_id' : 'input_label'] = input
					prepare.perpetual = options.perpetual
				}
				prepare.preparation_index = options.slot
				this.sendPostRequest(`live_events/${options.id}/prepare_input`, { prepare_input: prepare })
			},
		},
		activateImageOverlay: {
			name: 'Image Overlay - Show',
			description: 'Requires the event to be created with REST image insertion enabled',
			options: [
				eventOption,
				{
					id: 'uri',
					type: 'textinput',
					label: 'Image Path (on encoder)',
					default: '',
					useVariables: true,
				},
				{
					id: 'layer',
					type: 'number',
					label: 'Layer',
					default: 0,
					min: 0,
					max: 7,
				},
				{
					id: 'left',
					type: 'number',
					label: 'Left (px)',
					default: 0,
					min: 0,
					max: 7680,
				},
				{
					id: 'top',
					type: 'number',
					label: 'Top (px)',
					default: 0,
					min: 0,
					max: 4320,
				},
				{
					id: 'opacity',
					type: 'number',
					label: 'Opacity (%)',
					default: 100,
					min: 0,
					max: 100,
				},
				{
					id: 'width',
					type: 'number',
					label: 'Width (px, 0 = native)',
					default: 0,
					min: 0,
					max: 7680,
				},
				{
					id: 'height',
					type: 'number',
					label: 'Height (px, 0 = native)',
					default: 0,
					min: 0,
					max: 4320,
				},
				{
					id: 'duration',
					type: 'number',
					label: 'Duration (ms, 0 = until hidden)',
					default: 0,
					min: 0,
					max: 86400000,
				},
				{
					id: 'fadeIn',
					type: 'number',
					label: 'Fade In (ms)',
					default: 0,
					min: 0,
					max: 60000,
				},
				{
					id: 'fadeOut',
					type: 'number',
					label: 'Fade Out (ms)',
					default: 0,
					min: 0,
					max: 60000,
				},
			],
			callback: async (action, context) => {
				let options = action.options
				let image = {
					activate: true,
					layer: options.layer,
					image_inserter_input: { uri: await context.parseVariablesInString(options.uri) },
					image_x: options.left,
					image_y: options.top,
					// The encoder defaults to 50% opacity if this is left out
					opacity: options.opacity ?? 100,
				}
				if (options.width) image.width = options.width
				if (options.height) image.height = options.height
				if (options.duration) image.duration = options.duration
				if (options.fadeIn) image.fade_in = options.fadeIn
				if (options.fadeOut) image.fade_out = options.fadeOut

				this.sendPostRequest(`live_events/${options.id}/image_inserter`, { image_inserter: { image } })
			},
		},
		deactivateImageOverlay: {
			name: 'Image Overlay - Hide',
			options: [
				eventOption,
				{
					id: 'layer',
					type: 'number',
					label: 'Layer',
					default: 0,
					min: 0,
					max: 7,
				},
			],
			callback: (action) => {
				this.sendPostRequest(`live_events/${action.options.id}/image_inserter`, {
					image_inserter: { image: { activate: false, layer: action.options.layer } },
				})
			},
		},
		activateMotionOverlay: {
			name: 'Motion Overlay - Show',
			description:
				'Requires the event to be created with a motion image inserter that has REST control enabled. Leave the path empty to replay the current motion overlay',
			options: [
				eventOption,
				{
					id: 'uri',
					type: 'textinput',
					label: 'Asset Path (on encoder)',
					default: '',
					useVariables: true,
				},
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Asset Type',
					default: 'mov',
					choices: [
						{ id: 'mov', label: 'MOV' },
						{ id: 'png', label: 'PNG Sequence' },
						{ id: 'html', label: 'HTML5' },
					],
				},
				{
					id: 'fullFrame',
					type: 'checkbox',
					label: 'Full Frame',
					default: false,
					isVisible: (options) => options.mode !== 'html',
				},
				{
					id: 'left',
					type: 'number',
					label: 'Left (px)',
					default: 0,
					min: 0,
					max: 7680,
					isVisible: (options) => options.mode !== 'html' && !options.fullFrame,
				},
				{
					id: 'top',
					type: 'number',
					label: 'Top (px)',
					default: 0,
					min: 0,
					max: 4320,
					isVisible: (options) => options.mode !== 'html' && !options.fullFrame,
				},
				{
					id: 'loop',
					type: 'checkbox',
					label: 'Loop',
					default: false,
					isVisible: (options) => options.mode !== 'html',
				},
				{
					id: 'framerateNumerator',
					type: 'number',
					label: 'Frame Rate Numerator',
					default: 30000,
					min: 1,
					max: 120000,
					isVisible: (options) => options.mode === 'png',
				},
				{
					id: 'framerateDenominator',
					type: 'number',
					label: 'Frame Rate Denominator',
					default: 1001,
					min: 1,
					max: 120000,
					isVisible: (options) => options.mode === 'png',
				},
			],
			callback: async (action, context) => {
				let options = action.options
				// An empty action time starts the overlay now instead of at a previously set time
				let overlay = { action_time: '', active: true }
				let uri = (await context.parseVariablesInString(options.uri)).trim()
				if (uri) {
					// The encoder resets any field left out when the asset changes, so send them all
					overlay.insertion_mode = options.mode
					overlay.motion_image_inserter_input = { uri }
					if (options.mode !== 'html') {
						overlay.full_frame = options.fullFrame
						overlay.image_x = options.fullFrame ? 0 : options.left
						overlay.image_y = options.fullFrame ? 0 : options.top
						overlay.loop_input = options.loop
					}
					if (options.mode === 'png') {
						overlay.framerate_numerator = options.framerateNumerator
						overlay.framerate_denominator = options.framerateDenominator
					}
				}
				this.sendPostRequest(`live_events/${options.id}/motion_image_inserter`, {
					motion_image_inserter: overlay,
				})
			},
		},
		deactivateMotionOverlay: {
			name: 'Motion Overlay - Hide',
			options: [eventOption],
			callback: (action) => {
				this.sendPostRequest(`live_events/${action.options.id}/motion_image_inserter`, {
					motion_image_inserter: { action_time: '', active: false },
				})
			},
		},
		insertSCTE35Message: {
			name: 'SCTE-35 - Insert Avail (Cue Out)',
			options: [
				eventOption,
				{
					id: 'duration',
					type: 'number',
					label: 'Duration (seconds)',
					default: '',
				},
				{
					id: 'spliceOffset',
					type: 'number',
					label: 'Preroll (ms)',
					default: 0,
					min: 0,
					max: 600000,
				},
				{
					id: 'eventId',
					type: 'number',
					label: 'Splice Event ID (0 = auto)',
					default: 0,
					min: 0,
					max: 4294967295,
				},
			],
			callback: (action) => {
				let cuePoint = { duration: action.options.duration, splice_offset: action.options.spliceOffset ?? 0 }
				if (action.options.eventId) cuePoint = { event_id: action.options.eventId, ...cuePoint }
				this.sendPostRequest(`live_events/${action.options.id}/cue_point`, { cue_point: cuePoint })
			},
		},
		returnToNetwork: {
			name: 'SCTE-35 - Return to Network',
			options: [
				eventOption,
				{
					id: 'returnOffset',
					type: 'number',
					label: 'Return Offset (ms)',
					default: 0,
					min: 0,
					max: 600000,
				},
			],
			callback: (action) => {
				this.sendPostRequest(`live_events/${action.options.id}/cue_point`, {
					cue_point: { return_offset: action.options.returnOffset },
				})
			},
		},
		cancelSCTE35Message: {
			name: 'SCTE-35 - Cancel Avail',
			options: [
				eventOption,
				{
					id: 'eventId',
					type: 'number',
					label: 'Splice Event ID',
					default: 1,
					min: 1,
					max: 4294967295,
				},
			],
			callback: (action) => {
				this.sendPostRequest(`live_events/${action.options.id}/cue_point`, {
					cue_point: { cancel_event_id: action.options.eventId },
				})
			},
		},
		insertTimeSignal: {
			name: 'SCTE-35 - Insert Time Signal',
			options: [
				eventOption,
				{
					id: 'offset',
					type: 'number',
					label: 'Preroll (ms)',
					default: 0,
					min: 0,
					max: 600000,
				},
				{
					id: 'descriptors',
					type: 'textinput',
					label: 'Descriptors (hex, optional)',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				let timeSignal = { offset: action.options.offset }
				let descriptors = (await context.parseVariablesInString(action.options.descriptors)).trim()
				if (descriptors) timeSignal.descriptors = descriptors
				this.sendPostRequest(`live_events/${action.options.id}/time_signal`, { time_signal: timeSignal })
			},
		},
		outputControl: {
			name: 'Output - Start/Stop/Pause',
			description: 'Control a single output on a running event',
			options: [
				eventOption,
				{
					id: 'command',
					type: 'dropdown',
					label: 'Command',
					default: 'pause',
					choices: [
						{ id: 'start', label: 'Start' },
						{ id: 'stop', label: 'Stop' },
						{ id: 'pause', label: 'Pause' },
						{ id: 'unpause', label: 'Unpause' },
					],
				},
				{
					id: 'output',
					type: 'textinput',
					label: 'Output ID',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				let output = await context.parseVariablesInString(action.options.output)
				this.sendPostRequest(`live_events/${action.options.id}/${action.options.command}_output`, {
					output_id: output,
				})
			},
		},
		outputGroupControl: {
			name: 'Output Group - Start/Stop/Pause',
			description: 'Control an output group on a running event',
			options: [
				eventOption,
				{
					id: 'command',
					type: 'dropdown',
					label: 'Command',
					default: 'pause',
					choices: [
						{ id: 'start', label: 'Start' },
						{ id: 'stop', label: 'Stop' },
						{ id: 'pause', label: 'Pause' },
						{ id: 'unpause', label: 'Unpause' },
					],
				},
				{
					id: 'by',
					type: 'dropdown',
					label: 'Select Group By',
					default: 'id',
					choices: [
						{ id: 'id', label: 'Group ID' },
						{ id: 'name', label: 'Group Name' },
					],
				},
				{
					id: 'group',
					type: 'textinput',
					label: 'Group',
					default: '',
					useVariables: true,
				},
			],
			callback: async (action, context) => {
				let group = await context.parseVariablesInString(action.options.group)
				let key = action.options.by === 'name' ? 'group_name' : 'group_id'
				this.sendPostRequest(`live_events/${action.options.id}/${action.options.command}_output_group`, {
					[key]: group,
				})
			},
		},
	}
	// Track which events are used on buttons so only those are polled
	for (let definition of Object.values(actions)) {
		if (definition.options.some((option) => option.id === 'id')) {
			definition.subscribe = (info) => this.trackEvent(info.id, info.options.id)
			definition.unsubscribe = (info) => this.untrackEvent(info.id)
		}
	}

	return actions
}
