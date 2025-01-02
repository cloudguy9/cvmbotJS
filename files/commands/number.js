module.exports = function (chat, xss, prefix, cmd) {
    const args = cmd[2].trim().split(' ');
    const min = parseInt(args[1]);
    const max = parseInt(args[2]);

    if (isNaN(min) || isNaN(max)) {chat(`Usage: ${prefix}number <min> <max>`);return};
    if (min >= max) {chat("Min value should be less than max value.");return};

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    chat(`Random number between ${min} and ${max} is ${randomNumber}.`);
};