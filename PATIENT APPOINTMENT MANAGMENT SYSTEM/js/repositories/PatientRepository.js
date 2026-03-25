/**
 * PatientRepository - Handles patient data persistence
 */
class PatientRepository extends BaseRepository {
    constructor() {
        super('patients');
    }

    /**
     * Check if phone number already exists
     * @param {string} phone - Phone number to check
     * @param {number} excludeId - ID to exclude from check (for updates)
     * @returns {boolean} True if phone exists
     */
    phoneExists(phone, excludeId = null) {
        return this.data.some(patient => 
            patient.phone === phone && patient.id !== excludeId
        );
    }

    /**
     * Check if email already exists
     * @param {string} email - Email to check
     * @param {number} excludeId - ID to exclude from check (for updates)
     * @returns {boolean} True if email exists
     */
    emailExists(email, excludeId = null) {
        return this.data.some(patient => 
            patient.email === email && patient.id !== excludeId
        );
    }

    /**
     * Search patients by name, phone, or email
     * @param {string} query - Search query
     * @returns {Array} Matching patients
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.find(patient =>
            patient.name.toLowerCase().includes(lowerQuery) ||
            patient.phone.includes(query) ||
            patient.email.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get patients by account status
     * @param {string} status - Account status (pending, approved, rejected)
     * @returns {Array} Patients with matching status
     */
    getByStatus(status) {
        return this.find(patient => patient.accountStatus === status);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientRepository;
}
