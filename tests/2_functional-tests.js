const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const testString = puzzlesAndSolutions[1][0];
const testSolution = puzzlesAndSolutions[1][1];

suite('Functional Tests', () => {
  suite('POST to /api/solve', () => {
    test('Valid and solvable puzzle string', (done) => {
      puzzlesAndSolutions.forEach(([puzzle, solution]) => {
        chai.request(server)
        .post('/api/solve')
        .send({
          puzzle
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.solution, solution)
        })
      });
      done();
    });
    
    test('Missing puzzle string', (done) => {
      chai.request(server)
      .post('/api/solve')
      .send()
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Required field missing');
        done();
      })
    });
    
    test('Invalid characters in puzzle string', (done) => {
      chai.request(server)
      .post('/api/solve')
      .send({
        puzzle: '..9..5.1.85.4....2432.0....1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
    });
    
    test('Incorrect length of puzzle string', (done) => {
      chai.request(server)
      .post('/api/solve')
      .send({
        puzzle: '.9..5.1.8.7.7.7.75.4....2432...0..1...69.83.9.....662.71...9......1945....4.37.4.3..6..'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
    });
    
    test('Valid and unsolvable puzzle string', (done) => {
      chai.request(server)
      .post('/api/solve')
      .send({
        puzzle: '..2..5.1.85.4....243.......1...69.83.9.....6.62.71...9......1946....4.37.4.3..6..'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Puzzle cannot be solved');
        done();
      })
    });
  });  
  
  
  suite('POST to /api/check', () => {

    test('All fields valid and correct', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: testString,
        coordinate: 'A2',
        value: '4'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { 'valid': true });
        done();
      });
    });

    test('One placement conflict', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: testString,
        coordinate: 'E5',
        value: '6'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { 'valid': false, 'conflict': ['row'] });
        done();
      });
    });

    test('Two placement conflicts', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: testString,
        coordinate: 'f6',
        value: '7'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { 'valid': false, 'conflict': ['row', 'region'] });
        done();
      });
    });

    test('All placement conflicts possible', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: testString,
        coordinate: 'G4',
        value: '2'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { 'valid': false, 'conflict': ['row', 'column', 'region'] });
        done();
      });
    });

    test('Missing fields', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: testString,
        value: '6'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Required field(s) missing' });
        done();
      });
    });

    test('Invalid characters in puzzle', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: 'x'.repeat(81),
        coordinate: 'E5',
        value: '6'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
    });

    test('Invalid puzzle length', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: 'x',
        coordinate: 'E5',
        value: '6'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
    });

    test('Invalid coordinate', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: testString,
        coordinate: 'P5',
        value: '6'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid coordinate' });
        done();
      });
    });

    test('Invalid value', (done) => {
      chai.request(server)
      .post('/api/check')
      .send({
        puzzle: testString,
        coordinate: 'e5',
        value: '0'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'Invalid value' });
        done();
      });
    });
  }); //end suite /api/check
});

