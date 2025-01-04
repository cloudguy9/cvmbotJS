const toml = require('toml');
const fs = require('node:fs');
const path = require('node:path');

const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
const prefix = config.bot.prefix;

let command = {};
fs.readdirSync('./files/commands').forEach(file => {
    if (file.endsWith('.js')) {
        const cmdName = path.basename(file, '.js');
        command[cmdName] = require(path.join(__dirname, '.', file));
    } 
}); 

module.exports = {
    desc: 'Sends a minimal list of available commands',
    async execute(chat, xss, prefix, cmd) {
        cmdname = cmd[3].slice(prefix.length).trim().split(' ')[0];
        const args = cmd[2].trim().split(' ');

        if(args.length===1){
            chat(`My prefix is "${prefix}" ! Available Commands: ${Object.keys(command).join(', ')}`);
            chat(`Do ${prefix}help  for more info!`);
        } else if(args.length===2){
            if (command[args[1]]) {
                if (command[args[1]].desc) {
                    chat(command[args[1]].desc)
                } else {chat(`Oops, ${args[1]} doesn't have a description set.`)}
            }
        }
    }
}