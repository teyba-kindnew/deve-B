/**
 * ValidationService - Handles all data validation and sanitization
 */
class ValidationService {
    /**
     * Validate email format
     * @param {string} email - Email address to validate
     * @returns {boolean} True if valid email format
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid phone format
     */
    validatePhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        // Accepts formats: +1-555-0123, (555) 123-4567, 555-123-4567, 5551234567
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        return phoneRegex.test(phone.trim());
    }

    /**
     * Validate date is in valid format and in the future
     * @param {string} date - Date string in YYYY-MM-DD format
     * @param {boolean} mustBeFuture - Whether date must be in the future
     * @returns {boolean} True if valid date
     */
    validateDate(date, mustBeFuture = false) {
        if (!date || typeof date !== 'string') return false;
        
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) return false;
        
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return false;
        
        if (mustBeFuture) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return dateObj >= today;
        }
        
        return true;
    }

    /**
     * Validate time format
     * @param {string} time - Time string in HH:MM format
     * @returns {boolean} True if valid time format
     */
    validateTime(time) {
        if (!time || typeof time !== 'string') return false;
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time.trim());
    }

    /**
     * Validate age is a positive number
     * @param {number} age - Age to validate
     * @returns {boolean} True if valid age
     */
    validateAge(age) {
        return typeof age === 'number' && age > 0 && age < 150;
    }

    /**
     * Validate that all required fields are present and non-empty
     * @param {Object} data - Data object to validate
     * @param {Array<string>} requiredFields - Array of required field names
     * @returns {Object} Validation result with success flag and missing fields
     */
    validateRequiredFields(data, requiredFields) {
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                missingFields.push(field);
            }
        }
        
        return {
            success: missingFields.length === 0,
            missingFields: missingFields,
            message: missingFields.length > 0 
                ? `Missing required fields: ${missingFields.join(', ')}` 
                : 'All required fields present'
        };
    }

    /**
     * Sanitize input to prevent XSS attacks
     * @param {string} input - Input string to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Validate that start time is before end time
     * @param {string} startTime - Start time in HH:MM format
     * @param {string} endTime - End time in HH:MM format
     * @returns {boolean} True if start time is before end time
     */
    validateTimeOrder(startTime, endTime) {
        if (!this.validateTime(startTime) || !this.validateTime(endTime)) {
            return false;
        }
        
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        return startMinutes < endMinutes;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationService;
}
