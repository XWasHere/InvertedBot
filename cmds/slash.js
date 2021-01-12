const Discord=require('discord.js')
const fetch = require('node-fetch')

class ApplicationCommand {
	constructor() {
		this.id = undefined
		this.application_id = undefined
		this.name = undefined
		this.description = undefined
		this.options = new Discord.Collection()
		this.subs = new Discord.Collection()
		this.subgroups = new Discord.Collection()
	}
}

class ApplicationCommandOption {

}

function stringFrom(arr, i) {
	return arr.slice(i).join(' ')
}

function CommandUI(message, args) {
	let channel = message.channel
	let sel = "-1"
	let user = message.author.id
	let msg
	let newcmd

	function RootMenu() {
		let menu = new Discord.MessageEmbed()
		menu.setTitle('Slash Command Editor')
		menu.setDescription(`
		Global <SEL GLOBAL>
		Guild  <SEL GUILD>
		Exit   <EXIT>
		`)
		return menu
	}

	function GuildMenu(id) {
		fetch(`https://discord.com/api/v8/applications/${process.env.clientid}/guilds/${id}/commands`, {
			headers: {
				authorization: `Bot ${process.env.discordtoken}`
			}
		})
			.then(r => r.json())
			.then(r => {
				let menu = new Discord.MessageEmbed()
				menu.setTitle(`Commands for ${id}`)
				menutext = ""
				r.forEach(a => {
					menutext += `${a.name} (${a.id})\n`
				})
				menu.setDescription(menutext)
				msg.edit(menu)
			})
	}

	function CMenuRoot() {
		let cmenu = new Discord.MessageEmbed()
		let paramStr = ''
		newcmd.each((v, i) => {
			if (i.type in [3,4,5,6,7,8]) {
				paramStr += '()'
			}
		})
		cmenu.setTitle('Create Command')
		cmenu.addField('General', `
		Name*: ${newcmd.name} 
		Description*: ${newcmd.description}
		`)
		cmenu.addField('Paramaters', paramStr)
		msg.edit(cmenu)
	}

	channel.send(RootMenu())
		.then(m => msg = m)
	
	function cmd(m) {
		if (user != m.author.id) return
		c = m.content.split(' ')
		if (c[1]) p1 = c[1].toUpperCase()
		switch (c[0].toUpperCase()) {
			case 'EXIT':
				col.stop()
				channel.send('Exited')
				break
			case 'SEL':
				if (p1 == 'GUILD') {
					if (c[2]) sel = c[2]
					else sel = message.guild.id
					GuildMenu(sel)
				}
				else if (p1 == 'GLOBAL') {
					
				}
				break
			case 'CREATE':
				if (sel != "-1") {
					newcmd = new UnpreparedCommand()
					CMenuRoot()
				}
				break
			case 'DELETE':
				break
			case 'SET':
				if (p1 == 'NAME') {
					newcmd.name = c[2]
					CMenuRoot()
				}
				else if (p1 == 'DESCRIPTION') {
					newcmd.description = stringFrom(c, 2)
					CMenuRoot()
				}
				break
			case 'PARAM':
				if (p1 == 'CREATE') {
					p2 = c[2].toUpperCase()
					p3 = c[3]
					if (p2 == 'STRING') copts.set(p3,{type: 3, name:p3})
					else if (p2 == 'INT') copts.set(p3,{type: 4, name: p3})
					else if (p2 == 'BOOL') copts.set(p3,{type: 5, name: p3})
				}
				else if (p1 == 'SET') {
					p2 = c[2].toUpperCase()
					if (p2 == 'DESCRIPTION') {
						p3 = c[3]
						args2 = stringFrom(c, 4)
						copts.get(p3).description = args2
					}
					else if (p2 == 'REQUIRED') {
						p4 = c[4].toUpperCase()
						if (p4 == 'TRUE') copts.get(c[3]).required = true
						else if (p4 == 'FALSE') copts.get(c[3]).required = false
					}
				}
				break
			case 'WRITE':
				console.log(newcmd)

				fetch(`https://discord.com/api/v8/applications/${process.env.clientid}/guilds/${sel}/commands`, {
					method: "POST",
					body: JSON.stringify(newcmd.prepare()),
					headers: {
						"Content-Type":"application/json",
						"Authorization": `Bot ${process.env.discordtoken}`
					}
				})
					.then(r => {
						r.json().then(j => {
							GuildMenu(sel)
						})
					})
				break
		}
	}
	let col = new Discord.MessageCollector(channel, cmd)
}

module.exports = {
	permissions: {group: ['owners']},
	exec(args,message) {
		//manager = CommandUI(message, args)
	}
}