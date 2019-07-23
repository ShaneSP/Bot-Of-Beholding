import { Client, RichEmbed, ClientOptions } from 'discord.js';
let config = require('./config.json');
let help = require('./data/help.json');
let monsters = require('./data/monsters.json');
let spells = require('./data/spells.json');
// Configure logger settings
// Initialize Discord Bot
let bot = new Client();

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
            let book = args.shift().toLowerCase();
            let longDesc = args.includes("-l");
            let isRegex = args.includes("-r");
            let search = "";

            while(args[0] && !args[0].match('-.*')) {
                search += args.shift() + " "
            }
            search = search.substring(0, search.length - 1);
            
            if(!book.match(/spells|monsters/)) {
                message.channel.send("Unknown text: " + book + ". Perhaps Xanathar deserves a visit.");
                return;
            }
            
            let result: RichEmbedJSON = lookup(book, search, longDesc, isRegex);
            let embed: RichEmbed = parseRichEmbed(result.title, result.desc);
            message.channel.send(embed);

            if(args.includes("-s")) {
                // Call send message with secret flag true
            }
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

let parseRichEmbed = (title, desc, color = 'WHITE'): RichEmbed => {
    let embed = new RichEmbed()
                      .setTitle(title)
                      .setDescription(desc)
                      .setColor(color);
    return embed;
}

interface RichEmbedJSON {
    title: string,
    desc: string,
    color?: string
}

/**
 * Lookup Functions
 * @param book : name of ancient tome to search within
 * @param search : search string
 * @param longDesc? : (optional) return long  description
 * @param isRegex? : (optional) treat search string as regex
 */
let lookup = (book, search, longDesc, isRegex): RichEmbedJSON  => {
    // TODO: handle exact matches, and multi-word names, i.e. - "Giant Crocodile"
    // TODO: handle full entries, not just lvl 0 of the JSON object
    // TODO: handle number values and format differently than string values
    // TODO: write/rewrite functions to accommodate formatting
    
    let ref = null;
    if(book == "spells") {
        ref = spells;
    } else if(book == "monsters") {
        ref = monsters;
    }

    let lowercase = search.toLowerCase();
    let exactMatch = null;
    let result = [];
    for(let entry in ref) {
        if(ref[entry]["name"] && ref[entry]["name"].toLowerCase().match(lowercase)) {
            if(ref[entry]["name"] == search) {
                exactMatch = ref[entry];
                break;
            }
            result.push(ref[entry]);
        }
    }

    let output: RichEmbedJSON = {
        title: "",
        desc: ""
    };
    let text = "";
    if(exactMatch != null) {
        text += jsonToString(exactMatch, 0);
    } else if(result.length > 1) {
        output.title = "Found multiple results for " + search;
        output.desc = result.reduce(listStrings);
        return output;
    } else if(result.length == 1) {
        text += jsonToString(result[0], 0);
    } else {
        output.title = "No results for **" + search + "**.";
        return output;
    }

    let firstBreak = text.indexOf('\n') + 1;
    let titleIndex = text.indexOf('\n', firstBreak + 1);
    output.title = text.substring(firstBreak, titleIndex);
    output.desc = text.substring(text.indexOf('\n', titleIndex), text.length);

    return output;
}

bot.login(config.token);

module.exports = { roll }