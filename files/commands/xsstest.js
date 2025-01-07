const msg = "<h3>XSS Test Success!</h3>";
module.exports = {
    desc: 'Sends a test xss message',
    async execute(chat, xss, cmd) {
        const {permissions, botrole} = require('../../index.js'); // Mentioned in index.js Line 87
        if (botrole === 'mod') {
            if (permissions.xss) { xss(msg) } // Checks if Bot has permission to send XSS.
            else {chat("Sorry, i don't have permission to peform this task.")} // Only if the server doesn't allow mods to have perm to send XSS.
        } else if (botrole === 'admin') { xss(msg) } // Check if bot is administrator. (Bug fix in v2.0.3)
        else {chat("Sorry, i don't have permission to peform this task.")} // Only If the bot isn't logged in.
    } 
}