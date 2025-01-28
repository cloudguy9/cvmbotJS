module.exports = {
    desc: 'Rolls a dice',
    async execute(chat) {
        const dice = Math.floor(Math.random() * 6) + 1 // Rolls 1-6
        chat(`You rolled ${dice}!`)
    }
}