const Discord = require('discord.js');
const {PermissionManager, PermissionGroups} = require('./Permissions.js');
const CommandManager = require('./CommandManager.js')
const DiscordInteractions = require("discord-interactions");
const express = require('express')
const bodyParser = require('body-parser')

// interactions api
app = express()
app.use(bodyParser.json());
app.post('/interactions', DiscordInteractions.verifyKeyMiddleware(process.env.pubkey), (req, res) => {
	if (req.body.type==1) {
		res.send('{"type":1}')
	}
	if (req.body.type==2) {
		commands.execSlash(req.body)
			.then(JSON.stringify)
			.then((data) => res.send(data))
	}
})
app.listen(8080)

// bot
const prefix = '>'

const client = new Discord.Client();
const commands = new CommandManager({client: client})

function init() {
	client.on('ready', main)
	client.login(process.env.discordtoken)
}

function main() {
	if (process.argv[2] == '-r') {
		
	}
	client.on('message', (msg) => {
		let message = msg.content
		if (!message.startsWith(prefix)) return

		const args = message.slice(prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();

		commands.runcommand(command, args, msg)
	})
}

new PermissionManager('./permissions')
	.then(p => {
		globalThis.permissions = p;
	}, console.error)
	.then(Promise.all(commands.loadAll()))
	.then(init, console.error)