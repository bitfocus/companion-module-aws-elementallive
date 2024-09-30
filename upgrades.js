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
]
