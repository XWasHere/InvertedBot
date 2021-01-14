const Discord = require('discord.js');
const {PermissionManager, PermissionGroups} = require('./Permissions.js');
const CommandManager = require('./CommandManager.js')
const DiscordInteractions = require("discord-interactions");
const SlashLib = require('./slash')
const express = require('express')
const bodyParser = require('body-parser')

let slashCmdManager = new SlashLib.SlashManager({
	filename: './slashes.json',
	appid:    process.env.clientid,
	token:    process.env.discordtoken
})

let interactionManager = new SlashLib.InteractionsManager({
	slashManager: slashCmdManager
})

// interactions api
app = express()
app.use(bodyParser.json());
app.post('/interactions', DiscordInteractions.verifyKeyMiddleware(process.env.pubkey), (req, res) => interactionManager.handleInteraction(req, res))
app.listen(8080)

// bot
const prefix = '>'

const client = new Discord.Client();
const commands = new CommandManager({client: client, slashmgr: slashCmdManager})

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
	.then(slashCmdManager.load())
	.then(slashCmdManager.sync())
	.then(Promise.all(commands.loadAll()))
	.then(init, console.error)