module.exports = {
	slashType: 3,
	permissions: { group: ["owners"] },
	exec(args, message, command) {
		message.channel.send(args.join(' '))
	},
	execSlash(inter,args, client) {
		// reminder: respond within two seconds
		return new Promise((res, rej) => {
			res({type: 2})
			client.channels.fetch(inter.channel_id)
				.then(that => that.send(args.msg))
		})
	}
}