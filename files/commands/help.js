const toml = require('toml');
const fs = require('node:fs');
const path = require('node:path');

let command = {};
fs.readdirSync('./files/commands').forEach(file => {
    if (file.endsWith('.js')) {
        const cmdName = path.basename(file, '.js');
        command[cmdName] = require(path.join(__dirname, '.', file));
    } 
}); 

const cmd = Object.keys(command);

module.exports = function (chat, prefix) {
	chat(`My prefix is "${prefix}" ! Available Commands: ${cmd}`);
};