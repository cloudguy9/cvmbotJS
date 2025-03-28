// cvmBotJS by Gunawan092w [https://github.com/gunawan092w/cvmbotJS]

const WSClient = require('websocket').client; //dont stay logged in on hyperbeam, were just nice and didnt trash this
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
function bot() {
	Client.removeAllListeners(); // Removes remaining listener
	readline = require('readline').createInterface({input: process.stdin, output: process.stdout});
	
	Client.on('connectFailed', reconnect);
	Client.on('connect', client => {
		client.on('close', reconnect);
		
		client.on('error',error => {console.log(`An error has accoured. {${error.toString()}}`)});

		try {
			function send(msg){client.sendUTF(msg)} // Added in v2.0.3

			console.log(`Connected to VM!`); // Connection established
			send(encode(['rename',config.bot.user])); // Bot sets Username

			function chat(message){send(encode(['chat',message]))}; // Chat
			function xss(message){send(encode(["admin","21",message]))}; // XSS

			function chatsession() {
				readline.question('Chat: ',(msg)=>{
					if (botrole==="mod") {
						if (permissions.xss){xss(msg)} else(chat(msg));
					} else if (botrole==="admin"){xss(msg)} else{chat(msg)};
					chatsession(); // In loop.
				})
			}; chatsession();
		
			// Check if bot has been disallowed to login
			let botrole;
			if (config.settings.login==="false"){
				console.log("Not logging in as mod / admin."); botrole="null"
			} else{send(encode(['admin','2',config.bot.login]))} // If not, Bot proceeds to log in

			// Startup Message. Enable/Disable in Config.
			if (config.settings.startup==="true") {if(client.connected){chat(`${config.settings.startupmsg}`)}}; 

			client.on('message', message =>{
				const cmd = decode(message.utf8Data);
				const action = cmd[0];
				const prefix = config.bot.prefix;

				if(action==="nop"){send(encode(['nop']))}; // Send Heartbeat

				if (action==="adduser") { 
					if (cmd[2]!==config.bot.user&&cmd[1]==="1") { // Ignore bot & Detect 1 user only. [v2.0.4]
						if (cmd[3]==='0'){console.log(`${cmd[2]} Joined!`)}; // Logs User Joins. 
						if (cmd[3]==='2'){console.log(`${cmd[2]} is now Administrator!`)}; // Logs User logged in as Administrator
						if (cmd[3]==='3'){console.log(`${cmd[2]} is now Moderator!`)} // Logs user logged in as Moderator.
					};
				};
				if(action==="remuser"){console.log(`${cmd[2]} Left!`)}; // Logs user leaves.
				if(action==="rename"&&cmd[1]==='1'){console.log(`${cmd[2]} Renamed to ${cmd[3]}`)}; // Detect if user renames
				
				// Check if the bot has logged in as admin / mod
				if (action==="admin") {
					if (cmd[2]==='0'){console.log("Incorrect login password!");botrole = "null"};
					if (cmd[2]==='1'){console.log("Logged in as Administrator!");botrole = "admin"};
					if (cmd[2]==='3'){console.log("Logged in as Moderator!"); botrole = "mod";
						permissions = new Permissions(cmd[3]); // Check Moderator Permissions
					} module.exports = {botrole, permissions}; // export botrole, permissions
				}

				if(action==="chat"){
					if(cmd[2] !=="") {
						// https://github.com/computernewb/collabvm-1.2.ts/blob/master/cvmts/src/Utilities.ts Line 26
						// Message Decoder to make it readable
						const decodedmsg = cmd[2]
						.replace(/&#x27;/g, "'")	.replace(/&quot;/g, '"')
						.replace(/&#x2F;/g, "/")	.replace( /&lt;/g, "<" )
						.replace( /&gt;/g, ">" )	.replace( /&amp;/g, "&");
						console.log(`\n${cmd[1]} says: ${decodedmsg}`); // Output messages to console
					} else {}; // Ignores if the message is empty (Happens if user send empty message through XSS)
				
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
				if (config.settings.debug === 'true' && cmd[0] !== 'nop') { // Check if debug is true in config & ignore 'nop'
					console.log(cmd); //Outputs WebSocket Messages through console.
				};
				
			});
		} catch (error){chat (`Something went wrong, check console for more details.`); console.log(error)}
	});  Client.connect(config.bot.ip, 'guacamole'); // Bot connects to VM
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
