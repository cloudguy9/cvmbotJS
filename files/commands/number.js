const toml = require('toml');
const fs = require('node:fs');
const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));

module.exports = {
    desc: 'Sends a random number with two numbers given by user',
    async execute(chat, xss, cmd) {
        const args = cmd[2].trim().split(' ');
        const min = parseInt(args[1]);
        const max = parseInt(args[2]);

        if (isNaN(min) || isNaN(max)) {chat(`Usage: ${config.bot.prefix}number <min> <max>`);return}; // If returned not an number (or no usage), sends usage
        if (min >= max) {chat("Min value should be less than max value.");return}; // If B (Max) is bigger than A (Min), let user know.

        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        chat(`Random number between ${min} and ${max} is ${randomNumber}.`);
    }
}