const cmddesc = {
    number: "Gives you random number of specified two between numbers.",
    help: "Sends a minimal list of available commands",
    test: "Sends a test message",
    xsstest: "Sends a test XSS Message if the bot has the permission to do so." 
}
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

module.exports = function (chat, xss, prefix, cmd) {
    cmdname = cmd[2].slice(prefix.length).trim().split(' ')[0];
    const args = cmd[2].trim().split(' ');

    if (args[0] === `${prefix}help`) {
        if(args.length===1){
            chat(`My prefix is "${prefix}" ! Available Commands: ${Object.keys(command).join(', ')}`);
            chat(`Do ${prefix}help  for more info!`);
        } else if(args.length===2){
          chat(cmddesc[args[1]])
        }
      }
};