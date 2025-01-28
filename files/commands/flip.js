module.exports = {
    desc: "Flips a coin",
    async execute(chat) {
        var rand = ['Heads', 'Tails'];
        return chat(`You landed ${rand[Math.floor(Math.random()*rand.length)]}!`); // Uses Math.floor & Math.random
    }
}