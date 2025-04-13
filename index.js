// cvmBotJS by Gunawan092w [https://github.com/gunawan092w/cvmbotJS]

const WSClient = require('websocket').client;
const toml = require('toml');
const fs = require('node:fs');
const path = require('node:path');

const Permissions = require('./files/utils/Permissions.js');
const {encode, decode} = require('./files/utils/Guacutils.js');

const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
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
let botrank;

function bot() {
	Client.removeAllListeners(); // Removes remaining listener
	readline = require('readline').createInterface({input: process.stdin, output: process.stdout});
	
	Client.on('connectFailed', reconnect);
	Client.on('connect', client => {
		client.on('close', reconnect);
		client.on('error',error => {console.log(`An error has accoured. {${error.toString()}}`)});

		try {
			function send(msg){client.sendUTF(msg)} // Added in v2.0.3

			send(encode(['rename',config.bot.user])); // Bot sets Username
			send(encode(['connect',config.bot.vmid]));
			send(encode(['login',config.login.token]));
			
			function chat(message){send(encode(['chat',message]))}; // Chat
			function xss(message){send(encode(["admin","21",message]))}; // XSS

			function chatsession() {
				readline.question('Chat: ',(msg)=>{
					if (botrank==="mod") {
						if (permissions.xss){xss(msg)} else(chat(msg));
					} else if (botrank==="admin"){xss(msg)} else{chat(msg)};
					chatsession(); // In loop.
				})
			}; chatsession();

			// Startup Message. Enable/Disable in Config.
			if (config.settings.startup==="true") {if(client.connected){chat(`${config.settings.startupmsg}`)}}; 
			client.on('message', message =>{
				const cmd = decode(message.utf8Data);
				const action = cmd[0];
				const prefix = config.bot.prefix;

				if(action==="nop"){send(encode(['nop']))}; // keepalive

				if(action==="connect" && cmd[1]==='0'){console.log("Unable to connect, Please recheck / specify your VM-ID in config.toml!");process.exit(0)};

				if (action==="adduser") { 
					if (cmd[2]!==config.bot.user&&cmd[1]==="1") { // Ignore bot & Detect 1 user only. [v2.0.4]
						if (cmd[3]==='0'){console.log(`${cmd[2]} Joined!`)}; // Logs User Joins. 
						if (cmd[3]==='2'){console.log(`${cmd[2]} is now Administrator!`)}; // Logs User logged in as Administrator
						if (cmd[3]==='3'){console.log(`${cmd[2]} is now Moderator!`)} // Logs user logged in as Moderator.
					};
				};
				if(action==="remuser"){console.log(`${cmd[2]} Left!`)}; // Logs user leaves.
				if(action==="rename"&&cmd[1]==='1'){console.log(`${cmd[2]} Renamed to ${cmd[3]}`)}; // Detect if user renames

				if (action==="login") {
					if (cmd[1]==='0'){console.log(cmd[2])}
						else {console.log(`Authenticated!`)}
				};
				
				if(cmd[0]==='auth'){
					console.log(`Authenticating...`);
					send(encode(['login',config.login.token]));
				}

				if (action==="admin") {
					if (cmd[2]==='0'){console.log("Incorrect login password!");botrank = null};
					if (cmd[2]==='1'){console.log("Logged in as Administrator!");botrank = "admin"};
					if (cmd[2]==='3'){console.log("Logged in as Moderator!"); botrank = "mod";
						permissions = new Permissions(cmd[3]); // Check Moderator Permissions
					} module.exports = {botrank, permissions}; // export botrole, permissions
				}

				if(action==="chat"){
					// https://github.com/computernewb/collabvm-1.2.ts/blob/master/cvmts/src/Utilities.ts Line 26
					// Decode message to human-readable
					const decodedmsg = cmd[2]
					.replace(/&#x27;/g, "'")	.replace(/&quot;/g, '"')
					.replace(/&#x2F;/g, "/")	.replace( /&lt;/g, "<" )
					.replace( /&gt;/g, ">" )	.replace( /&amp;/g, "&");
					
					if(cmd[2]!==""&&cmd[1]!=="") {console.log(`\n${cmd[1]} says: ${decodedmsg}`)} else{};
					if(cmd[1]===""){console.log(`\n${decodedmsg}`)} else{};
					
					const cmdName = cmd[2].slice(prefix.length).trim().split(' ')[0];
                	if(cmd[1]!==config.bot.user){ // Ignore bot messages
						if (cmd[2].startsWith(prefix) && command[cmdName]){
							if (command[cmdName].execute) {
									command[cmdName].execute(chat, xss, cmd);
							}else { chat(`It looks like ${cmdName} doesn't have 'execute' property set!`) };
						};
					}; 
				};

				// Debugger
				if (config.settings.debug === 'true' && !['nop', 'png', 'async', 'sync', 'turn', 'size'].includes(cmd[0])) {console.log(cmd)};
				
			});
		} catch (error){console.log(error)}
	});  Client.connect(config.bot.ip, 'guacamole', null, {
		origin: config.bot.origin
	}); // Bot connects to VM
}

console.log('Connecting to VM...');
bot();

function reconnect() {
    if (readline) { readline.close(); readline = null; } // Kills the chat session
	console.log("Reconnecting..."); bot(); // Calls the bot() again
}

// If process recieved "SIGINT" (or CTRL+C), Kill session
process.on('SIGINT', () => {
    console.log('\nKilling Bot Session...');
    if (readline) readline.close(); process.exit(0);
});
