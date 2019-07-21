let Discord = require('discord.js');
let config = require('./config.json');
// Configure logger settings
// Initialize Discord Bot
let bot = new Discord.Client({
   token: config.token,
   autorun: true
});

bot.on('ready', function (evt) {
    console.log('Bot is running');
});

bot.on('message', async message => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if(message.author.bot) return;

    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    
    switch(command) {
        // !ping
        case 'ping':
            message.channel.send('Pong.');
        break;
        case 'roll':
            // TODO: consider adapting to accept dice modifiers
            // TODO: adding advantage/disadvantage options

            if(!args[0].match(/[0-9]*d(4|6|8|12|20)/) || args.length < 1) { 
                message.channel.send("Usage: \"[Number of rolls]d[Sides of dice] (optional secret flag)\"\nEntered: " + args[0]); 
                return; 
            }

            let rolls = args[0].substring(0, args[0].indexOf('d'));
            let sides = args[0].substring(args[0].indexOf('d') + 1);

            if(rolls > config.maxRolls) {
                message.channel.send("Exceeds max dice rolls, " + config.maxRolls + ", are you trying to make BoB roll a constitution check?");
                return;
            }
            let rollArray = roll(rolls, sides);
            let count = 1;
            let rollToStringArray = rollArray.map(e => "Dice " + (count++) + ": " + e + "\n");
            let text = rollToStringArray.reduce(add) + "Total: " + rollArray.reduce(add);
            if(args[1] && args[1].equals("secret") || args[1].equals("-s")) {
                message.author.send(text);
            } else {
                message.channel.send(text);
            }
        break;
        /**
         * TODO: command so that users can add custom macros with existing commands
         * TODO: command that allows users to add their spells, cantrips, attacks
         * TODO: add help command
         * TODO: character creation command
         * TODO: switch between characters command
         * TODO: change prefix command
         * TODO: set command to handle changing attributes
         * TODO: add command to handle equipment, gold, etc
         * TODO: lookup command (5e SRD)
         * TODO: initiative tracking
         * TODO: homebrew support
         * */  
        }
});

/**
 * roll() helper function
 * @param rolls : number of times to roll a dice
 * @param sides : number of sides for dice to be rolled
 * 
 * @returns array of dice roll results
 */
let roll = (rolls, sides) => { 
    if(rolls <= 0) {
        return [];
    }
    let output = [];
    while(rolls > 0) {
        output.push(Math.ceil(Math.random() * sides));
        rolls--;
    }
    return output;
};

/**
 * add() helper function, reducer
 * @param total 
 * @param current 
 */
let add = (total, current) => {
    return total + current;
}

bot.login(config.token);

module.exports = { roll }