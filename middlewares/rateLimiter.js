import rateLimit from 'express-rate-limit';

// Configuration du rate limiter pour la route de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Trop de tentatives de connexion. Veuillez réessayer après 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
});

export default loginLimiter;
