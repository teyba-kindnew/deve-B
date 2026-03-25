/**
 * AuthenticationService - Handles user authentication and authorization
 */
class AuthenticationService {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'currentUser';
        this.loadSession();
    }

    /**
     * Load session from localStorage
     */
    loadSession() {
        try {
            const stored = localStorage.getItem(this.sessionKey);
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.currentUser = null;
        }
    }

    /**
     * Save session to localStorage
     */
    saveSession() {
        try {
            if (this.currentUser) {
                localStorage.setItem(this.sessionKey, JSON.stringify(this.currentUser));
            } else {
                localStorage.removeItem(this.sessionKey);
            }
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }

    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} role - User role (admin, doctor, patient)
     * @returns {Object} Result with success flag and data/error
     */
    login(username, password, role) {
        // Simple demo authentication
        // In production, this would validate against a backend API
        const validCredentials = {
            admin: { username: 'admin', password: 'admin123' },
            doctor: { username: 'doctor', password: 'doctor123' },
            patient: { username: 'patient', password: 'patient123' }
        };

        if (!validCredentials[role]) {
            return {
                success: false,
                error: {
                    code: 'INVALID_ROLE',
                    message: 'Invalid user role'
                }
            };
        }

        const credentials = validCredentials[role];
        if (username === credentials.username && password === credentials.password) {
            this.currentUser = {
                id: Date.now(),
                username,
                role,
                loginTime: new Date().toISOString()
            };
            this.saveSession();

            return {
                success: true,
                data: this.currentUser
            };
        }

        return {
            success: false,
            error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid username or password'
            }
        };
    }

    /**
     * Logout current user
     * @returns {Object} Result with success flag
     */
    logout() {
        this.currentUser = null;
        this.saveSession();
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    /**
     * Get current user
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if logged in
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * Check if user has permission for an action
     * @param {string} action - Action to check
     * @param {string} resource - Resource being accessed
     * @returns {boolean} True if user has permission
     */
    hasPermission(action, resource) {
        if (!this.currentUser) return false;

        const role = this.currentUser.role;

        // Admin has all permissions
        if (role === 'admin') return true;

        // Define role-based permissions
        const permissions = {
            doctor: {
                appointments: ['read', 'update'],
                schedule: ['read', 'update'],
                patients: ['read']
            },
            patient: {
                appointments: ['create', 'read', 'update', 'delete'],
                doctors: ['read'],
                schedule: ['read']
            }
        };

        if (!permissions[role] || !permissions[role][resource]) {
            return false;
        }

        return permissions[role][resource].includes(action);
    }

    /**
     * Validate session
     * @returns {boolean} True if session is valid
     */
    validateSession() {
        if (!this.currentUser) return false;

        // Check if session has expired (24 hours)
        const loginTime = new Date(this.currentUser.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

        if (hoursSinceLogin > 24) {
            this.logout();
            return false;
        }

        return true;
    }

    /**
     * Require authentication
     * @returns {Object} Result with success flag and error if not authenticated
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            return {
                success: false,
                error: {
                    code: 'NOT_AUTHENTICATED',
                    message: 'Authentication required'
                }
            };
        }

        if (!this.validateSession()) {
            return {
                success: false,
                error: {
                    code: 'SESSION_EXPIRED',
                    message: 'Session has expired. Please login again'
                }
            };
        }

        return { success: true };
    }

    /**
     * Require specific role
     * @param {string} requiredRole - Required role
     * @returns {Object} Result with success flag and error if not authorized
     */
    requireRole(requiredRole) {
        const authCheck = this.requireAuth();
        if (!authCheck.success) return authCheck;

        if (this.currentUser.role !== requiredRole) {
            return {
                success: false,
                error: {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'You do not have permission to perform this action'
                }
            };
        }

        return { success: true };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationService;
}
