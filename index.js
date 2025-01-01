// cvmBotJS v2.0.1 [Wednesday, January 1st, 2025] [Happy-New-Year!]
// By Gunawan092w [https://github.com/gunawan092w/cvmbotJS]

const WSClient = require('websocket').client;
const toml = require('toml');
const fs = require('node:fs');
const path = require('node:path');
const rl = require('readline') // I hate you.
const Permissions = require('./files/Permissions.js')

const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
const prefix = config.bot.prefix;

const Client = new WSClient();

// Loads all commands in commands folder
let command = {};

fs.readdirSync('./files/commands').forEach(file => {
    if (file.endsWith('.js')) {
        const cmdName = path.basename(file, '.js');
        command[cmdName] = require(path.join(__dirname, 'files', 'commands', file));
    } 
}); 

let readline;
let permissions;
function bot() {
	Client.removeAllListeners(); // Removes remaining listener

	Client.on('connectFailed',function(){;console.log(`Couldn't connect to VM! Retrying...`);retry()});
	Client.on('error',function(error){console.log("An error has accoured.){ " + error.toString())});
	Client.on('close',function(){reconnect()});

	readline = rl.createInterface({input: process.stdin, output: process.stdout});
	
	Client.on('connect', function(client){
		client.sendUTF(encode(['rename',config.bot.user])); // Bot sets Username
		console.log(`Connected to VM!`); // Success!
		
		function chat(message){client.sendUTF(encode(['chat',message]))}; // The Chat Function
		function xss(message){client.sendUTF(encode(["admin","21",message]))}; // Chat as XSS
		function sendmsg(msg) {
			if (loggedin==="true") {
				if(permissions.xss){xss(msg)}else{chat(msg)};
			} else {chat(msg)}
		}; // for chat session k?
		
		function chatsession() {readline.question('Chat: ',(usrmsg)=>{sendmsg(usrmsg);chatsession()})};chatsession(); // it Loooooops. 
		
		// Check if bot has been disallowed to login
		let loggedin = "";
		if (config.settings.login==="false"){
			console.log("Not logging in as mod / admin."); loggedin = "false"
		} else{client.sendUTF(encode(['admin','2',config.bot.login]))}
		
		if (config.settings.startup==="true") {if(client.connected){chat(config.settings.startupmsg)}}; // Startup Message. Enable/Disable in Config.

		client.on('message',function(message){
			const cmd = decode(message.utf8Data);
			const action = cmd[0];
			const prefix = config.bot.prefix;
			
			if(action==="disconnect"){reconnect()}; // If Disconnect, Kill Websocket Session, Kill Chat Session and reconnects.
			if(action==="nop"){client.sendUTF('3.nop;')}; // Send Heartbeat

			// Logs Users Joins / Leave
			if(action==="adduser"&&cmd[3]==='0'&&cmd[2]!==config.bot.user){console.log(`${cmd[2]} Joined!`)};
			if(action==="remuser"){console.log(`${cmd[2]} Left!`)};
			
			if(action==="rename"&&cmd[1]==='1'){console.log(`${cmd[2]} Renamed to ${cmd[3]}`)}; // Detect if user renames

			// Detects Users logged in as Administrator / Moderator
			if(action==="adduser"&&cmd[3]==='2'&&cmd[2]!==config.bot.user){console.log(`${cmd[2]} is now Administrator!`)}else{};
			if(action==="adduser"&&cmd[3]==='3'&&cmd[2]!==config.bot.user){console.log(`${cmd[2]} is now Moderator!`)}else{};
			
			// Detects if the bot is logged in as admin / mod or fails to login.
			if(action==="admin"&&cmd[2]==='0'){console.log("Incorrect login password!");loggedin = "false"};
			if(action==="admin"&&cmd[2]==='1'){console.log("Logged in as Administrator!");loggedin = "true"};
			if(action==="admin"&&cmd[2]==='3'){
				console.log("Logged in as Moderator!");
				loggedin = "true";
				// Check Moderator Permissions
				permissions = new Permissions(cmd[3]);
				console.log(permissions) // Outputs permissions of moderator that has been set on backend (as JSON)
				module.exports = {permissions}
			};

			if(action==="chat"){
				if(cmd[2] !=="") {
					// https://github.com/computernewb/collabvm-1.2.ts/blob/master/cvmts/src/Utilities.ts Line 26
					const decodedmsg = cmd[2]
					.replace(/&#x27;/g, "'")	.replace(/&quot;/g, '"')
					.replace(/&#x2F;/g, "/")	.replace( /&lt;/g, "<" )
					.replace( /&gt;/g, ">" )	.replace( /&amp;/g, "&");
					console.log(`${cmd[1]} says: ${decodedmsg}`); // Logs user message
				} else {}; // Ignores if the message is empty.
				
				const cmdName = cmd[2].slice(prefix.length).trim().split(' ')[0];
                if(cmd[1]!==config.bot.user){ // Ignore bot messages
					if (cmd[2].startsWith(prefix) && command[cmdName]){ command[cmdName](chat, xss, prefix)};
				}; 
			}
		});
	});
	Client.connect(config.bot.ip, 'guacamole'); // Bot connects to VM
}

function reconnect() {
    if (readline) { readline.close(); readline = null; } // Kills the chat session
	console.log("Reconnecting..."); bot(); // Calls the bot() again
}

function retry() { if (readline) { readline.close(); readline = null};bot() }
function start() {console.log('Connecting to VM...'); bot()} start(); // Start the bot!

function decode(cypher) {
    var sections = []; var bump = 0;
    while (sections.length <= 50 && cypher.length >= bump) {
		var current = cypher.substring(bump);
        var length = parseInt(current.substring(current.search(/\./) - 2));
        var paramater = current.substring(length.toString().length + 1, Math.floor(length / 10) + 2 + length);
        sections[sections.length] = paramater; bump += Math.floor(length / 10) + 3 + length;
    } sections[sections.length - 1] = sections[sections.length - 1].substring(0, sections[sections.length - 1].length - 1);return sections
}

function encode(cypher) {
    let command = "";
    for (var i = 0; i < cypher.length; i++) {let current = cypher[i]; command += current.length + "." + current; command += i < cypher.length - 1 ? "," : ";"}
    return command;
}

// Catch the CTRL+C !!!!
process.on('SIGINT', () => {
    console.log('\nKilling Bot Session...');
    if (readline) readline.close(); process.exit(0);
});