import app from '../index.js';
import { use, expect } from 'chai';
import chaiHttp from 'chai-http';

const chai = use(chaiHttp);

let token;

describe('Test User Routes', () => {

  it('should register a new user with valid data', async () => {
    const newUser = {
      "role": "Client",
      "nickname": "newtestuser2",
      "password": "password123",
      "client": {
        "name": "Doe",
        "firstname": "John"
      },
      "address": {
        "country": "France",
        "postalCode": "75001",
        "city": "Paris",
        "streetNumber": "10",
        "streetName": "Rue de Test"
      }
    };

    const res = await chai.request.execute(app)
      .post('/user/register')
      .send(newUser);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('message', 'Utilisateur créé avec succès.');
  });

  it('should not register a user with missing required fields', async () => {
    const invalidUser = {
      nickname: 'incompleteuser',
    };

    const res = await chai.request.execute(app)
      .post('/user/register')
      .send(invalidUser);

    expect(res).to.have.status(400);
  });

  it('should login a user with correct credentials and return a token', async () => {
    const loginUser = {
      nickname: 'newtestuser2',
      password: 'password123'
    };

    const res = await chai.request.execute(app)
      .post('/user/login')
      .send(loginUser);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('token');
    token = res.body.token;
  });

  it('should not login a user with incorrect password', async () => {
    const loginUser = {
      nickname: 'newtestuser2',
      password: 'wrongpassword'
    };

    const res = await chai.request.execute(app)
      .post('/user/login')
      .send(loginUser);

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('message', 'Mot de passe incorrect.');
  });

  it('should not allow registration with an existing nickname', async () => {
    const duplicateUser = {
      role: 'Client',
      nickname: 'newtestuser2',
      password: 'password1234',
      client: { name: 'John', firstname: 'Doe' },
      address: { country: 'France', postalCode: '75001', city: 'Paris', streetNumber: '10', streetName: 'Rue de Test' }
    };

    const res = await chai.request.execute(app)
      .post('/user/register')
      .send(duplicateUser);

    expect(res).to.have.status(400);
    expect(res.body).to.have.property('message', 'Ce pseudonyme est déjà utilisé.');
  });

  it('should update the user profile with valid token', async () => {
    const updatedUser = {
      role: 'Admin',
      address: {
        country: 'USA',
        postalCode: '90210',
        city: 'Beverly Hills',
        streetNumber: '1',
        streetName: 'Hollywood Blvd'
      }
    };

    const res = await chai.request.execute(app)
      .put('/user/update-user')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedUser);

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('message', 'Profil mis à jour avec succès.');
  });

  it('should not update user profile without token', async () => {
    const res = await chai.request.execute(app)
      .put('/user/update-user')
      .send({ role: 'Admin' });

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('message', 'Token manquant.');
  });

  it('should not update the user profile with invalid token', async () => {
    const updatedUser = {
      role: 'Admin'
    };

    const res = await chai.request.execute(app)
      .put('/user/update-user')
      .set('Authorization', `Bearer invalidtoken`)
      .send(updatedUser);

    expect(res).to.have.status(401);
  });

  it('should logout the user', async () => {
    const res = await chai.request.execute(app)
      .get('/user/logout');

    expect(res).to.have.status(200);
    expect(res.body).to.have.property('response', 'Vous êtes déconnecté');
  });

  // Cleanup: Delete the created user after tests
  after(async () => {
    if (token) {
      const res = await chai.request.execute(app)
        .delete('/user/delete-user')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('message', 'Utilisateur supprimé avec succès.');
    }
  });
});