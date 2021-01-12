/**
function Command(pmgr) {
	this.permmanager = pmgr
	this.cname = undefined
	this.permissions = this.prototype.permissions
}
Command.prototype.checkperm = (user) => {
	let i
	for (i of this.permissions.group) {
		console.log(i)
		if (this.permmanager.groupHas(i, user) || i == 'everyone') {
			return true
		}
	}
	return false
}
Command.prototype.deny = (message) => {

}
Command.prototype.exec = (args, message) => {

}

Command.prototype.cname = undefined
Command.prototype.permissions = { group: ['everyone']}
module.exports = Command
*/
function checkPerm(cmd, user) {
	for (i of cmd.permissions.group) {
		if (globalThis.permissions.groupHas(i, user) || i == 'everyone') {
			return true
		}
	}
	return false
}
module.exports = {checkPerm: checkPerm}