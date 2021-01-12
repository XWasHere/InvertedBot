const Discord = require('discord.js')
const fs = require('fs')
const cmdlib = require('./cmds/_Command.js')
const util = require('./util.js')

class CommandManager {
	static cmddir = "./cmds/"
	constructor(opts) {
		this.commands = new Discord.Collection()
		this.loaded = new Discord.Collection()
		this.placeholder = require(CommandManager.cmddir + '_Reload.js')
		this.client = opts.client
	}

	execSlash(i) {
		let cmd = this.commands.get(i.data.name)
		let args = {}
		i.data.options.forEach(v => {
			args[v.name] = v.value
		})
		if (cmdlib.checkPerm(cmd, i.member)) {
			return cmd.execSlash(i, args, this.client)
		}
		else {
			return new Promise((res,rej) => {res({type:5})}) // lmao imagine everybody seeing what they put in there
		}
	}

	load(command, vars) {
		return new Promise((res, rej) => {
			let cmdpath = CommandManager.cmddir + command
			let cmdabs = require.resolve(cmdpath)
			//if (this.loaded.has(cmdabs)) {
			//	res()
			//	return
			//}
			let cmd = require(cmdabs)
			let cmdname = cmd.cname || command.replace(/\.js/,'')
			cmd._r    = command
			cmd._path = cmdabs
			cmd._name = cmdname
			cmd._placeholder = false
			cmd.vars = vars || cmd.vars || {}
			this.commands.set(cmdname, cmd)
			this.loaded.set(cmdabs, true)
			res()
		})
	}

	loadAll() {
		let rp = []
		fs.readdirSync(CommandManager.cmddir).forEach((v,i)=> {
			if (v.startsWith('_')) {
				return
			}
			rp.push(this.load(v))
		})
		return rp
	}

	reload(command) {
		return new Promise((res,rej) => {
			//console.log(command)
			let target  = command._path
			let name    = command._r
			let iname   = command._name
			let vars    = Object.assign({}, command.vars)

			require.cache[target] = undefined
			this.commands.set(iname, this.placeholder)
			this.loaded.set(target, false)
			this.load(name, vars)
				.then(res, rej)
		})
	}
	reloadAll() {
		let rp = []
		this.commands.each((v, i) => {
			//console.log(i)
			rp.push(this.reload(v))
		})
		return rp
	}


	reloadcmd(args,message) {
		//console.log('b')
		if (args[0] == 'core') {
			message.channel.send('Yay! Fresh code') // yes i know it sounds like pippy but i spent 5 minutes trying to think of something that didn't and failed lmao.
				.then(process.send(`reload`))
		}
		if (args[0] == 'commands') {
			message.channel.send('Oki, let me refresh my command list!')
			this.reloadAll()
		}
	}

	runcommand(command, args, message) {
		return new Promise((res,rej) => {
			if(command == 'reload') {
				if (cmdlib.checkPerm({permissions:{group:['owners']}}, message.member)) this.reloadcmd(args, message)
			}
			else if (this.commands.has(command)) {
				let cmd = this.commands.get(command)
				if (cmdlib.checkPerm(cmd, message.member)) {
					cmd.exec(args, message)
				}
				else {
					if (cmd.deny) cmd.deny(message)
				}
			}
			res()
		})
	}
}

module.exports =CommandManager