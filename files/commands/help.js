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
    desc: 'Sends a minimal list of available commands', // Added in v2.0.2 (Later updated in v2.0.3 + it's better)
    async execute(chat, xss, cmd) {
        try {
            const args = cmd[2].trim().split(' '); 
            if(args.length===1){ // If user did not request for command's description
                chat(`My prefix is "${prefix}" ! Available Commands: ${Object.keys(command).join(', ')}`);
                chat(`Do ${prefix}help [command] for more info!`);
            } else if(args.length===2){ // If user requests for command's description
                if (command[args[1]]) { // This was fixed in v2.0.4 - Where user tries to request a command that doesn't exists.
                    if (command[args[1]].desc) { // If the command has description set
                        chat(command[args[1]].desc)
                    } else {chat(`${args[1]} doesn't have a description`)} // If not.
                }
            }
        } catch(error) { // Catch error!
            chat (`Something went wrong, check console for more details.`); console.log(error); // If the bot encounter an error, error logs will be outputted to console without crashing the bot.
        }
    }
}
