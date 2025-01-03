const msg = "<h3>XSS Test Success!</h3>";
module.exports = {
    desc: 'Sends a test xss message',
    async execute(chat, xss, prefix, cmd) {
        const {permissions, botrole} = require('../../index.js');
        if (botrole === 'mod') {
            if (permissions.xss) {
                xss(msg)
            } else {
                chat("Sorry, i don't have permission to peform this task.")
            }
        } else if (botrole === 'admin') { xss(msg) }
        else {chat("Sorry, i don't have permission to peform this task.")}
    } 
}