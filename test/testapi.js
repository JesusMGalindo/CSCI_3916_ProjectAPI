/* eslint-disable node/no-unpublished-require */
const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config({ path: '.env' });

const app = require('../src');   // express app
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Task = require('../src/models/task');

describe('Chapter‑22 API routes', function () {
  this.timeout(10000);           // Mongo startup may take a sec
  let token;
  let taskId;

  const agent = request.agent(app);
  const creds = { username: 'testuser', email: 'test@mail.com', password: 'pass123' };

  // ──────────────────────────────────────────────────────────────────────────
  before(async () => {
    await mongoose.connect(process.env.DB);
    await User.deleteMany({});
    await Task.deleteMany({});
  });

  after(async () => {
    await mongoose.disconnect();
  });

  // ──────────────────────────────────────────────────────────────────────────
  it('POST /signup → creates user & returns JWT', async () => {
    const res = await agent.post('/api/signup').send(creds).expect(201);
    expect(res.body).to.have.property('token');
  });

  it('POST /signin → returns JWT', async () => {
    const res = await agent.post('/api/signin')
      .send({ username: creds.username, password: creds.password })
      .expect(200);

    expect(res.body).to.have.property('token');
    token = res.body.token;
  });

  it('POST /api/tasks → creates task', async () => {
    const res = await agent.post('/api/tasks')
      .set('Authorization', `JWT ${token}`)
      .send({ title: 'Write tests', priority: 'high' })
      .expect(201);

    expect(res.body.title).to.equal('Write tests');
    taskId = res.body._id;
  });

  it('GET /api/tasks → returns our task', async () => {
    const res = await agent.get('/api/tasks')
      .set('Authorization', `JWT ${token}`)
      .expect(200);

    expect(res.body).to.be.an('array').with.lengthOf(1);
    expect(res.body[0]._id).to.equal(taskId);
  });

  it('PUT /api/tasks/:id → updates task', async () => {
    const res = await agent.put(`/api/tasks/${taskId}`)
      .set('Authorization', `JWT ${token}`)
      .send({ isCompleted: true })
      .expect(200);

    expect(res.body.isCompleted).to.be.true;
  });

  it('DELETE /api/tasks/:id → removes task', async () => {
    await agent.delete(`/api/tasks/${taskId}`)
      .set('Authorization', `JWT ${token}`)
      .expect(204);

    const res = await agent.get('/api/tasks')
      .set('Authorization', `JWT ${token}`)
      .expect(200);

    expect(res.body).to.be.an('array').that.is.empty;
  });

  it('GET /api/tasks without token → 401', async () => {
    await agent.get('/api/tasks').expect(401);
  });
});
