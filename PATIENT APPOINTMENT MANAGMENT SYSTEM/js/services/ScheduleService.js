/**
 * ScheduleService - Business logic for doctor schedule management
 */
class ScheduleService {
    constructor(scheduleRepository, appointmentRepository, validationService) {
        this.scheduleRepo = scheduleRepository;
        this.appointmentRepo = appointmentRepository;
        this.validator = validationService;
    }

    /**
     * Create a new schedule for a doctor
     * @param {number} doctorId - Doctor ID
     * @param {Object} scheduleData - Schedule information
     * @returns {Object} Result with success flag and data/error
     */
    createSchedule(doctorId, scheduleData) {
        // Validate required fields
        const requiredFields = ['dayOfWeek', 'startTime', 'endTime'];
        const validation = this.validator.validateRequiredFields(scheduleData, requiredFields);
        
        if (!validation.success) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: validation.message,
                    field: validation.missingFields[0]
                }
            };
        }

        // Validate time format
        if (!this.validator.validateTime(scheduleData.startTime)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_TIME',
                    message: 'Invalid start time format. Use HH:MM',
                    field: 'startTime'
                }
            };
        }

        if (!this.validator.validateTime(scheduleData.endTime)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_TIME',
                    message: 'Invalid end time format. Use HH:MM',
                    field: 'endTime'
                }
            };
        }

        // Validate time order
        if (!this.validator.validateTimeOrder(scheduleData.startTime, scheduleData.endTime)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_TIME_ORDER',
                    message: 'Start time must be before end time',
                    field: 'startTime'
                }
            };
        }

        // Validate break times if provided
        if (scheduleData.breakStartTime && scheduleData.breakEndTime) {
            if (!this.validator.validateTime(scheduleData.breakStartTime) || 
                !this.validator.validateTime(scheduleData.breakEndTime)) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_TIME',
                        message: 'Invalid break time format',
                        field: 'breakStartTime'
                    }
                };
            }

            if (!this.validator.validateTimeOrder(scheduleData.breakStartTime, scheduleData.breakEndTime)) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_TIME_ORDER',
                        message: 'Break start time must be before break end time',
                        field: 'breakStartTime'
                    }
                };
            }
        }

        const newSchedule = {
            doctorId,
            dayOfWeek: scheduleData.dayOfWeek,
            startTime: scheduleData.startTime,
            endTime: scheduleData.endTime,
            slotDuration: scheduleData.slotDuration || 30,
            breakStartTime: scheduleData.breakStartTime || null,
            breakEndTime: scheduleData.breakEndTime || null,
            isActive: true
        };

        try {
            const schedule = this.scheduleRepo.create(newSchedule);
            return {
                success: true,
                data: schedule
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'CREATE_FAILED',
                    message: 'Failed to create schedule',
                    details: error.message
                }
            };
        }
    }

    /**
     * Update schedule
     * @param {number} id - Schedule ID
     * @param {Object} updates - Fields to update
     * @returns {Object} Result with success flag and data/error
     */
    updateSchedule(id, updates) {
        const schedule = this.scheduleRepo.getById(id);
        if (!schedule) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Schedule not found'
                }
            };
        }

        // Validate time order if times are being updated
        const newStartTime = updates.startTime || schedule.startTime;
        const newEndTime = updates.endTime || schedule.endTime;

        if (!this.validator.validateTimeOrder(newStartTime, newEndTime)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_TIME_ORDER',
                    message: 'Start time must be before end time',
                    field: 'startTime'
                }
            };
        }

        // Check for conflicts with existing appointments
        const conflicts = this.checkScheduleConflicts(schedule.doctorId, {
            ...schedule,
            ...updates
        }, id);

        if (conflicts.length > 0) {
            return {
                success: false,
                error: {
                    code: 'SCHEDULE_CONFLICT',
                    message: 'Schedule change conflicts with existing appointments',
                    details: conflicts
                }
            };
        }

        try {
            const updatedSchedule = this.scheduleRepo.update(id, updates);
            return {
                success: true,
                data: updatedSchedule
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: 'Failed to update schedule',
                    details: error.message
                }
            };
        }
    }

    /**
     * Delete schedule
     * @param {number} id - Schedule ID
     * @returns {Object} Result with success flag
     */
    deleteSchedule(id) {
        const schedule = this.scheduleRepo.getById(id);
        if (!schedule) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Schedule not found'
                }
            };
        }

        // Check if there are approved appointments using this schedule
        const conflicts = this.checkScheduleConflicts(schedule.doctorId, schedule, id);
        if (conflicts.length > 0) {
            return {
                success: false,
                error: {
                    code: 'HAS_APPOINTMENTS',
                    message: 'Cannot delete schedule with existing approved appointments',
                    details: conflicts
                }
            };
        }

        try {
            this.scheduleRepo.delete(id);
            return {
                success: true,
                message: 'Schedule deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: 'Failed to delete schedule',
                    details: error.message
                }
            };
        }
    }

    /**
     * Get schedules for a doctor
     * @param {number} doctorId - Doctor ID
     * @returns {Object} Result with success flag and data
     */
    getScheduleByDoctor(doctorId) {
        return {
            success: true,
            data: this.scheduleRepo.getByDoctor(doctorId)
        };
    }

    /**
     * Get available time slots for a doctor on a specific date
     * @param {number} doctorId - Doctor ID
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Object} Result with success flag and data/error
     */
    getAvailableSlots(doctorId, date) {
        if (!this.validator.validateDate(date)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_DATE',
                    message: 'Invalid date format. Use YYYY-MM-DD'
                }
            };
        }

        const dateObj = new Date(date);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        const schedules = this.scheduleRepo.getByDoctorAndDay(doctorId, dayOfWeek);
        
        if (schedules.length === 0) {
            return {
                success: true,
                data: []
            };
        }

        const slots = [];
        
        for (const schedule of schedules) {
            const timeSlots = this.generateTimeSlots(schedule);
            
            for (const slot of timeSlots) {
                const isBooked = this.appointmentRepo.isTimeSlotBooked(doctorId, date, slot);
                slots.push({
                    doctorId,
                    date,
                    time: slot,
                    isAvailable: !isBooked
                });
            }
        }

        return {
            success: true,
            data: slots
        };
    }

    /**
     * Generate time slots from a schedule
     * @param {Object} schedule - Schedule object
     * @returns {Array} Array of time strings
     */
    generateTimeSlots(schedule) {
        const slots = [];
        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
        const [endHour, endMin] = schedule.endTime.split(':').map(Number);
        
        let currentMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        let breakStartMinutes = null;
        let breakEndMinutes = null;
        
        if (schedule.breakStartTime && schedule.breakEndTime) {
            const [bsHour, bsMin] = schedule.breakStartTime.split(':').map(Number);
            const [beHour, beMin] = schedule.breakEndTime.split(':').map(Number);
            breakStartMinutes = bsHour * 60 + bsMin;
            breakEndMinutes = beHour * 60 + beMin;
        }
        
        while (currentMinutes + schedule.slotDuration <= endMinutes) {
            // Skip break time
            if (breakStartMinutes && breakEndMinutes) {
                if (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
                    currentMinutes = breakEndMinutes;
                    continue;
                }
            }
            
            const hour = Math.floor(currentMinutes / 60);
            const min = currentMinutes % 60;
            const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            slots.push(timeStr);
            
            currentMinutes += schedule.slotDuration;
        }
        
        return slots;
    }

    /**
     * Check if time slot is available
     * @param {number} doctorId - Doctor ID
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} time - Time in HH:MM format
     * @returns {boolean} True if available
     */
    isTimeSlotAvailable(doctorId, date, time) {
        return !this.appointmentRepo.isTimeSlotBooked(doctorId, date, time);
    }

    /**
     * Check if doctor has any schedule
     * @param {number} doctorId - Doctor ID
     * @returns {boolean} True if doctor has schedule
     */
    hasSchedule(doctorId) {
        return this.scheduleRepo.hasSchedule(doctorId);
    }

    /**
     * Check for schedule conflicts with existing appointments
     * @param {number} doctorId - Doctor ID
     * @param {Object} newSchedule - New schedule data
     * @param {number} excludeScheduleId - Schedule ID to exclude from check
     * @returns {Array} Array of conflicting appointments
     */
    checkScheduleConflicts(doctorId, newSchedule, excludeScheduleId = null) {
        // Get all approved appointments for this doctor
        const appointments = this.appointmentRepo.getByDoctor(doctorId)
            .filter(apt => apt.status === 'approved' || apt.status === 'pending');

        const conflicts = [];

        for (const apt of appointments) {
            const aptDate = new Date(apt.date);
            const dayOfWeek = aptDate.toLocaleDateString('en-US', { weekday: 'long' });

            // Check if appointment is on the day this schedule applies to
            if (dayOfWeek === newSchedule.dayOfWeek) {
                // Check if appointment time falls outside new schedule hours
                const aptTime = apt.time;
                if (aptTime < newSchedule.startTime || aptTime >= newSchedule.endTime) {
                    conflicts.push(apt);
                }
            }
        }

        return conflicts;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScheduleService;
}
