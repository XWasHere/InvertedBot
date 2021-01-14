module.exports = {
	slashType: 3,
	permissions: { group: ["owners"] },
	exec(args, message, command) {
		message.channel.send(args.join(' '))
	},
	execSlash(req,res, args, client) {
		res.send('{type: 2}')
		client.channels.fetch(req.body.channel_id)
			.then(that => that.send(args.msg))
	}
}