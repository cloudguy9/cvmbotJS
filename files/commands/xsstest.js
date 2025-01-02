module.exports = function (chat, xss, prefix, cmd) {
    const {permissions} = require('../../index.js');
    if (permissions.xss) {
        xss('<h3>XSS Test Success!</h3>')
    } else {
        chat("Sorry, i don't have permission to peform this task.")
    }
}