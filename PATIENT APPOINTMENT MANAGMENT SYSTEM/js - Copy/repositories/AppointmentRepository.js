/**
 * AppointmentRepository - Handles appointment data persistence
 */
class AppointmentRepository extends BaseRepository {
    constructor() {
        super('appointments');
    }

    /**
     * Get appointments by patient ID
     * @param {number} patientId - Patient ID
     * @returns {Array} Patient's appointments
     */
    getByPatient(patientId) {
        return this.find(apt => apt.patientId === patientId);
    }

    /**
     * Get appointments by doctor ID
     * @param {number} doctorId - Doctor ID
     * @returns {Array} Doctor's appointments
     */
    getByDoctor(doctorId) {
        return this.find(apt => apt.doctorId === doctorId);
    }

    /**
     * Get appointments by date
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Array} Appointments on that date
     */
    getByDate(date) {
        return this.find(apt => apt.date === date);
    }

    /**
     * Get appointments by status
     * @param {string} status - Appointment status
     * @returns {Array} Appointments with matching status
     */
    getByStatus(status) {
        return this.find(apt => apt.status === status);
    }

    /**
     * Check if time slot is already booked
     * @param {number} doctorId - Doctor ID
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} time - Time in HH:MM format
     * @param {number} excludeId - Appointment ID to exclude (for updates)
     * @returns {boolean} True if slot is booked
     */
    isTimeSlotBooked(doctorId, date, time, excludeId = null) {
        return this.data.some(apt =>
            apt.doctorId === doctorId &&
            apt.date === date &&
            apt.time === time &&
            apt.id !== excludeId &&
            (apt.status === 'pending' || apt.status === 'approved')
        );
    }

    /**
     * Get appointments by doctor and date range
     * @param {number} doctorId - Doctor ID
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Array} Appointments in date range
     */
    getByDoctorAndDateRange(doctorId, startDate, endDate) {
        return this.find(apt =>
            apt.doctorId === doctorId &&
            apt.date >= startDate &&
            apt.date <= endDate
        );
    }

    /**
     * Get appointments with multiple filters
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered appointments
     */
    getFiltered(filters) {
        return this.find(apt => {
            if (filters.doctorId && apt.doctorId !== filters.doctorId) return false;
            if (filters.patientId && apt.patientId !== filters.patientId) return false;
            if (filters.date && apt.date !== filters.date) return false;
            if (filters.status && apt.status !== filters.status) return false;
            if (filters.startDate && apt.date < filters.startDate) return false;
            if (filters.endDate && apt.date > filters.endDate) return false;
            return true;
        });
    }

    /**
     * Get appointment statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        return {
            total: this.data.length,
            pending: this.data.filter(apt => apt.status === 'pending').length,
            approved: this.data.filter(apt => apt.status === 'approved').length,
            completed: this.data.filter(apt => apt.status === 'completed').length,
            cancelled: this.data.filter(apt => apt.status === 'cancelled').length,
            rejected: this.data.filter(apt => apt.status === 'rejected').length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppointmentRepository;
}
