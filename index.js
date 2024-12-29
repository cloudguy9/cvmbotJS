// cvmBotJS v2.0.0 [Sunday, December 29th, 2024]
// By Gunawan092w [https://github.com/gunawan092w/cvmbot]

const WSClient = require('websocket').client;
const toml = require('toml');
const fs = require('node:fs');
const path = require('node:path');
const rl = require('readline') // I hate you.

const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
const prefix = config.bot.prefix;

const Client = new WSClient();

// Loads all commands in commands folder
let command = {};
fs.readdirSync('./commands').forEach(file => {
    if (file.endsWith('.js')) {
        const cmdName = path.basename(file, '.js');
        command[cmdName] = require(path.join(__dirname, 'commands', file));
    } 
}); 

let readline = null;
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
		function sendmsg(msg) {if (loggedin!=="false") {chat(msg)} else{xss(msg)}}; // for chat session k?
		
		function chatsession() {readline.question('Chat: ',(usrmsg)=>{sendmsg(usrmsg);chatsession()})};chatsession(); // it Loooooops. 
		
		// Check if user disallow bot login
		let loggedin = "";
		if (config.settings.login==="false"){
			console.log("Not logging in as mod / admin."); loggedin = "false"
		} else{client.sendUTF(encode(['admin','2',config.bot.login]))}
		
		if (config.settings.startup==="true") {if(client.connected){chat(config.settings.startupmsg)}}; // Startup Message. Enable/Disable in Config.

		client.on('message',function(message){
			const cmd = decode(message.utf8Data);
			const action = cmd[0];
			const prefix = config.bot.prefix;
			console.log(cmd)
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
			if(action==="admin"&&cmd[2]==='1'){console.log(" Logged in as Administrator! ");loggedin = "true"};
			if(action==="admin"&&cmd[2]==='3'){console.log("   Logged in as Moderator!   ");loggedin = "true"};
			
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
					if (cmd[2].startsWith(prefix) && command[cmdName]){ command[cmdName](chat, prefix, xss, cmd)};
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

function retry() { if (readline) { readline.close(); readline = null}; bot()}
function start() { console.log('Connecting to VM...'); bot(); } start(); // Start the bot!

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


// Notes of me going crazy about it. - Gunawan092w
//
// [Saturday, December 22th, 2024]
// 1. The day that i start rewritting this code. 
// 2. I got no life. Just to make this active, i'm just gonna keep making this project active as possible lol.
// 3. Copied some of my old code kinda helped.
// 
// [Sunday, December 23th, 2024]
// 1. I'm thinking about making commands in a folder. 
// 2. Without thinking, i literally copied some code from discord.js v14 guide page lmao (it was loading commands thing). Yeah that kinda sucked
// 3. Asked GPT on how to do this but yeah it only made it worse.
// 4. Luckily i used my -100 IQ brain to think and ye it works!
// 5. Created my commands (which is help, test) and it works!
// 6. ...
// 7. Next thing i got an idea was for the help command, what if i make it fetch all commands in the commands folder? (Commands available: [all commmands in the folder here])
// 8. Great idea! But to keep my brain not fried, i just simply copied the code from here (Line 12 - 18) and yeah it works. I couldn't think any alternative ways soo...
//
// [Tuesday, December 25th, 2024]
// 1. At first my idea was to check which permission does moderator has, but i completely give up.
// 2. Still can't figure out how to make reconnect function stuff ugh.
//
// [Wednesday, December 26th, 2024]
// 1. Figured out how to make the reconnect thing.
// 2. By calling bot(); again, HAHA!
// 3. Okay one problem. Readline was not closed. So i used kill function and works :thumbs_up:
//
// [Friday, December 27th, 2024]
// 1. Error [ERR_USE_AFTER_CLOSE]: readline was closed (I LOVE YOU BRO)
// 2. Okay i thought of it and what if i make a new function with the kill prompt in it?
// 3. So i created new function called chatsession(). with the createinterface, questions and done. 
// 4. The way it works is that it first calls chatsession(). And then i kill it by calling rlkill(). Then after it reconnects, it calls chatsession() and now it works!
// 5. I can finally reuse the rlkill after it's session killed lolllll
// 6. But one big problem. There were duplicates of listeners. I couldn't figure out why it keeps doubling. 
// 
// [Saturday, December 28, 2024]
// 1. Found out that existing listener has not yet closed, which it will keep doubling when calling bot() to reconnect. 
// 2. So to fix this, i added Client.removeAllListeners(); to prevent any duplicates Listeners.
// 
// [Sunday, December 29, 2024]
// 1. The day it's published to github!!!!
// 2. Although there was a leftover listener that i thought i removed it but it still shows "MaxListenersExceededWarning: 11 error,close,handler listeners added to [ReadStream]"
// 3. Maybe it'll be fixed in the next version :D
//
////////////////////////////////////