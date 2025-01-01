module.exports = function (chat, xss, prefix) {
    const {permissions} = require('../../index.js');
    xss(`hi`);
    console.log(permissions.xss);
    if (permissions.xss) {
        xss('<h3>XSS Test Success!</h3>')
    } else {
        chat("Sorry, i don't have permission to peform this task.")
    }
}