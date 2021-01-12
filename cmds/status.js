// 0: apply
// 1: type
// 2: presence
// 3: text

const sub      = {
	APPLY:    0,
	SET:      0,
	SAVE:     0,
	TYPE:     1,
	KIND:     1,
	PRESENCE: 2,
	DOT:      2,
	TEXT:     3,
	STATUS:   3,
	RESET:    4
}
const type     = {
	PLAYING:   0,
	GAME:      0,
	STREAMING: 1,
	LISTENING: 2,
	WATCHING:  3
}
const presence = {
	ONLINE:       0,
	IDLE:         1,
	AWAY:         1,
	INVISIBLE:    2,
	HIDDEN:       2,
	DND:          3,
	DONOTDISTURB: 3
}

module.exports = {
	vars: {
		type: "PLAYING",
		status: "online",
		text: "Windows 9"
	},
	permissions: {group: ['owners']},
	exec(args, message) {
		let subc = args[0].toUpperCase()
		switch (sub[subc]) {
			case 0: // apply
				if (this.vars.type == undefined) return
				else if (this.vars.status==undefined) return
				else if (this.vars.text  == undefined) return
				else {
					message.client.user.setPresence({ activity: {name: this.vars.text, type: this.vars.type}, status: this.vars.status})
				}
				break
			case 1: // type
				switch (type[args[1].toUpperCase()]) {
					case 0:
						this.vars.type = "PLAYING"
						break
					case 1:
						this.vars.type = "STREAMING"
						break
					case 2:
						this.vars.type = "LISTENING"
						break
					case 3:
						this.vars.type = "WATCHING"
						break
					default:
						break
				}
				break
			case 2: // presence
				switch (presence[args[1].toUpperCase()]) {
					case 0:
						this.vars.status = "online"
						break
					case 1:
						this.vars.status = 'idle'
						break
					case 2:
						this.vars.status = 'invisible'
						break
					case 3:
						this.vars.status = 'dnd'
						break
					default:
						break
				}
				break
			case 3: // text
				args.shift()
				this.vars.text = args.join(' ')
				break
			case 4:
				message.client.user.setPresence({})
				
				break
			default:
				message.channel.send("I'm not sure what you mean-")
		}
	}
}