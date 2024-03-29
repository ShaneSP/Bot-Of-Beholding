import { Client, RichEmbed, ClientOptions, RequestHandler } from 'discord.js';
import { Monster } from './classes/monster';
import { Spell } from './classes/spell';
const request = require('request-promise');
let config = require('./config.json');
let help = require('./data/help.json');
let monsters = require('./data/monsters.json');
let spells = require('./data/spells.json');
let bot = new Client();
const baseURL = "http://localhost:8080/api/";


/**
 * TODO: command so that users can add custom macros with existing commands
 * TODO: command that allows users to add their spells, cantrips, attacks
 * TODO: character creation command
 * TODO: switch between characters command
 * TODO: change prefix command
 * TODO: set command to handle changing attributes
 * TODO: add command to handle equipment, gold, etc
 * TODO: initiative tracking
 * TODO: homebrew support
 * TODO: game state
 * TODO: pagination in DM's requires multiple clicks to switch pages
 * TODO: proper error throwing that trigger detailed messages returned to user/console
 * TODO: rework multiple results from !lookup
 */  

bot.on('ready', function (event) {
    console.log('Bot is running');
});

bot.on('message', message => {
    if(message.author.bot) return;

    if(message.content.indexOf(config.prefix) !== 0) return;
    const original = message.content;
    const input = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = input.shift().toLowerCase();
    const options = input.filter(e => e.startsWith("-"));
    const args = input.filter(e => !e.startsWith("-"));
    console.log(bot.guilds)
    switch(command) {
        case 'help': {
            if(args.length != 1) {
                handleSend(message, "No command provided.\nUsage: " + help["help"].usage, null, options.includes("-s"));
                return;
            }
            const subcmd = args.shift().toLowerCase();
            let text = helpString(subcmd);
            handleSend(message, "", stringToRichEmbedJSON("!" + subcmd, text), options.includes("-s"));
        }
        break;
        case 'roll':
            // TODO: consider adapting to accept dice modifiers

            if(args.length < 1 || !args[0].match(/[0-9]*d[0-9]*/)) {
                handleSend(message, "Usage: "+ help.roll.usage + "\nEntered: " + original, null, options.includes("-s"));
                return;
            }
            
            // Get xdy arg, i.e. '2d4'
            let xdy = args.shift().toLowerCase();
            let rolls = xdy.substring(0, xdy.indexOf('d'));
            let sides = xdy.substring(xdy.indexOf('d') + 1);

            if(rolls > config.maxRolls) {
                handleSend(message, "Exceeds max dice rolls, " + config.maxRolls + ", are you trying to make BoB roll a constitution check?", null, options.includes("-s"));
                return;
            }

            // First set of rolls
            let rollArray = roll(rolls, sides);

            // Check for dis- and advantage flags, modify rollArray as appropriate
            if(options.includes('-a')) {
                let advRoll = roll(rolls, sides);
                for(let i = 0; i < advRoll.length; i++) {
                    if(advRoll[i] > rollArray[i]) {
                        rollArray[i] = advRoll[i];
                    }
                }
            } else if(options.includes('-d')) {
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

            handleSend(message, "", stringToRichEmbedJSON(message.author.username + " rolled " + xdy, text),  options.includes("-s"));
        break;
        case 'lookup': {
            if(args.length < 2) {
                handleSend(message, "Usage: " + help.lookup.usage + "\nEntered: " + original, null, options.includes("-s"));
                return;
            }
            let book = args.shift().toLowerCase();
            let search = "";

            while(args[0] && !args[0].match('-.*')) {
                search += args.shift() + " "
            }
            search = search.substring(0, search.length - 1);
            
            if(!book.match(/spells|monsters/)) {
                handleSend(message, "Unknown text: " + book + ". Perhaps Xanathar deserves a visit.", null, options.includes("-s"));
                return;
            }

            let lookupFn;
            if(book === "monsters") {
                lookupFn = monsterLookup;
            } else if(book === "spells") {
                lookupFn = spellLookup;
            }
            
            lookup(book, search, lookupFn).then(p => {
                if(p.length == 1) {
                    handleSend(message, null, p[0].toRichEmbedJSON(), options.includes("-s"));
                } else if(p.filter(e => e.name === search).length == 1) {
                    handleSend(message, null, p.filter(e => e.name === search)[0].toRichEmbedJSON(), options.includes("-s"));
                } else if (p.length > 1) {
                    handleSend(message, null, stringToRichEmbedJSON("Results:", p.map(e => e.name + "\n").reduce(add)), options.includes("-s"))
                } else {
                    handleSend(message, null, stringToRichEmbedJSON("Can't find what you're looking for. Rolled a 1 for Perception..", "", "Red"), options.includes("-s"))
                }
            });
        }
        break;
        case "commands": {
            let text = "";
            for(let cmd in help) {
                text += "**" + cmd + "**" + ": " + help[cmd].description + "\n";
            }
            handleSend(message, "", stringToRichEmbedJSON("Available Commands:", text), true);
        }
        break;
        case "create": {
            // TODO: handle player creation
            // TODO: handle monster creation
            // TODO: handle spell creation
            
            // handleSend(message, "", test.toRichEmbedJSON(), options.includes("-s"));
            // return;
            // request({
            //     method: "DELETE",
            //     uri: baseURL + "monsters/5d50718084307736807ea161",
            //     resolveWithFullResponse: true
            // });
            return;
            // for(let entry in spells) {
            //     // return;
            //     let test: Spell = Spell.loadFromJSON(spells[entry]);
            //     let input: Request = {
            //         method: "POST",
            //         uri: baseURL +  "spells",
            //         body: test.getJSON(),
            //         json: true
            //     }
    
            //     request(input)
            //         .then((res) => {
            //             // TODO: handle API response
            //             console.log(res);
            //         })
            //         .catch((err) => {
            //             // TODO: handle API errors
            //             console.log(err);
            //         })
            // }
            // return;
            
        } 
    }
});

interface Request {
    method: string,
    uri: string,
    body: JSON,
    json: boolean
}

/**
 * DEPRECATED >> options() helper function, generates JSON request to be passed to request-promise
 * TS ERROR : Cannot invoke an expression whose type lacks a call signature.
 * @param method GET, PUT, DELETE, POST
 * @param uri end-point for API
 * @param body JSON payload to be handled by end-point
 * 
 * Usage: request(options("GET", "monsters", { id: 1234 }));
 */
const options = (method: string, uri: string, body): Request => {
    return {
        method: method,
        uri: baseURL + uri, // http:/localhost:8080/ + <end-point>
        body: body,
        json: true
    }
}

/**
 * handleSend() helper function, does the work of sending either a RichEmbedJSON or RichEmbed in response to a Discord.Message
 * @param msg Client message object
 * @param text RichEmbed
 * @param json RichEmbedJSON
 * @param secret boolean to determine where to send message response
 */
const handleSend = (msg, text: string, json: RichEmbedJSON, secret: boolean) => {
    if(json != null && json.desc.length > 2048) {
        let pages: RichEmbed[] = paginate(json.title, json.desc);
        paginationEmbed(msg, pages, secret);
    } else if (json != null) {
        !secret ? msg.channel.send(jsonToRichEmbed(json)) : msg.author.send(jsonToRichEmbed(json));
    } else {
        !secret ? msg.channel.send(text) : msg.author.send(text);
    }
}

/**
 * roll() helper function
 * @param rolls number of times to roll a dice
 * @param sides number of sides for dice to be rolled
 * 
 * @returns array of dice roll results
 */
export const roll = (rolls, sides) => { 
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
const add = (total, current) => {
    return total + current;
}

/**
 * listStrings() helper function, reducer
 * @param total 
 * @param current JSON Object with assumed "name" property
 */
const listStrings = (total, current) => {
    return total + ", \n" + current["name"];
}

/**
 * DEPRECATED >> jsonToString() converts JSON object to formatted string
 * @param obj JSON object
 * @param lvl JSON object level within parent objects, i.e. - 0 means root
 */
const jsonToString = (obj, lvl) => {
    let output = "";
    for(let field in obj) {
        if(obj[field]) {
            if(obj[field] instanceof Array) {
                for(let i = 0; i < obj[field].length; i++) {
                    output += jsonToString(obj[field][i], ++lvl);
                }
            } else {
                output += " ".repeat(2 * lvl) + "**" + field[0].toUpperCase() + field.substring(1) + "**:\n" + obj[field] + "\n"
            }
        }
    }
    return output;
}

/**
 * stringToRichEmbed() converts string to Discord.RichEmbed
 * @param title title
 * @param desc description
 * @param color (optional) color, (default) white
 */
const stringToRichEmbedJSON = (title, desc, color = 'WHITE'): RichEmbedJSON => {
    let embed = {
        title: title,
        desc: desc,
        color: color
    };
    return embed;
}

/**
 * jsonToRichEmbed() converts JSON Object to Discord.RichEmbed
 * @param json : JSON Object
 */
const jsonToRichEmbed = (json): RichEmbed => {
    return new RichEmbed().setTitle(json.title).setDescription(json.desc).setColor(json.color);
}

/**
 * Defines RichEmbedJSON Object
 * => Used for passing preformatted JSON objects to message...send() calls
 */
interface RichEmbedJSON {
    title: string,
    desc: string,
    color?: string
}

interface Searcher<T> {
    (book: string, search: RegExp | string): Promise<Searchable<T>[]>;
}

interface Searchable<T> {
    name: string;
    fromJSON(e: JSON): T;
    toRichEmbedJSON(): RichEmbedJSON;
}

const lookup = <T>(book: string, search: RegExp | string, fun: Searcher<T>): Promise<Searchable<T>[]> => {
    return fun(book, search);
}

/**
 * Lookup Function
 * @param book name of ancient tome to search within
 * @param search search string
 */
// TODO: implement with generics
const monsterLookup = (book, search): Promise<Searchable<Monster>[]> => {
    let req = {
        method: "GET",
        uri: baseURL + book + "/" + search,
        json: true
    }

    return request(req)
        .then((res) => {
            if(res) {
                return res.map(e => Monster.fromJSON(e))
            }
        })
        .catch((err) => {
            console.log(err);
        })
}

const spellLookup = (book, search): Promise<Searchable<Spell>[]> => {
    let req = {
        method: "GET",
        uri: baseURL + book + "/" + search,
        json: true
    }

    return request(req)
        .then((res) => {
            if(res) {
                return res.map(e => Spell.fromJSON(e))
            }
        })
        .catch((err) => {
            console.log(err);
        })
}

/**
 * paginate() : splits text into RichEmbed array, 
 * based on 2048 char increments and 30 lines of text per RichEmbed.
 * @param title 
 * @param input 
 */
// TODO: refactor a separate Paginator class
// TODO: paginate doesn't include line breaks between paragraphs
const paginate = (title: string, input: string): RichEmbed[] => {
    let pages: RichEmbed[] = [];
    let pageCharLimit = 2048;
    let lineCharLimit = 82;
    let currPage = 0;
    let lines = input.split("\n");

    // Sanitize lines (in-line) to be under the line character limit
    for(let i = 0; i < lines.length; i++) {
        if(lines[i].length > lineCharLimit) {
            let words = lines[i].split(' ');
            let reconstructed: string[] = [""];
            let index = 0;
            for(let w of words) {
                if(reconstructed[index].length + w.length <= lineCharLimit) {
                    reconstructed[index] = reconstructed[index].concat(" ", w);
                } else if(w.length > lineCharLimit) {
                    // Ignoring long words, never could understand Infernal
                } else {
                    reconstructed[++index] = w;
                }
            }
            lines = splice(lines, i, reconstructed);
            i += reconstructed.length - 1; // skip the lines just inserted into array
        }
    }
    let numOfPages = Math.ceil(lines.length / 30);
    // Initialize RichEmbeds for each page
    for(let n = 0; n < numOfPages; n++) {
        pages.push(new RichEmbed().setTitle(title).setDescription(""));
    }

    // TODO: fix lines and add testing
    for(let i = 0; i < lines.length; i++) {
        if(i > 29 ? i % 29 != 0 : i % 29 == i && pages[currPage].length + lines[i].length < pageCharLimit) {
            pages[currPage].description += lines[i] + "\n";
        } else {
            pages[++currPage].description += lines[i] + "\n";
        }
    }
    return pages;
}

/**
 * splice() : a helper function that inserts one array into another at a given index, replacing the index it was inserted at.
 * @param a Array to be inserted into
 * @param index Target insert index
 * @param b Array being inserted
 */
let splice = <T>(a: T[], index: number, b: T[]): T[] => {
    if(a.length == 0) {
        return b;
    } else if(b.length == 0) {
        return a;
    }
    if(index <= 0) {
        return b.concat(a);
    } else if(index >= a.length) {
        return a.concat(b);
    } else {
        let front = a.slice(0, index-1);
        return (front.concat(b)).concat(a.slice(index+1))
    }
}

/**
 * Nifty function written by @saanuregh 
 * Link: https://www.npmjs.com/package/discord.js-pagination
 * @param msg Client message object
 * @param pages RichEmbed[] or MessageEmbed[]
 * @param emojiList array of emojis
 * @param timeout number, time limit to handle pagination
 */
const paginationEmbed = async (msg, pages, secret = false, emojiList = ['⏪', '⏩'], timeout = 120000) => {
	if (!msg && !msg.channel) throw new Error('Channel is inaccessible.');
	if (!pages) throw new Error('Pages are not given.');
	if (emojiList.length !== 2) throw new Error('Need two emojis.');
	let page = 0;
	const curPage = !secret? await msg.channel.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`)) : await msg.author.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
	for (const emoji of emojiList) await curPage.react(emoji);
	const reactionCollector = curPage.createReactionCollector(
		(reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
		{ time: timeout }
	);
	reactionCollector.on('collect', reaction => {
        // TODO: test if other users can switch pages
        reaction.remove(msg.author);
		switch (reaction.emoji.name) {
			case emojiList[0]:
				page = page > 0 ? --page : page;
				break;
			case emojiList[1]:
				page = page + 1 < pages.length ? ++page : page;
				break;
			default:
				break;
        }
		curPage.edit(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
    });
    
	reactionCollector.on('end', () => curPage.reactions.deleteAll());
	return curPage;
};

/**
 * helpString() returns formatted string of help manual page for given command.
 * @param cmd command to lookup
 */
const helpString = (cmd: string): string => {
    if(!help[cmd]) {
        return "Unknown command: " + cmd;
    }
    let opts = help[cmd].options;
    let text = "Usage: " + help[cmd].usage + "\n" + 
                           help[cmd].description + "\n" +
                           "Example: `" + help[cmd].example + "`\n" + 
                           (opts.length > 0 ? "Options:\n" : "");
    
    for(let i = 0; i < opts.length; i++) {
        text += "  " + opts[i].short + ",  " + opts[i].name + " ".repeat(30 - opts[i].name.length) + opts[i].description + "\n";
    }
    return text;
}

bot.login(config.token);