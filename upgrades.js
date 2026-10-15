export default [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */
	function (context, props) {
		// rejectUnauthorizedInfo
		let changed = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
		if (props.config !== null) {
			let config = props.config
			if (config.rejectUnauthorized == undefined || config.rejectUnauthorized == '') {
				config.rejectUnauthorized = true
				changed.updatedConfig = config
			}
		}
		return changed
	},
	function (context, props) {
		// Event ID options are now dropdowns with string ids
		let changed = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
		for (let feedback of props.feedbacks) {
			if (feedback.feedbackId === 'eventStatus' && typeof feedback.options.id === 'number') {
				feedback.options.id = `${feedback.options.id}`
				changed.updatedFeedbacks.push(feedback)
			}
		}
		for (let action of props.actions) {
			if (action.actionId === 'insertSCTE35Message' && action.options.spliceOffset === undefined) {
				action.options.spliceOffset = 0
				action.options.eventId = 0
				changed.updatedActions.push(action)
			}
		}
		return changed
	},
]
