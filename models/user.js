const mongoose = require('mongoose');

// Modèle pour l'adresse
const addressSchema = new mongoose.Schema({
    country: String,
    postalCode: String,
    city: String,
    streetNumber: String,
    streetName: String,
    additionalOne: String,
    additionalTwo: String,
    additionalThree: String
});

// Modèle pour le client
const clientSchema = new mongoose.Schema({
    name: String,
    firstname: String
});

// Modèle pour l'utilisateur
const userSchema = new mongoose.Schema({
    creationDate: { type: Date, default: Date.now },
    role: { type: String, enum: ['Client', 'Admin'] },
    nickname: String,
    password: String,
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    client: { type: clientSchema, required: function () { return this.role === 'Client'; } }
});

// Création du modèle User
const User = mongoose.model('User', userSchema);

module.exports = User;
