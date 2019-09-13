export class Spell {
    _id?: string;
    name: string;
    description: string;
    higher_level: string;
    page: string;
    range: string;
    components: string;
    material: string;
    ritual: boolean;
    duration: string;
    concentration: boolean;
    casting_time: string;
    level: string;
    school: string;
    class: string[] = [];
    archetype: string = "";
    circles: string[] = [];
    domains: string = "";

    constructor(
        name: string,
        description: string,
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
        c: string[], //class
        higher_level?: string,
        archetype?: string,
        circles?: string[],
        domains?: string,
        _id?: string
    ) {
        this.name = name;
        this.description = description.replace("<p>", "").replace("</p>", "\n").replace(/<b>|<\/b>/, "**");
        this.higher_level = higher_level ? higher_level.replace("<p>", "").replace("</p>", "\n").replace(/<b>|<\/b>/, "**") : "";
        this.page = page;
        this.range = range;
        this.components = components;
        this.material = material;
        this.ritual = ritual;
        this.duration = duration;
        this.concentration = concentration;
        this.casting_time = casting_time;
        this.level = level;
        this.school = school;
        this.class = c;
        this.archetype = archetype;
        this.circles = circles;
        this.domains = domains;
        this._id = _id;
    }

    public static fromJSON(json: any) {
        let spell = new Spell(json.name, json.description, json.page, json.range, 
            json.components, json.material, json.ritual, json.duration, json.concentration,
            json.casting_time, json.level, json.school, json.class, json.higher_level);
        spell.archetype = json.archetype? json.archetype : "";
        spell.circles = json.circles? json.circles : [];
        spell.domains = json.domains? json.domains : "";
        spell._id = json._id? json._id : "";
        return spell;
    }

    public static loadFromJSON(json: any) {
        let spell = new Spell(json.name, json.desc, json.page, json.range, 
            json.components, json.material, json.ritual == "yes" ? true : false, json.duration, json.concentration == "yes" ? true : false,
            json.casting_time, json.level, json.school, json.class? json.class.split(",") : [], json.higher_level);
        spell.archetype = json.archetype? json.archetype : "";
        spell.circles = json.circles? json.circles.split(",") : [];
        spell.domains = json.domains? json.domains : "";
        spell._id = json._id? json._id : "";
        return spell;
    }

    toRichEmbedJSON() {
        return {
            "title": this.name,
            "desc": `*${this.level} ${this.school}*\n` +
            `**Casting Time:** ${this.casting_time}\n` +
            `**Range:** ${this.range}\n` +
            `**Components:** ${this.components} (${this.material})\n` +
            `**Duration:** ${this.duration}\n` +
            `${this.description}${this.higher_level}`
        }
    }

    getJSON(): any {
        return {
            "name": this.name,
            "description": this.description,
            "higher_level": this.higher_level,
            "page": this.page,
            "range": this.range,
            "components": this.components,
            "material": this.material,
            "ritual": this.ritual,
            "duration": this.duration,
            "concentration": this.concentration,
            "casting_time": this.casting_time,
            "level": this.level,
            "school": this.school,
            "class": this.class,
            "archetype": this.archetype,
            "circles": this.circles,
            "domains": this.domains
        }
    }
}