/**
 * DoctorService - Business logic for doctor management
 */
class DoctorService {
    constructor(doctorRepository, validationService) {
        this.doctorRepo = doctorRepository;
        this.validator = validationService;
    }

    /**
     * Create a new doctor
     * @param {Object} doctorData - Doctor information
     * @returns {Object} Result with success flag and data/error
     */
    createDoctor(doctorData) {
        // Validate required fields
        const requiredFields = ['name', 'specialization', 'phone'];
        const validation = this.validator.validateRequiredFields(doctorData, requiredFields);
        
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

        // Validate phone format
        if (!this.validator.validatePhone(doctorData.phone)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_PHONE',
                    message: 'Invalid phone number format',
                    field: 'phone'
                }
            };
        }

        // Check phone uniqueness
        if (this.doctorRepo.phoneExists(doctorData.phone)) {
            return {
                success: false,
                error: {
                    code: 'DUPLICATE_PHONE',
                    message: 'A doctor with this phone number already exists',
                    field: 'phone'
                }
            };
        }

        // Validate email if provided
        if (doctorData.email && !this.validator.validateEmail(doctorData.email)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_EMAIL',
                    message: 'Invalid email format',
                    field: 'email'
                }
            };
        }

        // Sanitize inputs
        const sanitizedData = {
            name: this.validator.sanitizeInput(doctorData.name),
            specialization: this.validator.sanitizeInput(doctorData.specialization),
            phone: doctorData.phone.trim(),
            email: doctorData.email ? doctorData.email.trim() : '',
            license: doctorData.license ? this.validator.sanitizeInput(doctorData.license) : '',
            experience: doctorData.experience || 0,
            availability: doctorData.availability || 'available',
            consultationFee: doctorData.consultationFee || 0,
            workingHours: doctorData.workingHours || '',
            qualifications: doctorData.qualifications ? this.validator.sanitizeInput(doctorData.qualifications) : '',
            bio: doctorData.bio ? this.validator.sanitizeInput(doctorData.bio) : ''
        };

        try {
            const doctor = this.doctorRepo.create(sanitizedData);
            return {
                success: true,
                data: doctor
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'CREATE_FAILED',
                    message: 'Failed to create doctor',
                    details: error.message
                }
            };
        }
    }

    /**
     * Update doctor information
     * @param {number} id - Doctor ID
     * @param {Object} updates - Fields to update
     * @returns {Object} Result with success flag and data/error
     */
    updateDoctor(id, updates) {
        const doctor = this.doctorRepo.getById(id);
        if (!doctor) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Doctor not found'
                }
            };
        }

        // Validate phone if being updated
        if (updates.phone) {
            if (!this.validator.validatePhone(updates.phone)) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_PHONE',
                        message: 'Invalid phone number format',
                        field: 'phone'
                    }
                };
            }

            if (this.doctorRepo.phoneExists(updates.phone, id)) {
                return {
                    success: false,
                    error: {
                        code: 'DUPLICATE_PHONE',
                        message: 'A doctor with this phone number already exists',
                        field: 'phone'
                    }
                };
            }
        }

        // Validate email if being updated
        if (updates.email && !this.validator.validateEmail(updates.email)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_EMAIL',
                    message: 'Invalid email format',
                    field: 'email'
                }
            };
        }

        // Sanitize string inputs
        const sanitizedUpdates = {};
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value === 'string' && !['phone', 'email', 'availability'].includes(key)) {
                sanitizedUpdates[key] = this.validator.sanitizeInput(value);
            } else {
                sanitizedUpdates[key] = value;
            }
        }

        try {
            const updatedDoctor = this.doctorRepo.update(id, sanitizedUpdates);
            return {
                success: true,
                data: updatedDoctor
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: 'Failed to update doctor',
                    details: error.message
                }
            };
        }
    }

    /**
     * Delete doctor
     * @param {number} id - Doctor ID
     * @returns {Object} Result with success flag
     */
    deleteDoctor(id) {
        const doctor = this.doctorRepo.getById(id);
        if (!doctor) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Doctor not found'
                }
            };
        }

        try {
            this.doctorRepo.delete(id);
            return {
                success: true,
                message: 'Doctor deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: 'Failed to delete doctor',
                    details: error.message
                }
            };
        }
    }

    /**
     * Get doctor by ID
     * @param {number} id - Doctor ID
     * @returns {Object} Result with success flag and data/error
     */
    getDoctor(id) {
        const doctor = this.doctorRepo.getById(id);
        if (!doctor) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Doctor not found'
                }
            };
        }

        return {
            success: true,
            data: doctor
        };
    }

    /**
     * Get all doctors
     * @returns {Object} Result with success flag and data
     */
    getAllDoctors() {
        return {
            success: true,
            data: this.doctorRepo.getAll()
        };
    }

    /**
     * Get doctors by specialization
     * @param {string} specialization - Specialization to filter by
     * @returns {Object} Result with success flag and data
     */
    getDoctorsBySpecialization(specialization) {
        return {
            success: true,
            data: this.doctorRepo.getBySpecialization(specialization)
        };
    }

    /**
     * Get available doctors
     * @returns {Object} Result with success flag and data
     */
    getAvailableDoctors() {
        return {
            success: true,
            data: this.doctorRepo.getAvailable()
        };
    }

    /**
     * Update doctor availability
     * @param {number} id - Doctor ID
     * @param {string} availability - New availability status
     * @returns {Object} Result with success flag and data/error
     */
    updateAvailability(id, availability) {
        const validStatuses = ['available', 'busy', 'off-duty'];
        if (!validStatuses.includes(availability)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: 'Invalid availability status',
                    field: 'availability'
                }
            };
        }

        return this.updateDoctor(id, { availability });
    }

    /**
     * Search doctors
     * @param {string} query - Search query
     * @returns {Object} Result with success flag and data
     */
    searchDoctors(query) {
        return {
            success: true,
            data: this.doctorRepo.search(query)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoctorService;
}
