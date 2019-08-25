# Bot Of Beholding

`Bot of Beholding is a Discord bot that serves as a tool for DMs and PCs alike. Just don't put one bot inside another... unless you want tear open the fabric of reality and open a portal to the Astral Plane.`

## Functionality
`!help`: Detailed help message for given command.
* Usage: `!help <command_name>`
* Example: `!help roll`

`!roll`: Provided a number of times to roll and an x-sided dice, returns consecutive rolls and total.
* Usage: `!roll <number_of_rolls>d<number_of_sides> [OPTIONS]`
* Example: `!roll 2d4`

`!lookup`: Used to lookup terms in either the 'spells' or 'monsters' manual. If multiple matches are found, will return list of matches.
* Usage: `!lookup <book> <search_term(s)> [OPTIONS]`
* Example: `!lookup monsters Giant Crocodile`

`!commands`: Returns list of available commands.
* Usage: `!commands`

## TODO - Proposed additional functionality
* !roll
  * consider adapting to accept dice modifiers
* !lookup
  * handle number values and format differently than string values
  * add "nice" formatting for Attributes and other stats
  * child json objects aren't indented correctly
* command so that users can add custom macros with existing commands
* command that allows users to add their spells, cantrips, attacks
* character creation command
* switch between characters command
* change prefix command
* set command to handle changing attributes
* add command to handle equipment, gold, etc
* initiative tracking
* homebrew support
* game state
* event log (dm only)
* setup endpoints for MongoDB
* restructure code and helper functions in modular file structure
* proper error throwing that trigger detailed messages returned to user
* rework multiple results from !lookup