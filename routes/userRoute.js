import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import loginLimiter from '../middlewares/rateLimiter.js';


const router = express.Router();
const jwtSecretKey = 'SECRET_KEY'; // It's better to store this in environment variables

// Middleware for authenticating token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token manquant.' });
    }

    try {
        const verified = jwt.verify(token, jwtSecretKey);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide.' });
    }
};

// Route for registering a new user
router.post('/register', async (req, res) => {
    try {
        const { nickname, password, role, client, address } = req.body;

        if (!nickname || !password || !role) {
            return res.status(400).json({ message: 'Les champs pseudonyme, mot de passe et rôle sont obligatoires.' });
        }

        const existingUser = await User.findOne({ nickname });
        if (existingUser) {
            return res.status(400).json({ message: 'Ce pseudonyme est déjà utilisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            role,
            nickname,
            password: hashedPassword,
            client,
            address
        });

        await newUser.save();
        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.', error });
    }
});

// Route for login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { nickname, password } = req.body;

        const user = await User.findOne({ nickname });
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur introuvable.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Mot de passe incorrect.' });
        }

        const token = jwt.sign({ _id: user._id }, jwtSecretKey, { expiresIn: '1h' });
        res.status(200).json({ message: 'Connexion réussie.', token });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la connexion.', error });
    }
});

// Route to update a user's profile
router.put('/update-user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé.' });
        }

        user.role = req.body.role || user.role;
        user.nickname = req.body.nickname || user.nickname;
        user.client = req.body.client || user.client;
        user.address = req.body.address || user.address;

        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        await user.save();
        res.status(200).json({ message: 'Profil mis à jour avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.', error });
    }
});

// Route to delete a user
router.delete('/delete-user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur.', error });
    }
});

// Route for logging out a user
router.get('/logout', (req, res) => {
    res.status(200).json({ response: 'Vous êtes déconnecté' });
});

export default router;