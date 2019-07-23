let Discord = require('discord.js');
let config = require('./config.json');
let help = require('./data/help.json');
let monsters = require('./data/monsters.json');
let spells = require('./data/spells.json');
// Configure logger settings
// Initialize Discord Bot
let bot = new Discord.Client({
   token: config.token,
   autorun: true
});

bot.on('ready', function (event) {
    console.log('Bot is running');
});

bot.on('message', async message => {
    if(message.author.bot) return;

    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    switch(command) {
        case 'help': {
            const subcmd = args.shift().toLowerCase();
            if(!help[subcmd]) {
                message.author.send("Unknown command: " + subcmd);
                return;
            }
            let opts = help[subcmd].options;
            let text = "Usage: " + help[subcmd].usage + "\n" + 
                                   help[subcmd].description + "\n" +
                                   "Example: `" + help[subcmd].example + "`\n" + 
                                   (opts.length > 0 ? "Options:\n" : "");
            
            for(let i = 0; i < opts.length; i++) {
                text += "  " + opts[i].short + ",  " + opts[i].name + " ".repeat(30 - opts[i].name.length) + opts[i].description + "\n"
            }
            message.author.send(text)
        }
        break;
        case 'roll':
            // TODO?: consider adapting to accept dice modifiers?

            if(!args[0].match(/[0-9]*d(4|6|8|12|20)/) || args.length < 1) {
                message.channel.send("Usage: "+ help.roll.usage + "\nEntered: " + args[0]);
                return;
            }
            
            // Get xdy arg, i.e. '2d4'
            let xdy = args.shift().toLowerCase();
            let rolls = xdy.substring(0, xdy.indexOf('d'));
            let sides = xdy.substring(xdy.indexOf('d') + 1);

            if(rolls > config.maxRolls) {
                message.channel.send("Exceeds max dice rolls, " + config.maxRolls + ", are you trying to make BoB roll a constitution check?");
                return;
            }

            // First set of rolls
            let rollArray = roll(rolls, sides);

            // Check for dis- and advantage flags, modify rollArray as appropriate
            if(args.includes('-a') || args.includes('adv')) {
                let advRoll = roll(rolls, sides);
                for(let i = 0; i < advRoll.length; i++) {
                    if(advRoll[i] > rollArray[i]) {
                        rollArray[i] = advRoll[i];
                    }
                }
            } else if(args.includes('-d') || args.includes('dis')) {
                let disRoll = roll(rolls, sides);
                for(let i = 0; i < disRoll.length; i++) {
                    if(disRoll[i] < rollArray[i]) {
                        rollArray[i] = disRoll[i];
                    }
                }
            }

            let count = 1;
            let rollToStringArray = rollArray.map(e => "Dice " + (count++) + ": " + e + "\n");
            let total = rollArray.reduce(add);
            let text = rollToStringArray.reduce(add) + "Total: " + (total == 1 ? total + "\n*Be gentle...*" : total);

            // Check for secret flag to determine where to return response.
            if(args.includes("secret") || args.includes("-s")) {
                message.author.send(text);
            } else {
                message.channel.send(text);
            }
        break;
        case 'lookup': {
            // TODO: handle exact matches, and multi-word names, i.e. - "Giant Crocodile"
            // TODO: handle full entries, not just lvl 0 of the JSON object
            // TODO: handle number values and format differently than string values
            // TODO: write/rewrite functions to accommodate formatting
            let book = args.shift().toLowerCase();
            let ref = null;
            if(!book.match(/spells|monsters/)) {
                message.channel.send("Unknown text: " + book + ". Perhaps Xanathar deserves a visit.");
                return;
            } else if(book == "spells") {
                ref = spells;
            } else if(book == "monsters") {
                ref = monsters;
            }
            
            let original = args.shift();
            let search = original.toLowerCase();
            let result = ref.filter((entry) => {
                if(entry["name"] && entry["name"].toLowerCase().match(search)) {
                    return true;
                }
                return false;
            });
            
            let text = "";
            if(result.length > 1) {
                text += "Found multiple results for " + original + ": \n" + result.reduce(listStrings);
            } else if(result.length == 1) {
                text += jsonToString(result[0], 0);
            } else {
                message.channel.send("No results for " + original + ".");
                return;
            }

            let firstBreak = text.indexOf('\n') + 1;
            let titleIndex = text.indexOf('\n', firstBreak + 1);
            const embed = new Discord.RichEmbed()
                                     .setTitle(text.substring(firstBreak, titleIndex))
                                     .setDescription(text.substring(text.indexOf('\n', titleIndex), text.length));
            message.channel.send(embed);
        }
        break;
        /**
         * TODO: command so that users can add custom macros with existing commands
         * TODO: command that allows users to add their spells, cantrips, attacks
         * TODO: character creation command
         * TODO: switch between characters command
         * TODO: change prefix command
         * TODO: set command to handle changing attributes
         * TODO: add command to handle equipment, gold, etc
         * TODO: lookup command (5e SRD)
         * TODO: initiative tracking
         * TODO: homebrew support
         * TODO: game state
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

let listStrings = (total, current) => {
    return total + ", \n" + current["name"];
}

let jsonToString = (obj, lvl) => {
    let output = "";
    for(let field in obj) {
        if(obj[field].length > 0) {
            if(obj[field] instanceof Array) {
                // for(let i = 0; i < obj[field].length; i++) {
                //     output += jsonToString(obj[field][i], ++lvl);
                // }
            } else {
                output += " ".repeat(2 * lvl) + "**" + field[0].toUpperCase() + field.substring(1) + "**:\n" + obj[field] + "\n"
            }
        }
    }
    return output;
}

bot.login(config.token);

module.exports = { roll }