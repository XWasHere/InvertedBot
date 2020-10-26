const config = require('./config.js');
const perms = require('./perms.js');
const cpanel = require('./controlpanel.js');

const fetch = require('node-fetch');
const url = require('url');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
const prefix = '>';

sessions = {};

var crypto = require('crypto');

var generate_key = function() {
	// 16 bytes is likely to be more than enough,
	// but you may tweak it to your needs
	return crypto.randomBytes(16).toString('base64');
};

function login(username, password) {}

function getSession(sid) {
  if (sid === null || !sessions[sid]) {
    console.log(`session ${sid} does not exist`);
    return {id:-1};
  }
  return sessions[sid];
}

app.use(cookieParser());

app.get('/panel', (req, res) => {
  var session = getSession(req.cookies.session);
  if (perms.isOwner(session.id)) {
    adminoptions = `<a href="/API/Kill/">Kill bot</a>`;
  } else {adminoptions = "";}
  var html = `<!DOCTYPE HTML>
  <html>
  <head>
  <title>InvertedBot Control Panel</title>
  </head>
  <body>
  ${adminoptions}
  </body>
  </html>`;
  res.send(html);
});

app.get('/API/', (req, res) =>
	res.send('Hm. Hello remote user. What are you doing on my API?')
);

app.get('/auth/login', (req, resp) => {});

app.get('/auth/dis', (req, res) => {
	const urlObj = url.parse(req.url, true);
	const authCode = urlObj.query.code;
	console.log(authCode);
	const authdata = {
		client_id: process.env.clientid,
		client_secret: process.env.clientsecret,
		grant_type: 'authorization_code',
		redirect_uri: 'https://invertedbot.xwashere.repl.co/auth/dis',
		code: authCode,
		scope: 'identify'
	};
	fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams(authdata),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	})
		.then(res => res.json())
		.then(info =>
			fetch('https://discord.com/api/users/@me', {
				headers: {
					authorization: `${info.token_type} ${info.access_token}`
				}
			})
		)
		.then(res => res.json())
		.then(id => {
			const sid = generate_key();
			console.log(`assigned ${id} session id ${sid}`);
			sessions[sid] = {
				id: id,
				admin: false
			};
			if (perms.isOwner(id)) {
				sessions[sid]['admin'] = true;
				console.log(
					`set admin rights for ${id} to true, this is likely just x being x`
				);
			}
			res.cookie('session', sid, {
				expires: new Date(Date.now() + 3600000) // cookie will be removed after 1 hour
			});
			res.redirect(301, "/panel");
			res.end();
		});
});

app.get("/API/Kill",(req, res) => {
  var session = getSession(req.cookies.session);
  if (perms.isOwner(session.id)) {
    console.log(`bot killed by ${session.id}`);
    process.exit(0);
  } else {
    res.sendStatus(401);
  }
});

app.listen(port, () => console.log(`listening for requests on port ${port}`));

// ================= START BOT CODE===================

const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs
	.readdirSync(config.cmddir)
	.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`${config.cmddir}/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

// cmd handler
function handle(message) {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;
	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply(error.stack);
	}
}

//events
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', handle);

client.login(process.env.discordtoken);
