const SlashCommandManager = require('./SlashCommandManager.js')

class InteractionsManager {
	constructor(opts) {
		this.scm = opts.slashManager || new SlashCommandManager({filename: opts.filename})
	}

	handleInteraction(req, res) {
		if (req.body.type==1) {
			res.send('{"type":1}')
		}
		if (req.body.type==2) {
			this.scm.handleInteraction(req, res)
		}
	}
}

module.exports = InteractionsManager