export function getVariables() {
	const variables = []

	//System Variables
	variables.push({
		name: `System Status`,
		variableId: `system_status`,
	})
	variables.push({
		name: `System CPU (%)`,
		variableId: `system_cpu`,
	})
	variables.push({
		name: `System Memory (%)`,
		variableId: `system_memory`,
	})
	variables.push({
		name: `System GPU (%)`,
		variableId: `system_gpu`,
	})

	//Event Specific Variables
	for (let x in this.live_events) {
		let event = this.live_events[x]
		variables.push({
			name: `Event ${event.id} - Name`,
			variableId: `event_${event.id}_name`,
		})
	}

	// Status variables only update for polled events, so only define them for those
	for (let id of this.getMonitoredEventIds()) {
		let event = this.live_events[id]

		variables.push({
			name: `Event ${event.id} - Status`,
			variableId: `event_${event.id}_status`,
		})
		variables.push({
			name: `Event ${event.id} - Average FPS`,
			variableId: `event_${event.id}_average_fps`,
		})
		variables.push({
			name: `Event ${event.id} - Duration`,
			variableId: `event_${event.id}_duration`,
		})
		variables.push({
			name: `Event ${event.id} - Active Input`,
			variableId: `event_${event.id}_active_input`,
		})
		variables.push({
			name: `Event ${event.id} - Audio Level`,
			variableId: `event_${event.id}_audio_level`,
		})
		variables.push({
			name: `Event ${event.id} - Alert Count`,
			variableId: `event_${event.id}_alert_count`,
		})
		variables.push({
			name: `Event ${event.id} - Last Alert`,
			variableId: `event_${event.id}_last_alert`,
		})

		for (let outputId in event.outputs) {
			variables.push({
				name: `Event ${event.id} - Output ${outputId} Status`,
				variableId: `event_${event.id}_output_${outputId}_status`,
			})
		}
	}
	return variables
}
