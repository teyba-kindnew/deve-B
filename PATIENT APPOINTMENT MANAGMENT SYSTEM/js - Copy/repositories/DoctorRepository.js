/**
 * DoctorRepository - Handles doctor data persistence
 */
class DoctorRepository extends BaseRepository {
    constructor() {
        super('doctors');
    }

    /**
     * Get doctors by specialization
     * @param {string} specialization - Specialization to filter by
     * @returns {Array} Doctors with matching specialization
     */
    getBySpecialization(specialization) {
        return this.find(doctor => 
            doctor.specialization.toLowerCase() === specialization.toLowerCase()
        );
    }

    /**
     * Get available doctors
     * @returns {Array} Doctors with 'available' status
     */
    getAvailable() {
        return this.find(doctor => doctor.availability === 'available');
    }

    /**
     * Check if phone number already exists
     * @param {string} phone - Phone number to check
     * @param {number} excludeId - ID to exclude from check (for updates)
     * @returns {boolean} True if phone exists
     */
    phoneExists(phone, excludeId = null) {
        return this.data.some(doctor => 
            doctor.phone === phone && doctor.id !== excludeId
        );
    }

    /**
     * Search doctors by name or specialization
     * @param {string} query - Search query
     * @returns {Array} Matching doctors
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.find(doctor =>
            doctor.name.toLowerCase().includes(lowerQuery) ||
            doctor.specialization.toLowerCase().includes(lowerQuery)
        );
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoctorRepository;
}
