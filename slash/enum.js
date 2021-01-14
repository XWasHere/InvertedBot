'use strict'
const ApplicationCommandOptionType = {
	SUB_COMMAND: 1,
	SUB_COMMAND_GROUP: 2,
	STRING: 3,
	INTEGER: 4,
	BOOLEAN: 5,
	USER: 6,
	CHANNEL: 7,
	ROLE: 8
}

const InteractionType = {
	Ping: 1,
	ApplicationCommand: 2
}

const InteractionResponseType = {
	Pong: 1,
	Acknowledge: 2,
	ChannelMessage: 3,
	ChannelMessageWithSource: 4,
	AcknowledgeWithSource: 5
}

module.exports = {ApplicationCommandOptionType: ApplicationCommandOptionType, InteractionType: InteractionType, InteractionResponseType: InteractionResponseType}