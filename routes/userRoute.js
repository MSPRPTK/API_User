const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Route pour créer un nouvel utilisateur
router.post('/register', async (req, res) => {
    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ nickname: req.body.nickname });
        if (existingUser) {
            return res.status(400).json({ message: 'Ce pseudonyme est déjà utilisé.' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Création d'un nouvel utilisateur
        const newUser = new User({
            role: req.body.role,
            nickname: req.body.nickname,
            password: hashedPassword,
            client: req.body.client // Assurez-vous que la structure de client correspond
        });

        // Enregistrement de l'utilisateur dans la base de données
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Une erreur est survenue lors de la création de l\'utilisateur.', error: error });
    }
});

module.exports = router;
