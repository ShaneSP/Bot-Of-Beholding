let ex = {
    "name": "Acid Arrow",
    "desc": "<p>A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 acid damage immediately and 2d4 acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage and no damage at the end of its next turn.</p>",
    "higher_level": "<p>When you cast this spell using a spell slot of 3rd level or higher, the damage (both initial and later) increases by 1d4 for each slot level above 2nd.</p>",
    "page": "phb 259",
    "range": "90 feet",
    "components": "V, S, M",
    "material": "Powdered rhubarb leaf and an adder’s stomach.",
    "ritual": "no",
    "duration": "Instantaneous",
    "concentration": "no",
    "casting_time": "1 action",
    "level": "2nd-level",
    "school": "Evocation",
    "class": "Druid, Wizard",
    "archetype": "Druid: Swamp",
    "circles": "Swamp",
    "domains": ""
}

export class Spell {
    _id?: string;
    name: string;
    description: string;
    higher_level: string;
    page: string;
    range: string;
    components: string;
    material: string;
    ritual: string;
    duration: string;
    concentration: string;
    casting_time: string;
    level: string;
    school: string;
    class: string[];
    archetype: string;
    circles: string[];
    domains: string;

    constructor(name: string,
        description: string,
        higher_level: string,
        page: string,
        range: string,
        components: string,
        material: string,
        ritual: boolean,
        duration: string,
        concentration: boolean,
        casting_time: string,
        level: string,
        school: string,
        class: string[],
        archetype?: string,
        circles?: string[],
        domains?: string,
        _id?: string) {
            this.name = name;
        }
}