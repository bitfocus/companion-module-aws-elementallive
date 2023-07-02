import { combineRgb } from '@companion-module/base'

export function getPresets() {
	const ColorWhite = combineRgb(255, 255, 255)
	const ColorBlack = combineRgb(0, 0, 0)
	const ColorGray = combineRgb(110, 110, 110)
	const ColorRed = combineRgb(200, 0, 0)
	const ColorGreen = combineRgb(0, 200, 0)
	const ColorOrange = combineRgb(255, 102, 0)

	let presets = {}

	presets[`system_status`] = {
		type: 'button',
		category: 'System Status',
		name: `System Status`,
		options: {},
		style: {
			text: `System Status`,
			size: 14,
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'systemStatus',
				options: {
					status: `orange_status`,
				},
				style: {
					bgcolor: ColorOrange,
				},
			},
			{
				feedbackId: 'systemStatus',
				options: {
					status: `green_status`,
				},
				style: {
					bgcolor: ColorGreen,
				},
			},
		],
	}
	presets[`system_cpu`] = {
		type: 'button',
		category: 'System Status',
		name: `System CPU`,
		options: {},
		style: {
			text: `CPU\\n$(elemental:system_cpu)`,
			size: 14,
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [],
	}
	presets[`system_memory`] = {
		type: 'button',
		category: 'System Status',
		name: `System Memory`,
		options: {},
		style: {
			text: `Memory\\n$(elemental:system_memory)`,
			size: 14,
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [],
	}
	presets[`system_gpu`] = {
		type: 'button',
		category: 'System Status',
		name: `System GPU`,
		options: {},
		style: {
			text: `GPU\\n$(elemental:system_gpu)`,
			size: 14,
			color: ColorWhite,
			bgcolor: ColorBlack,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [],
	}

	for (let x in this.live_events) {
		let event = this.live_events[x]
		let id = event.id

		presets[`event_${id}_info`] = {
			type: 'button',
			category: 'Live Events',
			name: `Event ${id} Info`,
			options: {},
			style: {
				text: `$(elemental:event_${id}_name)\\n$(elemental:event_${id}_status)`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'eventStatus',
					options: {
						id: `${id}`,
						status: 'pending',
					},
					style: {
						bgcolor: ColorOrange,
					},
				},
				{
					feedbackId: 'eventStatus',
					options: {
						id: `${id}`,
						status: 'running',
					},
					style: {
						bgcolor: ColorGreen,
					},
				},
				{
					feedbackId: 'eventStatus',
					options: {
						id: `${id}`,
						status: 'complete',
					},
					style: {
						bgcolor: ColorGray,
					},
				},
				{
					feedbackId: 'eventStatus',
					options: {
						id: `${id}`,
						status: 'error',
					},
					style: {
						bgcolor: ColorRed,
					},
				},
			],
		}
		presets[`event_${id}_duration`] = {
			type: 'button',
			category: 'Live Events',
			name: `Event ${id} Duration`,
			options: {},
			style: {
				text: `$(elemental:event_${id}_status)\\n$(elemental:event_${id}_duration)`,
				size: 14,
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'eventStatus',
					options: {
						id: `${id}`,
						status: 'pending',
					},
					style: {
						bgcolor: ColorOrange,
					},
				},
				{
					feedbackId: 'eventStatus',
					options: {
						id: `${id}`,
						status: 'running',
					},
					style: {
						bgcolor: ColorGreen,
					},
				},
				{
					feedbackId: 'eventStatus',
					options: {
						id: `${id}`,
						status: 'complete',
					},
					style: {
						bgcolor: ColorGray,
					},
				},
				{
					feedbackId: 'eventStatus',
					options: {
						id: `${id}`,
						status: 'error',
					},
					style: {
						bgcolor: ColorRed,
					},
				},
			],
		}
		presets[`event_${id}_start`] = {
			type: 'button',
			category: 'Live Events',
			name: `Event ${id} Start`,
			options: {},
			style: {
				text: `⏵ START\\n$(elemental:event_${id}_name)`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'startLiveEvent',
							options: {
								id: `${id}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`event_${id}_stop`] = {
			type: 'button',
			category: 'Live Events',
			name: `Event ${id} Stop`,
			options: {},
			style: {
				text: `⏹ STOP\\n$(elemental:event_${id}_name)`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'stopLiveEvent',
							options: {
								id: `${id}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`event_${id}_reset`] = {
			type: 'button',
			category: 'Live Events',
			name: `Event ${id} Reset`,
			options: {},
			style: {
				text: `🔄 RESET\\n$(elemental:event_${id}_name)`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'resetLiveEvent',
							options: {
								id: `${id}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`event_${id}_start_icon`] = {
			type: 'button',
			category: 'Live Events',
			name: `Event ${id} Start Icon`,
			options: {},
			style: {
				text: `⏵`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'startLiveEvent',
							options: {
								id: `${id}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`event_${id}_stop_icon`] = {
			type: 'button',
			category: 'Live Events',
			name: `Event ${id} Stop`,
			options: {},
			style: {
				text: `⏹`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'stopLiveEvent',
							options: {
								id: `${id}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
		presets[`event_${id}_reset_icon`] = {
			type: 'button',
			category: 'Live Events',
			name: `Event ${id} Reset`,
			options: {},
			style: {
				text: `🔄`,
				size: 'auto',
				color: ColorWhite,
				bgcolor: ColorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'resetLiveEvent',
							options: {
								id: `${id}`,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}
	return presets
}
