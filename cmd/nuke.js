discord = require('discord.js');
require('../perms.js');
module.exports = {
	name: 'nuke',
	description: 'wipes a channel',
	execute(message, args) {
		if (message.member.hasPermission('MANAGE_MESSAGES')) {
			var force = true;
			var wipe = () => {
				var f = message.channel;
				var n = f.clone({
					reason: `Channel wiped by ${message.author.tag}<${message.author.id}>`
				});
				n.setParent(f.parent);
			};
			if (!args.includes('-force')) {
				force = false;
				var a = false;
				message.channel.send(
					'Are you sure you wish to nuke this channel. This will delete ALL messages, Including pinned ones. This action is irreversable'
				);

				var col = message.channel.createMessageCollector(
					m => {
						return (
							(m.content.includes('yes') || m.content.includes('no')) &&
							m.author.id == message.author.id
						);
					},
					{ time: 12000 }
				);

				col.on('collect', m => {
					if (m.content == 'yes') {
						a = true;
						col.stop();
					} else if (m.content == 'no') {
						a = false;
						col.stop();
					}
				});
				col.on('end', collected => {
					if (a) {
						wipe();
					} else {
						message.channel.send('Canceled');
					}
				});
			}
			if (force) {
				wipe();
			}
		}
	}
};
