const Discord=require('discord.js')
const fetch = require('node-fetch')

function stringFrom(arr, i) {
	return arr.slice(i).join(' ')
}

function CommandUI(message, args) {
	let channel = message.channel
	let sel = "-1"
	let user = message.author.id
	let msg
	let newembed
	let copts = new Map()

	function RootMenu() {
		let menu = new Discord.MessageEmbed()
		menu.setTitle('Slash Command Editor')
		menu.addField('COMMANDS', `
		Global <SEL GLOBAL>
		Guild  <SEL GUILD>
		Exit   <EXIT>
		`)
		menu.setFooter('ROOT')
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
				r.forEach(a => {
					menu.addField(a.id, a.name)
				})
				menu.setFooter('ROOT > ' + id)
				msg.edit(menu)
			},console.error)
	}
	channel.send(RootMenu())
		.then(m => msg = m)
	
	function cmd(m) {
		if (user != m.author.id) return
		c = m.content.split(' ')
		cmd = c[0].toUpperCase()
		if (cmd == 'EXIT') {
			col.stop()
			channel.send('Exited')
		}
		else if (cmd == 'SEL') {
			p1 = c[1].toUpperCase()
			if (p1 == 'GUILD') {
				if (c[2]) {
					sel = c[2]
				}
				else {
					sel = message.guild.id
				}
				GuildMenu(sel)
			}
			else if (p1 == 'GLOBAL') {
				
			}
		}
		else if (cmd == 'CREATE') {
			if (sel != "-1") {
				let cmenu = new Discord.MessageEmbed()
				cmenu.setTitle('Create Command')
				cmenu.addField('Name*', '(NULL)')
				cmenu.addField('Desc*', '(NULL)')
				cmenu.addField('Options','<SET OPTIONS>')
				msg.edit(cmenu)
				newcmd = {name: "(NULL)", description: "(NULL)"}
			}
		}
		else if (cmd == 'DELETE') {
			
		}
		else if (cmd == 'SET') {
			p1 = c[1].toUpperCase()
			if (p1 == 'NAME') {
				newcmd.name = c[2]
				let cmenu = new Discord.MessageEmbed()
				cmenu.setTitle('Create Command')
				cmenu.addField('Name*', `${newcmd.name}`)
				cmenu.addField('Desc*', `${newcmd.description}`)
				cmenu.addField('Options','<SET OPTIONS>')
				msg.edit(cmenu)
			}
			else if (p1 == 'DESCRIPTION') {
				newcmd.description = stringFrom(c, 2)
				let cmenu = new Discord.MessageEmbed()
				cmenu.setTitle('Create Command')
				cmenu.addField('Name*', `${newcmd.name}`)
				cmenu.addField('Desc*', `${newcmd.description}`)
				cmenu.addField('Options','<SET OPTIONS>')
				msg.edit(cmenu)
			}
		}
		else if (cmd == 'PARAM') {
			p1 = c[1].toUpperCase()
			if (p1 == 'CREATE') {
				p2 = c[2].toUpperCase()
				p3 = c[3]
				if (p2 == 'STRING') {
					copts.set(p3,{type: 3, name: c[3]})
				}
				else if (p2 == 'INT') {
					copts.set(p3,{type: 4, name: c[3]})
				}
				else if (p2 == 'BOOL') {
					copts.set(p3,{type: 5, name: c[3]})
				}
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
					if (p4 == 'TRUE') {
						copts.get(c[3]).required = true
					}
					if (p4 == 'FALSE') {
						copts.get(c[3]).required = false
					}
				}
			}
		}
		else if (cmd == 'WRITE') {
			newcmd.options = []
			for (v of copts) {
				newcmd.options.push(v[1])
			}

			console.log(newcmd)

			fetch(`https://discord.com/api/v8/applications/${process.env.clientid}/guilds/${sel}/commands`, {
				method: "POST",
				body: JSON.stringify(newcmd),
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
		}
	}
	let col = new Discord.MessageCollector(channel, cmd)
}

module.exports = {
	permissions: {group: ['owners']},
	exec(args,message) {
		manager = CommandUI(message, args)
	}
}