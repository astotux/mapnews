export class AuthManager {
    constructor() {
        this.token = localStorage.getItem('jwt_token');
        this.isAuthenticated = !!this.token;
    }

    async getUserInfo() {
        if (!this.token) return null;
    
        try {
            const response = await fetch('http://localhost:8080/api/auth/account', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Не удалось получить данные пользователя');
            }
    
            return await response.json();
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error);
            return null;
        }
    }

    /**
     * Step 1: Send registration data, validate password and email, initiate code sending
     */
    async register(email, password, name) {
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Ошибка регистрации'
                };
            }

            // Successfully queued for email confirmation
            return {
                success: true,
                requireVerification: data.requireVerification !== false,
                message: data.message || 'Код подтверждения отправлен на вашу почту',
                email: data.email || email,
                devCode: data.devCode
            };
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            return {
                success: false,
                message: error.message || 'Не удалось связаться с сервером'
            };
        }
    }

    /**
     * Step 2: Verify 6-digit confirmation code and log user in
     */
    async verifyCode(email, code) {
        try {
            const response = await fetch('http://localhost:8080/api/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Неверный код подтверждения'
                };
            }

            if (data.token) {
                this.token = data.token;
                this.isAuthenticated = true;
                localStorage.setItem('jwt_token', this.token);
            }

            return {
                success: true,
                message: data.message || 'Регистрация успешно подтверждена!',
                token: data.token,
                user: data.user
            };
        } catch (error) {
            console.error('Ошибка при подтверждении кода:', error);
            return {
                success: false,
                message: error.message || 'Не удалось проверить код подтверждения'
            };
        }
    }

    /**
     * Resend verification code (with cooldown)
     */
    async resendCode(email) {
        try {
            const response = await fetch('http://localhost:8080/api/auth/resend-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Не удалось повторно отправить код',
                    retryAfter: data.retryAfter
                };
            }

            return {
                success: true,
                message: data.message || 'Новый код успешно отправлен!',
                devCode: data.devCode
            };
        } catch (error) {
            console.error('Ошибка при повторной отправке кода:', error);
            return {
                success: false,
                message: error.message || 'Не удалось связаться с сервером'
            };
        }
    }

    async login(email, password) {
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || 'Ошибка авторизации'
                };
            }

            this.token = data.token;
            this.isAuthenticated = true;
            localStorage.setItem('jwt_token', this.token);
            
            return {
                success: true,
                token: this.token
            };
        } catch (error) {
            console.error('Ошибка при авторизации:', error);
            return {
                success: false,
                message: error.message || 'Не удалось связаться с сервером'
            };
        }
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('jwt_token');
    }

    getToken() {
        return this.token;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }
}