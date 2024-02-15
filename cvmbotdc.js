const { Client, GatewayIntentBits, Events } = require('discord.js');
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages
	] 
});
const toml = require('toml');
const fs = require('fs')
const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
const prefix = config.dcbot.prefix
const cvmbot = require('./index.js');

client.on("messageCreate", async (message) => {
	if (message.content === prefix + "ping") {
		message.channel.send("pong");
	}	
});

function msgconnected(message) {
//	client.channels.fetch(config.dcbot.channel).then(channel => {channel.send("Connected!"); client.off("messageCreate", msgconnected);});
	const channel = client.channels.cache.get(config.dcbot.channel);
	channel.send("Connected!");
}

function chatlog(msg) {
	const channel = client.channels.cache.get(config.dcbot.channel);
	channel.send(msg);
}

function login(callback) {
	console.log("[DCBot] Connecting...");
	client.on('ready', () => { console.log(`[DCBot] ${client.user.tag} is Ready!`); callback("botready"); });
	client.once(Events.ClientReady, client => {client.channels.fetch(config.dcbot.channel).then(channel => { channel.send ("Connecting...")})});
	client.login(config.dcbot.token);
}

client.on('message', message => {
  if (!message.author.bot) {
    console.log(`[DCBot] ${message.author.tag} Says: ${message.content}`);
  }
});

module.exports = {
    login: login,
	client: client,
	msgconnected: msgconnected,
	chatlog: chatlog
};