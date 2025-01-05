// https://github.com/computernewb/collab-vm-1.2-webapp/blob/master/src/ts/protocol/Guacutils.ts
function decode(string) {
	let pos = -1;
	let sections = [];

	for (;;) {
		let len = string.indexOf('.', pos + 1);

		if (len === -1) break;

		pos = parseInt(string.slice(pos + 1, len)) + len + 1;

		// don't allow funky protocol length
		if (pos > string.length) return [];

		sections.push(string.slice(len + 1, pos));

		const sep = string.slice(pos, pos + 1);

		if (sep === ',') continue;
		else if (sep === ';') break;
		// Invalid data.
		else return [];
	}

	return sections;
}

function encode(string) {
	let command = '';

	for (let i = 0; i < string.length; i++) {
		let current = string[i];
		command += current.toString().length + '.' + current;
		command += i < string.length - 1 ? ',' : ';';
	} return command;
}

module.exports = { encode, decode }