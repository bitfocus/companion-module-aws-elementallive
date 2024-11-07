import { Colors, feedbackOptions } from './options.js'
export function getFeedbacks() {
	const feedbacks = {}

	feedbacks['eventStatus'] = {
		type: 'boolean',
		name: 'Live Event Status',
		description: "Change style if an event's current status matches the selected status",
		defaultStyle: {
			bgcolor: Colors.Green,
		},
		options: [feedbackOptions.id, feedbackOptions.idVar, feedbackOptions.status, feedbackOptions.useVar],
		callback: async (feedback, context) => {
			const id = feedback.options.useVar
				? await context.parseVariablesInString(feedback.options.idVar)
				: feedback.options.id.toString()
			return this.live_events?.[id]?.status === feedback.options.status
		},
	}

	return feedbacks
}
