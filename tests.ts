import * as mocha from 'mocha';
import { assert, expect } from 'chai';

import { roll } from './src/main';
const chai = require('chai')
  , chaiHttp = require('chai-http');
chai.use(chaiHttp);
const should = chai.should();
const request = chai.request;

describe('!roll', () => {
  /**
   * Tests for roll() helper function to ensure valid results are returned.
   */
  describe('roll()', () => {
    // Math.ceil ensures at least 1 roll
    let rolls = Math.ceil(Math.random() * 10);
    let sides = Math.ceil(Math.random() * 10);
    it('rolls are valid, dice with ' + sides + ' sides only yields up to ' + sides, () => {
        roll(rolls, sides).forEach((e) => {
            assert(e <= sides && e > 0);
        });
    });
    it('more than zero rolls', () => {
      assert(roll(rolls, sides).length > 0);
    });
    it('zero rolls argument yields zero rolls', () => {
      assert(roll(0, sides).length == 0);
    })
  });
});

describe('Monsters API', () => {
  it('Get ALL monsters', (done) => {
    request('http://localhost:8080')
      .get('/api/monsters')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        res.should.be.a('object');
        done();
      })
  });

  it('Get a monster matching an id', (done) => {
    request('http://localhost:8080')
      .get('/api/monsters/Aboleth')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body[0].name.should.be.equal('Aboleth');
        done();
      });
  });

  let deleteID: string;
  it('Post a monster', (done) => {
    request('http://localhost:8080')
      .post('/api/monsters')
      .send({
        "name": "test",
        "size": "Large",
        "type": "aberration",
        "subtype": "",
        "alignment": "lawful evil",
        "armor_class": 17,
        "hit_points": 135,
        "hit_dice": "18d10",
        "speed": "10 ft., swim 40 ft.",
        "strength": 21,
        "dexterity": 9,
        "constitution": 15,
        "intelligence": 18,
        "wisdom": 15,
        "charisma": 18,
        "constitution_save": 6,
        "intelligence_save": 8,
        "wisdom_save": 6,
        "history": 12,
        "perception": 10,
        "damage_vulnerabilities": "",
        "damage_resistances": "",
        "damage_immunities": "",
        "condition_immunities": "",
        "senses": "darkvision 120 ft., passive Perception 20",
        "languages": "Deep Speech, telepathy 120 ft.",
        "challenge_rating": "10",
        "special_abilities": [],
        "actions": [],
        "legendary_actions": []
      })
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.name.should.be.equal('test');
        deleteID = res.body._id;
        done();
      });
  });

  it('Fails to post a monster', (done) => {
    request('http://localhost:8080')
      .post('/api/monsters')
      .send({
        "name": "test",
        "size": "Large",
        "type": "aberration",
        "subtype": "",
        "alignment": "lawful evil",
        "armor_class": 17,
        "hit_points": 135,
        "hit_dice": "18d10",
        "speed": "10 ft., swim 40 ft.",
        "strength": 21,
        "dexterity": 9,
        "constitution": 15,
        "intelligence": 18,
        "wisdom": 15,
        "charisma": 18,
        "constitution_save": 6,
        "intelligence_save": 8,
        "wisdom_save": 6,
        "history": 12,
        "perception": 10,
        "damage_vulnerabilities": "",
        "damage_resistances": "",
        "damage_immunities": "",
        "condition_immunities": "",
        "senses": "darkvision 120 ft., passive Perception 20",
        "languages": "Deep Speech, telepathy 120 ft.",
        "challenge_rating": "10",
        "special_abilities": [],
        "actions": [],
        "legendary_actions": []
      })
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(409);
        done();
      });
  });

  it('Delete a monster', (done) => {
    request('http://localhost:8080')
      .delete(`/api/monsters/${deleteID}`)
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('Fails to delete a monster', (done) => {
    request('http://localhost:8080')
      .delete(`/api/monsters/${deleteID}`)
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(404);
        done();
      })
  })
});