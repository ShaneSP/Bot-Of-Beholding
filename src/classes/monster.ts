class Action {
    name: string;
    description: string;
    attack_bonus?: number = 0;
    damage_dice?: string = "";
    damage_bonus?: number = 0;

    constructor(name: string, desc: string, att?: number, dmg?: string, dmgB?: number) {
        this.name = name;
        this.description = desc;
        this.attack_bonus = att;
        this.damage_dice = dmg;
        this.damage_bonus = dmgB;
    }

    public static fromJSON(json: any) {
        return new Action(json.name, json.desc, json.attack_bonus, json.damage_dice, json.damage_bonus);
    }

    getJSON() {
        return {
            "name": this.name,
            "description": this.description,
            "attack_bonus": this.attack_bonus,
            "damage_dice": this.damage_dice,
            "damage_bonus": this.damage_bonus
        }
    }
}

export class Monster {
    _id?: string;
    name: string;
    size: string;
    type: string;
    subtype: string;
    alignment: string;
    armor_class: number; // Armor Class
    hit_points: number; // Hit Points
    hit_dice: string;
    speed: string[];
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    constitution_save: number; // Constitution Save
    intelligence_save: number; // Intelligence Save
    wisdom_save: number; // Wisdom Save
    history: number = 0;
    perception: number = 0;
    acrobatics: number = 0;
    animal_handling: number = 0;
    arcana: number = 0;
    athletics: number = 0;
    deception: number = 0;
    insight: number = 0;
    intimidation: number = 0;
    investigation: number = 0;
    medicine: number = 0;
    nature: number = 0;
    performance: number = 0;
    persuasion: number = 0;
    religion: number = 0;
    sleight_of_hand: number = 0;
    stealth: number = 0;
    survival: number = 0;
    damage_vulnerabilities: string[] = [];
    damage_resistances: string[] = [];
    damage_immunities: string[] = []; // Damage + Condition Immunities?
    senses: string[] = [];
    languages: string[] = [];
    challenge_rating: number = 0; // Challenge Rating
    special_abilities: Action[] = [];
    actions: Action[] = [];
    legendary_actions: Action[] = [];

    constructor(name: string,
        size: string,
        type: string,
        alignment: string,
        armor_class: number, // armor class
        hit_points: number, // hit points
        hit_dice: string,
        speed: string[],
        strength: number,
        dexterity: number,
        constitution: number,
        intelligence: number,
        wisdom: number,
        charisma: number,
        constitution_save: number,
        intelligence_save: number,
        wisdom_save: number,
        challenge_rating: number,
        history?: number,
        perception?: number,
        acrobatics?: number,
        animal_handling?: number,
        arcana?: number,
        athletics?: number,
        deception?: number,
        insight?: number,
        intimidation?: number,
        investigation?: number,
        medicine?: number,
        nature?: number,
        performance?: number,
        persuasion?: number,
        religion?: number,
        sleight_of_hand?: number,
        stealth?: number,
        survival?: number,
        damage_vulnerabilities?: string[],
        damage_resistances?: string[],
        damage_immunities?: string[],
        senses?: string[],
        languages?: string[],
        special_abilities?: Action[],
        actions?: Action[],
        subtype?: string,
        legendary_actions?: Action[],
        _id?: string) {
            this.name = name;
            this.size = size;
            this.type = type;
            this.alignment = alignment;
            this.armor_class = armor_class;
            this.hit_points = hit_points;
            this.hit_dice = hit_dice;
            this.speed = speed;
            this.strength = strength;
            this.dexterity = dexterity;
            this.constitution = constitution;
            this.intelligence = intelligence;
            this.wisdom = wisdom;
            this.charisma = charisma;
            this.constitution_save = constitution_save;
            this.intelligence_save = intelligence_save;
            this.wisdom_save = wisdom_save;
            this.challenge_rating = challenge_rating;
            // Optionals
            this.history = history;
            this.perception = perception;
            this.acrobatics = acrobatics;
            this.animal_handling = animal_handling;
            this.arcana = arcana;
            this.athletics = athletics;
            this.deception = deception;
            this.insight = insight;
            this.intimidation = intimidation;
            this.investigation = investigation;
            this.medicine = medicine;
            this.nature = nature;
            this.performance = performance;
            this.persuasion = persuasion;
            this.religion = religion;
            this.sleight_of_hand = sleight_of_hand;
            this.stealth = stealth;
            this.survival = survival;
            this.damage_vulnerabilities = damage_vulnerabilities;
            this.damage_resistances = damage_resistances;
            this.damage_immunities = damage_immunities;
            this.senses = senses;
            this.languages = languages;
            this.special_abilities = special_abilities;
            this.actions = actions;
            this.subtype = subtype;
            this.legendary_actions = legendary_actions;
            this._id = _id;
    }

    public static fromJSON(json: any) {
        let mon = new Monster(json.name, json.size, json.type, json.alignment, json.armor_class, json.hit_points, 
            json.hit_dice, json.speed, json.strength, json.dexterity, json.constitution, json.intelligence, json.wisdom, 
            json.charisma, json.constitution_save, json.intelligence_save, json.wisdom_save, json.challenge_rating, json.history, json.perception,
            json.acrobatics, json.animal_handling, json.arcana, json.athletics, json.deception,
            json.insight, json.intimidation, json.investigation, json.medicine, json.nature,
            json.performance, json.persuasion, json.religion, json.sleight_of_hand, json.stealth, json.survival);
        mon.damage_vulnerabilities = json.damage_vulnerabilities? json.damage_vulnerabilities.split(",") : [];
        mon.damage_resistances = json.damage_resistances? json.damage_resistances.split(",") : [];
        mon.damage_immunities = json.damage_immunities? json.damage_immunities.split(",") : [];
        mon.senses = json.senses? json.senses.split(",") : [];
        mon.languages = json.languages? json.languages.split(",") : [];
        mon.special_abilities = json.special_abilities? json.special_abilities.map(e => Action.fromJSON(e)) : [];
        mon.actions   = json.actions? json.actions.map(e => Action.fromJSON(e)) : [];
        mon.subtype   = json.subtype;
        mon.legendary_actions = json.legendary_actions? json.legendary_actions.map(e => Action.fromJSON(e)) : [];
        return mon;
    }

    toRichEmbedJSON() {
        return {
            "title": this.name,
            "desc": `*${this.size} ${this.type}, ${this.alignment}*\n` +
            `--------------------------------------\n` +
            `**Armor Class** ${this.armor_class}\n` +
            `**Hit Points** ${this.hit_points}\n` +
            `**Speed** ${this.speed}\n` +
            `--------------------------------------\n` +
            `**STR** ${this.strength}   **DEX** ${this.dexterity}   **CON** ${this.constitution}\n` +
            `**INT** ${this.intelligence}   **WIS** ${this.wisdom}   **CHA** ${this.charisma}\n` +
            `--------------------------------------\n` +
            `**Saving Throws** Con +${this.constitution_save}, Int +${this.intelligence_save}, Wis +${this.wisdom_save}\n` +
            `**Skills** History +${this.history}, Perception +${this.perception}\n` +
            `**Senses** ` + this.senses.reduce((t, s) => t + ", " + s) + `\n` +
            `**Languages** ` + this.languages.reduce((t, s) => t + ", " + s) + `\n` +
            `**Challenge** ` + this.challenge_rating + `\n` +
            `--------------------------------------\n` +
            this.special_abilities.map(a => "***" + a.name + ".*** " + a.description + "\n\n").reduce((t, a) => t + a) +
            `**Actions**\n` +
            `--------------------------------------\n` +
            this.actions.map(a => "***" + a.name + ".*** " + a.description + "\n\n").reduce((t, a) => t + a) +
            `**Legendary Actions**\n` +
            `--------------------------------------\n` +
            this.legendary_actions.map(a => "***" + a.name + ".*** " + a.description + "\n\n").reduce((t, a) => t + a)
        }
    }

    getJSON(): any {
        return {
            "name": this.name,
            "size": this.size,
            "type": this.type,
            "alignment": this.alignment,
            "armor_class": this.armor_class,
            "hit_points": this.hit_points,
            "hit_dice": this.hit_dice,
            "speed": this.speed,
            "strength": this.strength,
            "dexterity": this.dexterity,
            "constitution": this.constitution,
            "intelligence": this.intelligence,
            "wisdom": this.wisdom,
            "charisma": this.charisma,
            "constitution_save": this.constitution_save,
            "intelligence_save": this.intelligence_save,
            "wisdom_save": this.wisdom_save,
            "challenge_rating": this.challenge_rating,
            "history": this.history,
            "perception": this.perception,
            "acrobatics": this.acrobatics,
            "animal_handling": this.animal_handling,
            "arcana": this.arcana,
            "athletics": this.athletics,
            "deception": this.deception,
            "insight": this.insight,
            "intimidation": this.intimidation,
            "investigation": this.investigation,
            "medicine": this.medicine,
            "nature": this.nature,
            "performance": this.performance,
            "persuasion": this.persuasion,
            "religion": this.religion,
            "sleight_of_hand": this.sleight_of_hand,
            "stealth": this.stealth,
            "survival": this.survival,
            "damage_vulnerabilities": this.damage_vulnerabilities,
            "damage_resistances": this.damage_resistances,
            "damage_immunities": this.damage_immunities,
            "senses": this.senses,
            "languages": this.languages,
            "special_abilities": this.special_abilities,
            "actions": this.actions,
            "subtype": this.subtype,
            "legendary_actions": this.legendary_actions
        }
    }
}