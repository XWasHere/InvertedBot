const config = require('./config.js');
module.exports = {
  //don't worry about anything here if you're using a fork of my bot unless you need to add more to it, the owner variable depends on what you set in config.js
  owner : config.ownerid,
  isOwner(usr) {
    if (usr.id == this.owner) {
      return true;
    }
    return false;
  }
};