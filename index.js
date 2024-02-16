// Created by Gunawan092w
// Inspired by CollabVM-Unofficial@YandereBot

var WebSocketClient = require('websocket').client;
var toml = require('toml');
var fs = require('fs')
var config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));

var dcbot = require('./cvmbotdc.js');

function chkifready(message) {
	if (message === "botready") { Client() }
}

dcbot.login(chkifready);

// Client Functionality - it's just basically a Websocket client stuff.
function Client() {
	
	function retry() {
		setTimeout(function() { }, 600); // Retry after 0.6s	
	}
	
    var ws = new WebSocketClient();
    console.log('Trying to connect FunVM1...');
	
    // If the connection failed, it will send a message and logs the error to console.
    ws.on('connectFailed', function(error) {
		 console.log('Failed to connect to FunVM. Check your connection and try again.');
    });
    // Bot connected to VM!
    ws.on('connect', function(wsclient) {
        console.log('Bot Connected to FunVM1!');
		dcbot.msgconnected();
		
		wsclient.sendUTF(encode(['rename', config.cvmbot.username])); // Bot sets the username
		wsclient.sendUTF(encode(['admin', '2', config.cvmbot.adminpass])); // Bot logins as admin
		
        function chat(message) { // Chat Function
            wsclient.sendUTF(encode(['chat', message]));
        }
		function xss(message) { // XSS Chat Function
			wsclient.sendUTF(encode(["admin", "21", message]));
		}
		
        // If something goes wrong, it will send a message and logs the error to console
        wsclient.on('error', function(error) {
            console.log("Whoops! Seems like i've encountered an error!) { " + error.toString());
            retry()
        });

        // If the connection was closed or disconnected, it will send a message to console regarding that the connection was closed.
        wsclient.on('close', function() {
            console.log('Connection to FunVM1 was Closed.');
            retry()
        });

		const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
		function chatapp() {
			rl.question('Chat: ', (usrmsg) => { xss(usrmsg); chatapp() });
		} chatapp()
        
		wsclient.on('message', function(message) {
            var cmd = decode(message.utf8Data); // Decodes the command into UTF-8
			var prefix = "g!"
            var command = cmd[2];
		    
			//console.log("1: " + cmd[1])
			//if (typeof cmd[2] !== "undefined") {
			//	console.log("2: " + cmd[2])
			//}
			//if (cmd[0] !== "nop") {
			//	console.log("0: " + cmd[0])
			//}
			if (cmd[0] === "adduser") {
				console.log(cmd[2] + " Joined the VM!");
				dcbot.chatlog(cmd[2] + " Joined the VM");
				chat(cmd[2] + " Joined!");
			}
			if (cmd[0] === "remuser") {
				console.log(cmd[2] + " Left the VM!")
				dcbot.chatlog(cmd[2] + " Left the VM");
				chat(cmd[2] + " Left")
			}
			if (cmd[1] !== "1" && typeof cmd[2] !== "undefined" && cmd[1] !== "0" && cmd[2] !== "0" && cmd[1] !== "2" ) {
				console.log(cmd[1] + " says: " + cmd[2]);
				dcbot.chatlog(cmd[1] + " says: " + cmd[2]);
			}

			function disabled() {
				chat("This command has been disabled")
			}
            if (cmd[0] == 'chat') {
				if (command == prefix + "help") {
       				chat('Command Available: g!test, g!ask');
                }
				
				if (command == prefix + "xsstest") {
					if (config.cvmcmd.xsstest === "true") {
						xss("<h1>Hello World</h1>");
					} else ( disabled() )
				}
                
				if (command == prefix + "test") {
					if (config.cvmcmd.test === "true") {
						chat('This is a test! Yes. a fking test from me writing this code from scratch');
					} else ( disabled() )
				}	
                
				if (command == prefix + "ask") {
					if (config.cvmcmd.ask === "true") {
	            		const OpenAI = require('openai');
						const openai = new OpenAI({ apiKey: '' });
						async function aiask() {
                 			const trimaskcommand = command.substring(prefix.length + 'ask'.length + 1).trim();
		      				const completion = await openai.chat.completions.create({ 
								messages: [ 
									{role: "system", content: "You are a helpful assistant."}, 
									{role: "user", content: trimaskcommand } 
								], model: "gpt-3.5-turbo",
							}); 
		      				xss(completion.choices[0].message.content)
							} aiask(); 
					//chat("This command has been disabled.")
					} else {
						disabled()
					}
                }
				
				if (command == prefix + "reboot") {
					wsclient.sendUTF(encode(["admin", "10", config.cvmbot.vmname]))
					console.log(encode(["admin", "10", config.cvmbot.vmname]))
				}
				
				if (command == prefix + "turntest") {
					chat("take turn!");
					//wsclient.sendUTF(encode['turn', '1']);
					wsclient.sendUTF("5.admin,2.20;");
				}
				
				if (command == prefix + "keyboard") {
					chat("Type: 'Test'")
					wsclient.sendUTF("3.key,3.116,1.1;") //t
					wsclient.sendUTF("3.key,3.101,1.1;") //e
					wsclient.sendUTF("3.key,3.115,1.1;") //s
					wsclient.sendUTF("3.key,3.116,1.1;") //t
				}
				
				if (command == prefix + "disturn") {
					chat("leaving turn");
					wsclient.sendUTF("4.turn,1.0;")
				}
			};
		});
       
	    
		// Sends heartbeat to prevent inactivity..
        setInterval(function() { if (wsclient.connected) { wsclient.sendUTF('3.nop;'); }}, 2500); 

        // Startup message if Bot joined to VM
        if (wsclient.connected) {
			
      	  chat("Corebot Initialized. Version: " + config.cvmbot.ver + " Build Date: " + config.cvmbot.builddate);
		  chat("CoreBot-Discord Initialized. Version: " + config.dcbot.ver + " Build Date: " + config.dcbot.builddate);
          chat("To view list of commands, type 'g!help' !")
		  chat("CoreBot-Discord is under heavy development! Expect bugs and glitches. Report if there's an error.")
		  //chat("ERR! Could not login as admin! Quitting...");
		  wsclient.sendUTF(encode(["chat", "0", "corebot, testing"]));
        }
    });
	
    //
    ws.connect(config.cvmbot.ip, 'guacamole'); // Connects to the VM
	
}
//Client(); // Calls Client

// A code to decode the commands into format cypher
function decode(cypher) {
        var sections = [];
        var bump = 0;
        while (sections.length <= 50 && cypher.length >= bump) {
                var current = cypher.substring(bump);
                var length = parseInt(current.substring(current.search(/\./) - 2));
                var paramater = current.substring(length.toString().length + 1, Math.floor(length / 10) + 2 + length);
                sections[sections.length] = paramater;
                bump += Math.floor(length / 10) + 3 + length;
        }
        sections[sections.length - 1] = sections[sections.length - 1].substring(0, sections[sections.length - 1].length - 1);
        return sections;
}

// A code to encode the commands into format cypher
function encode(cypher) {
        var command = "";
        for (var i = 0; i < cypher.length; i++) {
                var current = cypher[i];
                command += current.length + "." + current;
                command += (i < cypher.length - 1 ? "," : ";");
        }
        return command;
}

module.exports = {
	Client: Client
}