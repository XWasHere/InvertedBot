const fs                 = require('fs')
const fetch              = require('node-fetch')
const Discord            = require('discord.js')
const ApplicationCommand = require('./ApplicationCommand.js')
const Enum               = require('./enum.js')
const Options            = require('./options.js')
const EventEmitter       = require('events')

function Collection(o) {
	let c = new Discord.Collection()
	Object.keys(o).forEach(k => {
		c.set(k, o[k])
	})
	return c
}

class SlashCommandManager extends EventEmitter {
	constructor(opts) {
		super()
		this.file = opts.filename
		this.appid= opts.appid
		this.token= opts.token
		this.choe = opts.commandsHaveOwnEvents || false
		this.commands = new Discord.Collection()
	}

	load() {
		return new Promise((res, rej) => {
			let cmdd = fs.readFileSync(this.file)
			let cmdj = JSON.parse(cmdd)
			Object.keys(cmdj).forEach(k => {((k, v) => {
				let cmddata = {}
				cmddata.name = k
				cmddata.description = v.description
				cmddata.parameters = new Discord.Collection()
				cmddata.subcommands= new Discord.Collection()
				let p = v.parameters || {}
				let cmdparams = Collection(p)
				cmdparams.each((v,k) => {
					let o = new Options.ValueOption(Enum.ApplicationCommandOptionType[v.type])
					o.name = k
					o.description = v.description
					o.default = v.default || false
					o.required = v.required || false
					cmddata.parameters.set(k, o)
				})
				let subcmds = Collection(v.subcommands || {})
				subcmds.each((v,k) => {
					console.log(v)
					let s = new Options.Subcommand()
					s.name = k
					s.description=k.description
					Collection(v.parameters||{}).each((v,k) => {
						let o = new Options.ValueOption(Enum.ApplicationCommandOptionType[v.type])
						o.name = k
						o.description = v.description
						o.default = v.default || false
						o.required = v.required || false
						s.parameters.set(k,o)
					})
					cmddata.subcommands.set(k,s)
				})
				let c = new ApplicationCommand(cmddata)
				this.commands.set(k, c)
			})(k, cmdj[k])})
		})
	}

	sync() {
		return new Promise((res, rej) => {
			fetch(`https://discord.com/api/v8/applications/${this.appid}/commands`, {
				headers: {
					Authorization: `Bot ${this.token}`
				}
			})
				.then(r=>{r.json().then(async j=>{
					if (j.code == 50035) {
						console.error(JSON.stringify(j.errors))
					}
					let serverCommands= new Discord.Collection()
					let has = {}
					let needsDelete = []
					this.commands.each((_, k) => {
						has[k]=0
					})
					let ids = {}
					j.forEach(v => {
						if (this.commands.get(v.name)) {
							has[v.name]=1
							if (!this.commands.get(v.name).toDiscordType().options == (v.options||{})) {
								has[v.name]=2
								ids[v.name] = v.id
							}
						}
						else {
							has[v.name]=3
							ids[v.name] = v.id
							
						}
						
						
					})
					let i
					for (i of Object.entries(has)) {
						if (i[1]==0||i[1]==2) {
							console.log(i[1])
							let cmd = this.commands.get(i[0])
							let exists = i[1]==2
							await fetch(exists?`https://discord.com/api/v8/applications/${this.appid}/commands/${ids[i[0]]}`:`https://discord.com/api/v8/applications/${this.appid}/commands`, {
								method: exists?'PATCH':'POST',
								body: JSON.stringify(cmd.toDiscordType()),
								headers: {
									Authorization: `Bot ${this.token}`,
									'Content-Type': 'application/json'
								}
							})
								.then(r=>{r.json().then(j=>{
									if (j.code == 50035) {
										console.error(JSON.stringify(j.errors))
									}
								})})
						}
						if (i[1]==3) {
							await fetch(`https://discord.com/api/v8/applications/${this.appid}/commands/${ids[i[0]]}`, {
								method: 'DELETE',
								headers: {
									Authorization: `Bot ${this.token}`
								}
							})
						}
					}
				})})
		})
	}

	handleInteraction(req, res) {
		console.dir(req.body, {depth:null})
		let args = {}
		let i
		for (i of req.body.data.options) {
			args[i.name] = i.value
		}
		this.emit('command',req.body.data.name, req, res, args)
	}
}

module.exports = SlashCommandManager