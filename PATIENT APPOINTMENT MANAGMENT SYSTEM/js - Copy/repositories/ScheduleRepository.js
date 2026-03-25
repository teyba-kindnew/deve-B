/**
 * ScheduleRepository - Handles doctor schedule data persistence
 */
class ScheduleRepository extends BaseRepository {
    constructor() {
        super('schedules');
    }

    /**
     * Get schedules by doctor ID
     * @param {number} doctorId - Doctor ID
     * @returns {Array} Doctor's schedules
     */
    getByDoctor(doctorId) {
        return this.find(schedule => 
            schedule.doctorId === doctorId && schedule.isActive
        );
    }

    /**
     * Get schedule for specific doctor and day
     * @param {number} doctorId - Doctor ID
     * @param {string} dayOfWeek - Day of week (Monday, Tuesday, etc.)
     * @returns {Array} Schedules for that day
     */
    getByDoctorAndDay(doctorId, dayOfWeek) {
        return this.find(schedule =>
            schedule.doctorId === doctorId &&
            schedule.dayOfWeek === dayOfWeek &&
            schedule.isActive
        );
    }

    /**
     * Check if doctor has any schedule defined
     * @param {number} doctorId - Doctor ID
     * @returns {boolean} True if doctor has at least one schedule
     */
    hasSchedule(doctorId) {
        return this.data.some(schedule =>
            schedule.doctorId === doctorId && schedule.isActive
        );
    }

    /**
     * Delete all schedules for a doctor
     * @param {number} doctorId - Doctor ID
     * @returns {number} Number of schedules deleted
     */
    deleteByDoctor(doctorId) {
        const initialLength = this.data.length;
        this.data = this.data.filter(schedule => schedule.doctorId !== doctorId);
        
        const deletedCount = initialLength - this.data.length;
        if (deletedCount > 0) {
            this.saveData();
        }
        return deletedCount;
    }

    /**
     * Deactivate schedule instead of deleting
     * @param {number} id - Schedule ID
     * @returns {boolean} True if deactivated
     */
    deactivate(id) {
        const schedule = this.getById(id);
        if (!schedule) return false;
        
        return this.update(id, { isActive: false }) !== null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScheduleRepository;
}
