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
	function v120(context, props) {
		// rejectUnauthorizedInfo
		let changed = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
		for (const action of props.actions) {
			switch (action.actionId) {
				case 'setAudioGain':
					action.options.useVar = action.options.useVar === undefined ? false : action.options.useVar
					action.options.gainVar = action.options.gainVar === undefined ? '0' : action.options.gainVar
					changed.updatedActions.push(action)
					break
				case 'insertSCTE35Message':
					action.options.useVar = action.options.useVar === undefined ? false : action.options.useVar
					action.options.durationVar = action.options.durationVar === undefined ? '0' : action.options.durationVar
					changed.updatedActions.push(action)
					break
				default:
					changed.updatedActions.push(action)
			}
		}
		for (const feedback of props.feedbacks) {
			switch (feedback.feedbackId) {
				case 'eventStatus':
					feedback.options.idVar = feedback.options.idVar === undefined ? '' : feedback.options.idVar
					feedback.options.useVar = feedback.options.useVar === undefined ? false : feedback.options.useVar
					changed.updatedFeedbacks.push(feedback)
					break
				default:
					changed.updatedFeedbacks.push(feedback)
			}
		}
		return changed
	},
]
