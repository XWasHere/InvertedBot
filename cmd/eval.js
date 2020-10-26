perms = require("../perms.js");
module.exports = {
  name: 'eval',
  description: 'runs your shitty code on the InvertedBot server',
  execute(message, args) {
    if (perms.isOwner(message.author)) {
      eval(message.content.slice(prefix.length+1).trim());
    }
    else {
      return message.channel.send("you arent x >:(");
    }
  }
};