const cp = require('child_process')

bot = cp.spawn('node', ['./bot.js'], {
	stdio: [0, 0, 0, 'ipc']
})

function run() {
	bot.on('message', (message, sendHandle) => {
		console.log(message)
		if (message == "reload") {
			console.log('recieved reload signal')
			bot.kill('SIGTERM')
			bot = cp.spawn('node', ['./bot.js', '-r'], {
				stdio: [0, 0, 0, 'ipc']
			})
			run()
		}
	})
}

run()

const express = require('express')
app = express()

app.get('/', (req, res) => {
	res.send('')
})

app.listen(8080)
console.log('keepalive app opened')