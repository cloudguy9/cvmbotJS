// https://github.com/computernewb/collab-vm-1.2-webapp/blob/master/src/ts/protocol/Permissions.ts
class Permissions {
  constructor(mask) {
    this.restore = false;
    this.reboot = false;
    this.ban = false;
    this.forcevote = false;
    this.mute = false;
    this.kick = false;
    this.bypassturn = false;
    this.rename = false;
    this.grabip = false;
    this.xss = false;
  
    this.set(mask);
  }
  set(mask) {
    this.restore = (mask & 1) !== 0;
    this.reboot = (mask & 2) !== 0;
    this.ban = (mask & 4) !== 0;
    this.forcevote = (mask & 8) !== 0;
    this.mute = (mask & 16) !== 0;
    this.kick = (mask & 32) !== 0;
    this.bypassturn = (mask & 64) !== 0;
    this.rename = (mask & 128) !== 0;
    this.grabip = (mask & 256) !== 0;
    this.xss = (mask & 512) !== 0;
  }
}
  
module.exports = Permissions;