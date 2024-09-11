export function getVariables() {
	const variables = []

	//System Variables
	variables.push({
		name: `System CPU`,
		variableId: `system_cpu`,
	})
	variables.push({
		name: `System Memory`,
		variableId: `system_memory`,
	})
	variables.push({
		name: `System GPU`,
		variableId: `system_gpu`,
	})

	//Event Specific Variables
	for (let x in this.live_events) {
		let event = this.live_events[x]

		variables.push({
			name: `Event ${event.id} - Name`,
			variableId: `event_${event.id}_name`,
		})
		variables.push({
			name: `Event ${event.id} - Status`,
			variableId: `event_${event.id}_status`,
		})
		variables.push({
			name: `Event ${event.id} - Average FPS`,
			variableId: `event_${event.id}_average_fps`,
		})
		// variables.push({
		// 	name: `Event ${event.id} - Duration`,
		// 	variableId: `event_${event.id}_duration`,
		// })
	}
	return variables
}
