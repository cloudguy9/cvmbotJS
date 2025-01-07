module.exports = {
    desc: "View information of this VM.",
    async execute(chat) {
        const {vmname, vmdesc} = require('../../index.js');
        chat(`Name: ${vmname}`);
        chat(`Description: ${vmdesc}`);
    }
}