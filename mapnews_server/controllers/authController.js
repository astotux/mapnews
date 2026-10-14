const crypto = require('crypto');
const User = require('../models/userSchema');
const PendingUser = require('../models/pendingUserSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { validatePassword, validateEmail, validateName } = require('../utils/validators');
const emailService = require('../services/emailService');

// devCode (код прямо в ответе) доступен только в режиме разработки
const IS_DEV = process.env.NODE_ENV !== 'production';

const authController = {
    /**
     * Step 1: Validate input, create pending registration, and send 6-digit verification code to email
     */
    async register(req, res) {
        try {
            const { email, name, password } = req.body;

            // 1. Validate email
            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                return res.status(400).json({ message: emailValidation.message });
            }
            const cleanEmail = emailValidation.email;

            // 2. Validate name
            const nameValidation = validateName(name);
            if (!nameValidation.valid) {
                return res.status(400).json({ message: nameValidation.message });
            }
            const cleanName = nameValidation.name;

            // 3. Validate password (8+ chars, English only, 1+ digit, 1+ special char)
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                return res.status(400).json({ message: passwordValidation.message });
            }

            // 4. Check if user already exists and is registered
            const existingUser = await User.findOne({ email: cleanEmail });
            if (existingUser) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            // 5. Generate cryptographically secure 6-digit code
            const code = crypto.randomInt(100000, 1000000).toString();

            // 6. Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // 7. Save or update pending registration (15 min TTL)
            await PendingUser.findOneAndUpdate(
                { email: cleanEmail },
                {
                    email: cleanEmail,
                    name: cleanName,
                    password: hashedPassword,
                    code,
                    attempts: 0,
                    lastSentAt: new Date(),
                    createdAt: new Date()
                },
                { upsert: true, new: true }
            );

            // 8. Send verification code via email service
            const emailResult = await emailService.sendVerificationCode(cleanEmail, cleanName, code);

            const responsePayload = {
                requireVerification: true,
                message: `Код подтверждения отправлен на почту ${cleanEmail}`,
                email: cleanEmail
            };

            // devCode возвращается только в dev-режиме (NODE_ENV !== 'production')
            if (IS_DEV) {
                responsePayload.devCode = code;
            }

            // Если SMTP настроен, но письмо не ушло — сообщить в ответе (не падать с 500)
            if (!emailResult.delivered && emailResult.error) {
                console.error(`[register] Письмо не доставлено: ${emailResult.error}`);
                responsePayload.emailWarning = 'Не удалось отправить письмо. Обратитесь к администратору.';
            }

            res.status(200).json(responsePayload);
        } catch (error) {
            console.error('Ошибка при инициализации регистрации:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    },

    /**
     * Step 2: Verify 6-digit code and finalize user registration
     */
    async verifyCode(req, res) {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({ message: 'Email и код подтверждения обязательны' });
            }

            const cleanEmail = email.trim().toLowerCase();
            const cleanCode = code.toString().trim();

            const pending = await PendingUser.findOne({ email: cleanEmail });
            if (!pending) {
                return res.status(400).json({ 
                    message: 'Запрос на регистрацию не найден или срок действия кода истек. Пожалуйста, начните регистрацию заново.' 
                });
            }

            if (pending.code !== cleanCode) {
                pending.attempts = (pending.attempts || 0) + 1;
                await pending.save();

                if (pending.attempts >= 5) {
                    await PendingUser.deleteOne({ email: cleanEmail });
                    return res.status(400).json({ 
                        message: 'Слишком много неверных попыток. Запрос аннулирован, пожалуйста, зарегистрируйтесь заново.' 
                    });
                }

                return res.status(400).json({ 
                    message: `Неверный код подтверждения. Осталось попыток: ${5 - pending.attempts}` 
                });
            }

            // Check if user already created in the meantime
            let user = await User.findOne({ email: cleanEmail });
            if (!user) {
                user = new User({
                    email: cleanEmail,
                    name: pending.name,
                    password: pending.password,
                    isVerified: true,
                    favorites: { news: [], sources: [], cities: [] }
                });
                await user.save();
            }

            // Remove pending registration
            await PendingUser.deleteOne({ email: cleanEmail });

            // Generate JWT authentication token
            const token = jwt.sign(
                { userId: user._id, email: user.email }, 
                JWT_SECRET, 
                { expiresIn: '6h' }
            );

            res.status(201).json({ 
                message: 'Пользователь успешно зарегистрирован и подтвержден!',
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            console.error('Ошибка при подтверждении кода регистрации:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    },

    /**
     * Resend verification code (with 60-second cooldown)
     */
    async resendCode(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email обязателен' });
            }

            const cleanEmail = email.trim().toLowerCase();
            const pending = await PendingUser.findOne({ email: cleanEmail });

            if (!pending) {
                return res.status(400).json({ 
                    message: 'Активный запрос на регистрацию не найден. Заполните форму регистрации заново.' 
                });
            }

            // Enforce 60-second cooldown
            const now = Date.now();
            const timeSinceLastSent = now - (new Date(pending.lastSentAt).getTime() || 0);
            if (timeSinceLastSent < 60000) {
                const secondsLeft = Math.ceil((60000 - timeSinceLastSent) / 1000);
                return res.status(429).json({ 
                    message: `Повторная отправка доступна через ${secondsLeft} сек.`,
                    retryAfter: secondsLeft
                });
            }

            const newCode = crypto.randomInt(100000, 1000000).toString();
            pending.code = newCode;
            pending.attempts = 0;
            pending.lastSentAt = new Date();
            pending.createdAt = new Date();
            await pending.save();

            const emailResult = await emailService.sendVerificationCode(cleanEmail, pending.name, newCode);

            const responsePayload = {
                message: 'Новый код подтверждения успешно отправлен на вашу почту!'
            };
            if (IS_DEV) {
                responsePayload.devCode = newCode;
            }
            if (!emailResult.delivered && emailResult.error) {
                console.error(`[resendCode] Письмо не доставлено: ${emailResult.error}`);
                responsePayload.emailWarning = 'Не удалось отправить письмо. Обратитесь к администратору.';
            }

            res.json(responsePayload);
        } catch (error) {
            console.error('Ошибка при повторной отправке кода:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email и пароль обязательны' });
            }

            const cleanEmail = email.trim().toLowerCase();
            const user = await User.findOne({ email: cleanEmail });
            if (!user) {
                return res.status(400).json({ message: 'Пользователь не найден' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Неверный пароль' });
            }

            if (user.isVerified === false) {
                return res.status(403).json({ message: 'Пожалуйста, подтвердите ваш адрес электронной почты' });
            }

            const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '6h' });

            res.json({ token });
        } catch (error) {
            console.error('Ошибка при авторизации:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    },

    async account(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: 'Отсутствует токен авторизации' });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Неверный формат токена' });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            res.json(user);
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Недействительный токен' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Срок действия токена истек' });
            }
            
            console.error('Ошибка при получении информации о пользователе:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
};

module.exports = authController;