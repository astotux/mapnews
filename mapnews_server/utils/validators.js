/**
 * Validators for user authentication and registration
 */

/**
 * Validate password requirements:
 * - At least 8 characters
 * - Only English (Latin) letters, numbers, and special symbols (Cyrillic strictly forbidden)
 * - At least one digit (0-9)
 * - At least one special symbol (!@#$%^&* etc.)
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Пароль обязателен' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Пароль должен содержать не менее 8 символов' };
    }

    // Check for Cyrillic letters explicitly to provide a clear error message
    if (/[а-яА-ЯёЁ]/.test(password)) {
        return { 
            valid: false, 
            message: 'Пароль должен содержать только английские буквы. Кириллица запрещена!' 
        };
    }

    // Check allowed characters: Latin letters, numbers, standard ASCII symbols
    const allowedCharsRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]+$/;
    if (!allowedCharsRegex.test(password)) {
        return { 
            valid: false, 
            message: 'Пароль может содержать только символы английского алфавита, цифры и спецсимволы (пробелы запрещены)' 
        };
    }

    // Must have at least one Latin letter
    if (!/[A-Za-z]/.test(password)) {
        return { valid: false, message: 'Пароль должен содержать буквы английского алфавита' };
    }

    // Must have at least one digit
    if (!/\d/.test(password)) {
        return { valid: false, message: 'Пароль должен содержать как минимум одну цифру' };
    }

    // Must have at least one special symbol
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;
    if (!specialCharsRegex.test(password)) {
        return { 
            valid: false, 
            message: 'Пароль должен содержать как минимум один специальный символ (!@#$%^&* и др.)' 
        };
    }

    return { valid: true };
}

function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, message: 'Email обязателен' };
    }
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        return { valid: false, message: 'Введите корректный адрес электронной почты' };
    }
    return { valid: true, email: cleanEmail.toLowerCase() };
}

function validateName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, message: 'Имя обязательно' };
    }
    const cleanName = name.trim();
    if (cleanName.length < 2) {
        return { valid: false, message: 'Имя должно содержать не менее 2 символов' };
    }
    if (cleanName.length > 50) {
        return { valid: false, message: 'Имя не должно превышать 50 символов' };
    }
    return { valid: true, name: cleanName };
}

module.exports = {
    validatePassword,
    validateEmail,
    validateName
};
