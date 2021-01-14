'use strict'
const Enum = require('./enum.js')
const Discord = require('discord.js')
class BaseOption {
	constructor(type) {
		this.type = type
		this.name = ''
		this.description = ''
	}
}

class ValueOption extends BaseOption {
	constructor(type) {
		super(type)
		this.required = false
		this.default = false
	}

	toDiscordType() {
		let real = {}
		real.type = this.type
		real.name = this.name
		real.description = this.description
		real.required = this.required
		real.default = this.default
		return real
	}
}

class SubcommandGroup extends BaseOption {
	constructor(opts) {
		super(Enum.ApplicationCommandOptionType.SUB_COMMAND_GROUP)
		this.subcommands = new Discord.Map()
	}
}

class Subcommand extends BaseOption {
	constructor(opts) {
		super(Enum.ApplicationCommandOptionType.SUB_COMMAND)
		this.parameters = new Discord.Collection()
	}
	toDiscordType() {
		let real = {}
		real.type = this.type
		real.name = this.name
		real.description = this.description
		real.options = []
		this.parameters.each(v => {
			real.options.push(v.toDiscordType())
		})
		return real
	}
}

module.exports = {ValueOption: ValueOption, SubcommandGroup: SubcommandGroup, Subcommand: Subcommand}