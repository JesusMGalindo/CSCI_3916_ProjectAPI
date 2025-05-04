/*
 * task.routes.test.js  ‑ v2
 * Integration tests for Chapter‑22 Task‑Manager API
 */
require('dotenv').config({ path: __dirname + '/../.env' });

const chai     = require('chai');
const chaiHttp = require('chai-http');
const server   = require('../server');
const User     = require('../Users');
const Task     = require('../tasks');

chai.should();
chai.use(chaiHttp);

// ── fixtures ───────────────────────────────────────────────────────
const login_details = {
  name:     'test‑user',
  username: 'tester@example.com',
  email:    'tester@example.com',
  password: 'Passw0rd!'
};

const task_details = {
  title:    'Write Mocha tests',
  priority: 'high'
};

let token  = '';
let taskId = '';

// ── suite ──────────────────────────────────────────────────────────
describe('Task Manager API', () => {

  before(async () => {
    await User.deleteOne({ username: login_details.username });
    await Task.deleteMany({ title: task_details.title });
  });

  after(async () => {
    await User.deleteOne({ username: login_details.username });
    await Task.deleteMany({ title: task_details.title });
  });

  /* 1 ▸ SIGN‑UP + SIGN‑IN ---------------------------------------- */
  it('should SIGN‑UP, SIGN‑IN and get JWT', (done) => {
    chai.request(server)
      .post('/signup')
      .send(login_details)
      .end(() => {
        chai.request(server)
          .post('/signin')
          .send({ username: login_details.username, password: login_details.password })
          .end((_, res) => {
            res.should.have.status(200);
            token = res.body.token.split(' ')[1];
            done();
          });
      });
  });

  /* 2 ▸ CREATE ---------------------------------------------------- */
  it('should CREATE a task', (done) => {
    chai.request(server)
      .post('/tasks')
      .set('Authorization', `JWT ${token}`)
      .send(task_details)
      .end((_, res) => {
        res.should.have.status(201);
        taskId = res.body.task._id;
        done();
      });
  });

  /* 3 ▸ COMPLETE -------------------------------------------------- */
  it('should MARK the task complete', (done) => {
    chai.request(server)
      .patch(`/tasks/${taskId}/complete`)          // explicit endpoint
      .set('Authorization', `JWT ${token}`)
      .end((_, res) => {
        res.should.have.status(200);
        res.body.task.isCompleted.should.be.true;
        done();
      });
  });

  /* 4 ▸ UN‑COMPLETE (optional body) ------------------------------- */
  it('should MARK the task incomplete', (done) => {
    chai.request(server)
      .patch(`/tasks/${taskId}/complete`)
      .set('Authorization', `JWT ${token}`)
      .send({ isCompleted: false })
      .end((_, res) => {
        res.should.have.status(200);
        res.body.task.isCompleted.should.be.false;
        done();
      });
  });

  /* 5 ▸ LIST completed=false filter ------------------------------ */
  it('should LIST only incomplete tasks when completed=false', (done) => {
    chai.request(server)
      .get('/tasks?completed=false')
      .set('Authorization', `JWT ${token}`)
      .end((_, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(1);
        res.body[0]._id.should.equal(taskId);
        done();
      });
  });

  /* 6 ▸ UPDATE title --------------------------------------------- */
  it('should UPDATE the task title', (done) => {
    chai.request(server)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `JWT ${token}`)
      .send({ title: 'Write MORE Mocha tests' })
      .end((_, res) => {
        res.should.have.status(200);
        res.body.task.title.should.equal('Write MORE Mocha tests');
        done();
      });
  });

  /* 7 ▸ DELETE ---------------------------------------------------- */
  it('should DELETE the task', (done) => {
    chai.request(server)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `JWT ${token}`)
      .end((_, res) => {
        res.should.have.status(200);
        res.body.success.should.be.true;
        done();
      });
  });

});
