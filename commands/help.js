const toml = require('toml');
const fs = require('node:fs');
const path = require('node:path');
//const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));

let command = {};
fs.readdirSync('./commands').forEach(file => {
    if (file.endsWith('.js')) {
        const cmdName = path.basename(file, '.js');
        command[cmdName] = require(path.join(__dirname, '.', file));
    } 
}); 

const cmd = Object.keys(command);

module.exports = function (chat, prefix) {
	chat(`My prefix is "${prefix}" ! Available Commands: ${cmd}`);
};