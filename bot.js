const express = require('express');
const app = express();
const port = 3000;


// ================ START WEBSERVER CODE ==================
app.get('/', (req, res) => res.send('Hm. Hello remote user. What are you doing on my API?'));

app.listen(port, () => console.log(`listening for requests on port ${port}`));
// ================= END HTTPS CODE ===================
// ================= START BOT CODE ===================
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong!');
  }
});
// You really don't want your token here since your repl's code
// is publically available. We'll take advantage of a Repl.it 
// feature to hide the token we got earlier. 
client.login(process.env.DISCORD_TOKEN);