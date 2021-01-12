const fs = require('fs')
const {Collection} = require('discord.js')

class PermissionGroup {
	static integrity(f) {
		if (!f.users) return false
		return true
	}
	
	constructor(mgr, data) {
		this.manager = mgr
		this.users = new Collection()
		let i
		for (i of data.users) {
			this.users.set(i, true)
		}
		this.name = data.name
		this.busy = false
	}

	contains(user) {
		if (typeof user == "string") {
			if (this.users.has(user)) return true
			else return false
		}
		else {
			if (this.users.has(user.user.id)) return true
			else return false
		}
	}
	
	removeUser(id) {
		this.users.sweep(i => i != id)
	}

	save() {
		return new Promise((res, rej) => {
			let savedata = {}
			savedata.users = [...this.users.values()]
			if (!PermissionGroup.integrity(savedata)) rej({
					err: 'Group integrity check failed. Unable to save',
					force: (function(){}) //not implemented
				})
			this.busy = true
			fs.writeFile(this.manager.pdir + '/g/' + this.name + '.group', JSON.stringify(savedata), (err) => {
				this.busy = false
				if (err) {
					rej(err)
					return
				}
				res()
			})
		})
	}
}

class PermissionManager {
	constructor(pdir) {
		this.pdir = pdir
		this.groups = new Collection()
		const pthis = this
		return new Promise((res, rej) => {
			//oh no...
			function b() {
				fs.readdir(pdir + '/g', (err, files) => {
					if (err) rej(err)
					let i
					for (i of files) {
						let path = pdir + '/g/' + i
						let data = fs.readFileSync(path, {encoding: 'utf-8'})
						let groupdata
						try {
							groupdata = JSON.parse(data)

							if (PermissionGroup.integrity(groupdata)) {
								let gname = i.replace(/\.group/, '')
								groupdata.name = gname
								let group = new PermissionGroup(pthis, groupdata)
								pthis.groups.set(gname, group)
							}
							else console.log(`corrupted group: ${i}. skipping.`)
						}
						catch {
							console.log(`corrupted group: ${i}, skipping`)
						}
					}
					res(pthis)
				})
			}
			function a() {
				if (!fs.existsSync(pdir + '/g')) {
					fs.mkdir(pdir + '/g', (err) => {
						if (err) rej(err)
						res(pthis)
					})
				}
				else b()
			}
			if (!fs.existsSync(pdir)) {
				fs.mkdir(pdir, (err) => {
					if (err) rej(err)
					a()
				})
			}
			else a()
		})
	}

	groupHas(group, member) {
		if (!this.groups.has(group)) {
			return false
		}
		if (this.groups.get(group).contains(member.user.id)) {
			return true
		}
		return false
	}

	createGroup(name) {
		return new Promise((res, rej) => {
			let g = new PermissionGroup(this, {users: [], name: name})
			g.save()
				.then(res, rej)
		})
	}

	addUserToGroup(group, id) {
		this.groups.get(group).addUser(id)
	}

	removeUserFromGroup(group, id) {
		this.groups.get(group).removeUser(id)
	}

	saveGroup(group) {
		return new Promise((res,rej) => {
			this.groups.get(group).save()
				.then(res, rej)
		})
	}
}

module.exports = {PermissionManager: PermissionManager, PermissionGroup: PermissionGroup}