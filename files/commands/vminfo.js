module.exports = {
    desc: "Sends VMName, and VM Description.",
    async execute(chat) {
        const {vmname, vmdesc} = require('../../index.js');
        chat(`Name: ${vmname}`);
        chat(`Description: ${vmdesc}`);
    }
}