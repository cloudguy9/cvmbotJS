# cvmbotJS
A CollabVM Bot written in Javascript

## Dependencies
cvmbotJS requires the following dependency to be installed onto your computer:
1. nodeJS (Required - LTS Recommended)
2. that's all :3

### Installing NodeJS (for Linux users)
1. Execute command by doing:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
```
2. Verify Node.JS and NPM is installed on your computer by executing these commands:
```bash
node -v # Prints out Node.JS version
npm -v  # Prints out NPM Version
```

# How to run
1. Clone this repo onto your computer by doing `git clone https://github.com/gunawan092w/cvmbotJS.git`
2. Go to cvmbotJS folder and copy `config.example.toml` to `config.toml`
3. Install dependencies by doing `npm i`
4. Configure the bot by editing the `config.toml`
5. Start the bot by doing `node .` or `node index.js`

# CollabVM Version
This bot has only been tested with [CollabVM Server 1.2.ts](https://github.com/computernewb/collabvm-1.2.ts)!
Might not work for [1.2.11](https://github.com/computernewb/collab3)

# Code from other sources
All code that i've taken from other sources has been labeled in JS Files.
1. /files/Permissions.js - [collab-vm-1.2.webapp/src/ts/protocol/Permissions.ts](https://github.com/computernewb/collab-vm-1.2-webapp/blob/master/src/ts/protocol/Permissions.ts)
2. /files/Guacutils.js - [collab-vm-1.2.webapp/src/ts/protocol/Guacutils.ts](https://github.com/computernewb/collab-vm-1.2-webapp/blob/master/src/ts/protocol/Guacutils.ts)
3. /index.js:93 - [collabvm-1.2.ts/cvmts/src/Utilities.ts:26](https://github.com/computernewb/collabvm-1.2.ts/blob/master/cvmts/src/Utilities.ts)

# Versions
- Stable: [v2.0.7](https://github.com/gunawan092w/cvmbotJS/releases/latest)
- Latest: [v2.0.7](https://github.com/gunawan092w/cvmbotJS/releases)

# License
Licensed in [**GNU GENERAL PUBLIC LICENSE Version 3 (GPL-3.0-or-later)**](https://github.com/gunawan092w/cvmbotJS/blob/main/LICENSE)
