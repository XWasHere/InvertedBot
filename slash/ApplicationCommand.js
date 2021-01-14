const Discord = require('discord.js')
const Options = require('./options.js')

class ApplicationCommand {
	constructor(opts) {
		this.id = opts.id || undefined
		this.application_id = opts.application_id_id || undefined
		this.name = opts.name || ''
		this.description = opts.description || ''
		this.parameters = opts.parameters || new Discord.Collection()
		this.subcommands = opts.subcommands || new Discord.Collection()
		this.subcommandgroups = opts.subcommandgroups || new Discord.Collection()
		if (opts.options) {
			opts.options.forEach(v => {
				if (Enum.ApplicationCommandOptionType[v.type] == 1) {
					let sub = new Options.Subcommand()

					this.subcommands.set(v.name, sub)
				}
				else if (v.type == 2) {
					let sub = new Options.SubcommandGroup()

					this.subcommandgroups.set(v.name, sub)
				}
				else 
				{
					let param = new Options.ValueOption()

					this.parameters.set(v.name, param)
				}
			})
		}
	}

	toDiscordType() {
		let real = {}
		real.name = this.name
		real.description = this.description
		real.options = []
		this.parameters.each(v => {
			real.options.push(v.toDiscordType())
		})
		this.subcommands.each(v => {
			real.options.push(v.toDiscordType())
		})
		return real
	}
}

module.exports = ApplicationCommand