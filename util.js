'use strict'
function constPromise(v) {
	function c(res, rej) {
		res(v)
	}
	return new Promise(c)
}

module.exports = {constPromise: constPromise}