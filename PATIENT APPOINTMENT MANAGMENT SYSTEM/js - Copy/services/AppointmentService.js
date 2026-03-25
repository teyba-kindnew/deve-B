/**
 * AppointmentService - Business logic for appointment management
 */
class AppointmentService {
    constructor(appointmentRepository, scheduleService, doctorRepository, patientRepository, validationService) {
        this.appointmentRepo = appointmentRepository;
        this.scheduleService = scheduleService;
        this.doctorRepo = doctorRepository;
        this.patientRepo = patientRepository;
        this.validator = validationService;
    }

    /**
     * Create a new appointment
     * @param {Object} appointmentData - Appointment information
     * @returns {Object} Result with success flag and data/error
     */
    createAppointment(appointmentData) {
        // Validate required fields
        const requiredFields = ['patientId', 'doctorId', 'date', 'time'];
        const validation = this.validator.validateRequiredFields(appointmentData, requiredFields);
        
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

        // Validate date format and ensure it's in the future
        if (!this.validator.validateDate(appointmentData.date, true)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_DATE',
                    message: 'Invalid date or date is in the past',
                    field: 'date'
                }
            };
        }

        // Validate time format
        if (!this.validator.validateTime(appointmentData.time)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_TIME',
                    message: 'Invalid time format. Use HH:MM',
                    field: 'time'
                }
            };
        }

        // Check if doctor exists
        const doctor = this.doctorRepo.getById(appointmentData.doctorId);
        if (!doctor) {
            return {
                success: false,
                error: {
                    code: 'DOCTOR_NOT_FOUND',
                    message: 'Doctor not found',
                    field: 'doctorId'
                }
            };
        }

        // Check if patient exists
        const patient = this.patientRepo.getById(appointmentData.patientId);
        if (!patient) {
            return {
                success: false,
                error: {
                    code: 'PATIENT_NOT_FOUND',
                    message: 'Patient not found',
                    field: 'patientId'
                }
            };
        }

        // Check if doctor has a schedule
        if (!this.scheduleService.hasSchedule(appointmentData.doctorId)) {
            return {
                success: false,
                error: {
                    code: 'NO_SCHEDULE',
                    message: 'Doctor does not have a working schedule defined',
                    field: 'doctorId'
                }
            };
        }

        // Validate time slot availability
        const validationResult = this.validateTimeSlot(
            appointmentData.doctorId,
            appointmentData.date,
            appointmentData.time
        );

        if (!validationResult.success) {
            return validationResult;
        }

        // Sanitize inputs
        const sanitizedData = {
            patientId: appointmentData.patientId,
            patientName: patient.name,
            doctorId: appointmentData.doctorId,
            doctorName: doctor.name,
            date: appointmentData.date,
            time: appointmentData.time,
            type: appointmentData.type || 'consultation',
            status: 'pending',
            notes: appointmentData.notes ? this.validator.sanitizeInput(appointmentData.notes) : '',
            reason: appointmentData.reason ? this.validator.sanitizeInput(appointmentData.reason) : ''
        };

        try {
            const appointment = this.appointmentRepo.create(sanitizedData);
            return {
                success: true,
                data: appointment
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'CREATE_FAILED',
                    message: 'Failed to create appointment',
                    details: error.message
                }
            };
        }
    }

    /**
     * Validate time slot availability
     * @param {number} doctorId - Doctor ID
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} time - Time in HH:MM format
     * @param {number} excludeAppointmentId - Appointment ID to exclude (for updates)
     * @returns {Object} Validation result
     */
    validateTimeSlot(doctorId, date, time, excludeAppointmentId = null) {
        // Check if time slot is already booked
        if (this.appointmentRepo.isTimeSlotBooked(doctorId, date, time, excludeAppointmentId)) {
            return {
                success: false,
                error: {
                    code: 'SLOT_UNAVAILABLE',
                    message: 'This time slot is already booked',
                    field: 'time'
                }
            };
        }

        // Check if time falls within doctor's working schedule
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        
        const schedules = this.scheduleService.scheduleRepo.getByDoctorAndDay(doctorId, dayOfWeek);
        
        if (schedules.length === 0) {
            return {
                success: false,
                error: {
                    code: 'NOT_WORKING_DAY',
                    message: 'Doctor is not working on this day',
                    field: 'date'
                }
            };
        }

        // Check if time falls within any schedule
        let withinSchedule = false;
        for (const schedule of schedules) {
            if (time >= schedule.startTime && time < schedule.endTime) {
                // Check if it's during break time
                if (schedule.breakStartTime && schedule.breakEndTime) {
                    if (time >= schedule.breakStartTime && time < schedule.breakEndTime) {
                        continue; // Skip this schedule, it's break time
                    }
                }
                withinSchedule = true;
                break;
            }
        }

        if (!withinSchedule) {
            return {
                success: false,
                error: {
                    code: 'OUTSIDE_WORKING_HOURS',
                    message: 'Selected time is outside doctor\'s working hours',
                    field: 'time'
                }
            };
        }

        return { success: true };
    }

    /**
     * Update appointment
     * @param {number} id - Appointment ID
     * @param {Object} updates - Fields to update
     * @returns {Object} Result with success flag and data/error
     */
    updateAppointment(id, updates) {
        const appointment = this.appointmentRepo.getById(id);
        if (!appointment) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Appointment not found'
                }
            };
        }

        // Prevent modification of completed appointments
        if (appointment.status === 'completed') {
            return {
                success: false,
                error: {
                    code: 'APPOINTMENT_COMPLETED',
                    message: 'Cannot modify completed appointments'
                }
            };
        }

        // If date or time is being updated, validate the new slot
        if (updates.date || updates.time) {
            const newDate = updates.date || appointment.date;
            const newTime = updates.time || appointment.time;
            const doctorId = updates.doctorId || appointment.doctorId;

            const validationResult = this.validateTimeSlot(doctorId, newDate, newTime, id);
            if (!validationResult.success) {
                return validationResult;
            }
        }

        // Sanitize string inputs
        const sanitizedUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value === 'string' && ['notes', 'reason'].includes(key)) {
                sanitizedUpdates[key] = this.validator.sanitizeInput(value);
            } else {
                sanitizedUpdates[key] = value;
            }
        }

        try {
            const updatedAppointment = this.appointmentRepo.update(id, sanitizedUpdates);
            return {
                success: true,
                data: updatedAppointment
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: 'Failed to update appointment',
                    details: error.message
                }
            };
        }
    }

    /**
     * Delete appointment
     * @param {number} id - Appointment ID
     * @returns {Object} Result with success flag
     */
    deleteAppointment(id) {
        const appointment = this.appointmentRepo.getById(id);
        if (!appointment) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Appointment not found'
                }
            };
        }

        try {
            this.appointmentRepo.delete(id);
            return {
                success: true,
                message: 'Appointment deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: 'Failed to delete appointment',
                    details: error.message
                }
            };
        }
    }

    /**
     * Change appointment status
     * @param {number} id - Appointment ID
     * @param {string} newStatus - New status
     * @param {number} userId - User making the change (for authorization)
     * @param {string} userRole - Role of user making the change
     * @returns {Object} Result with success flag and data/error
     */
    changeAppointmentStatus(id, newStatus, userId, userRole) {
        const appointment = this.appointmentRepo.getById(id);
        if (!appointment) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Appointment not found'
                }
            };
        }

        const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: 'Invalid appointment status'
                }
            };
        }

        // Validate status transitions based on role
        if (userRole === 'doctor') {
            // Doctors can only approve/reject pending appointments
            if (newStatus === 'approved' || newStatus === 'rejected') {
                if (appointment.status !== 'pending') {
                    return {
                        success: false,
                        error: {
                            code: 'INVALID_TRANSITION',
                            message: 'Can only approve/reject pending appointments'
                        }
                    };
                }
            }
            // Doctors can only mark approved appointments as completed
            else if (newStatus === 'completed') {
                if (appointment.status !== 'approved') {
                    return {
                        success: false,
                        error: {
                            code: 'INVALID_TRANSITION',
                            message: 'Can only complete approved appointments'
                        }
                    };
                }
            }
        } else if (userRole === 'patient') {
            // Patients can only cancel pending or approved appointments
            if (newStatus === 'cancelled') {
                if (appointment.status !== 'pending' && appointment.status !== 'approved') {
                    return {
                        success: false,
                        error: {
                            code: 'INVALID_TRANSITION',
                            message: 'Can only cancel pending or approved appointments'
                        }
                    };
                }
            }
        }

        const updates = { status: newStatus };
        if (newStatus === 'completed') {
            updates.completedAt = new Date().toISOString();
        }

        return this.updateAppointment(id, updates);
    }

    /**
     * Get appointment by ID
     * @param {number} id - Appointment ID
     * @returns {Object} Result with success flag and data/error
     */
    getAppointment(id) {
        const appointment = this.appointmentRepo.getById(id);
        if (!appointment) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Appointment not found'
                }
            };
        }

        return {
            success: true,
            data: appointment
        };
    }

    /**
     * Get appointments by patient
     * @param {number} patientId - Patient ID
     * @returns {Object} Result with success flag and data
     */
    getAppointmentsByPatient(patientId) {
        const appointments = this.appointmentRepo.getByPatient(patientId);
        // Sort by date and time, upcoming first
        appointments.sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });

        return {
            success: true,
            data: appointments
        };
    }

    /**
     * Get appointments by doctor
     * @param {number} doctorId - Doctor ID
     * @returns {Object} Result with success flag and data
     */
    getAppointmentsByDoctor(doctorId) {
        const appointments = this.appointmentRepo.getByDoctor(doctorId);
        // Sort by date and time
        appointments.sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });

        return {
            success: true,
            data: appointments
        };
    }

    /**
     * Get appointments by date
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Object} Result with success flag and data
     */
    getAppointmentsByDate(date) {
        return {
            success: true,
            data: this.appointmentRepo.getByDate(date)
        };
    }

    /**
     * Get appointments by status
     * @param {string} status - Appointment status
     * @returns {Object} Result with success flag and data
     */
    getAppointmentsByStatus(status) {
        return {
            success: true,
            data: this.appointmentRepo.getByStatus(status)
        };
    }

    /**
     * Get filtered appointments
     * @param {Object} filters - Filter criteria
     * @returns {Object} Result with success flag and data
     */
    getFilteredAppointments(filters) {
        return {
            success: true,
            data: this.appointmentRepo.getFiltered(filters)
        };
    }

    /**
     * Get appointment statistics
     * @returns {Object} Result with success flag and data
     */
    getStatistics() {
        return {
            success: true,
            data: this.appointmentRepo.getStatistics()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppointmentService;
}
