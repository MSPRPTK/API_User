const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

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
            client: req.body.client,
            address : req.body.address
        });

        // Enregistrement de l'utilisateur dans la base de données
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Une erreur est survenue lors de la création de l\'utilisateur.', error: error });
    }
});

router.post('/login', async (req, res) => {
    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ nickname: req.body.nickname });
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé.' });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Mot de passe incorrect.' });
        }

        // Générer un token
        const token = jwt.sign({ _id: user._id }, 'SECRET_KEY', { expiresIn: '1h' });

        // Si tout est correct, renvoyer un message de succès et le token
        res.status(200).json({ message: 'Connexion réussie.', token: token });
    } catch (error) {
        res.status(500).json({ message: 'Une erreur est survenue lors de la tentative de connexion.', error: error });
    }
});

// Route pour mettre à jour un utilisateur
router.put('/update-user', async (req, res) => {
    try {
        // Vérifier le token
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'SECRET_KEY');
        const userId = decodedToken._id;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé.' });
        }

        // Mise à jour de l'utilisateur
        user.role = req.body.role || user.role;
        user.nickname = req.body.nickname || user.nickname;
        user.client = req.body.client || user.client;
        user.address = req.body.address || user.address;

        // Si le mot de passe est fourni, le hacher
        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        // Enregistrement de l'utilisateur dans la base de données
        await user.save();

        res.status(200).json({ message: 'Profil mis à jour avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Une erreur est survenue lors de la mise à jour du profil.', error: error });
    }
});

// User logout route
router.get('/logout', async (req, res) => {
    res.clearCookie('token').json({ response: 'Vous êtes déconnecté' });
});

module.exports = router;
