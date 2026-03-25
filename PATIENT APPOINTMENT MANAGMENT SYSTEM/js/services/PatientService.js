/**
 * PatientService - Business logic for patient management
 */
class PatientService {
    constructor(patientRepository, validationService) {
        this.patientRepo = patientRepository;
        this.validator = validationService;
    }

    /**
     * Register a new patient
     * @param {Object} patientData - Patient information
     * @returns {Object} Result with success flag and data/error
     */
    registerPatient(patientData) {
        // Validate required fields
        const requiredFields = ['name', 'age', 'phone'];
        const validation = this.validator.validateRequiredFields(patientData, requiredFields);
        
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

        // Validate age
        if (!this.validator.validateAge(patientData.age)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_AGE',
                    message: 'Age must be a positive number between 1 and 150',
                    field: 'age'
                }
            };
        }

        // Validate phone format
        if (!this.validator.validatePhone(patientData.phone)) {
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
        if (this.patientRepo.phoneExists(patientData.phone)) {
            return {
                success: false,
                error: {
                    code: 'DUPLICATE_PHONE',
                    message: 'A patient with this phone number already exists',
                    field: 'phone'
                }
            };
        }

        // Validate email if provided
        if (patientData.email && !this.validator.validateEmail(patientData.email)) {
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
            name: this.validator.sanitizeInput(patientData.name),
            age: parseInt(patientData.age),
            gender: patientData.gender || 'not-specified',
            phone: patientData.phone.trim(),
            email: patientData.email ? patientData.email.trim() : '',
            address: patientData.address ? this.validator.sanitizeInput(patientData.address) : '',
            medicalHistory: patientData.medicalHistory ? this.validator.sanitizeInput(patientData.medicalHistory) : '',
            accountStatus: 'approved' // Auto-approve for now, can be changed to 'pending'
        };

        try {
            const patient = this.patientRepo.create(sanitizedData);
            return {
                success: true,
                data: patient
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'REGISTRATION_FAILED',
                    message: 'Failed to register patient',
                    details: error.message
                }
            };
        }
    }

    /**
     * Update patient information
     * @param {number} id - Patient ID
     * @param {Object} updates - Fields to update
     * @returns {Object} Result with success flag and data/error
     */
    updatePatient(id, updates) {
        const patient = this.patientRepo.getById(id);
        if (!patient) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Patient not found'
                }
            };
        }

        // Validate age if being updated
        if (updates.age !== undefined && !this.validator.validateAge(updates.age)) {
            return {
                success: false,
                error: {
                    code: 'INVALID_AGE',
                    message: 'Age must be a positive number between 1 and 150',
                    field: 'age'
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

            if (this.patientRepo.phoneExists(updates.phone, id)) {
                return {
                    success: false,
                    error: {
                        code: 'DUPLICATE_PHONE',
                        message: 'A patient with this phone number already exists',
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
            if (typeof value === 'string' && !['phone', 'email', 'gender', 'accountStatus'].includes(key)) {
                sanitizedUpdates[key] = this.validator.sanitizeInput(value);
            } else {
                sanitizedUpdates[key] = value;
            }
        }

        try {
            const updatedPatient = this.patientRepo.update(id, sanitizedUpdates);
            return {
                success: true,
                data: updatedPatient
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'UPDATE_FAILED',
                    message: 'Failed to update patient',
                    details: error.message
                }
            };
        }
    }

    /**
     * Delete patient
     * @param {number} id - Patient ID
     * @returns {Object} Result with success flag
     */
    deletePatient(id) {
        const patient = this.patientRepo.getById(id);
        if (!patient) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Patient not found'
                }
            };
        }

        try {
            this.patientRepo.delete(id);
            return {
                success: true,
                message: 'Patient deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DELETE_FAILED',
                    message: 'Failed to delete patient',
                    details: error.message
                }
            };
        }
    }

    /**
     * Get patient by ID
     * @param {number} id - Patient ID
     * @returns {Object} Result with success flag and data/error
     */
    getPatient(id) {
        const patient = this.patientRepo.getById(id);
        if (!patient) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Patient not found'
                }
            };
        }

        return {
            success: true,
            data: patient
        };
    }

    /**
     * Get all patients
     * @returns {Object} Result with success flag and data
     */
    getAllPatients() {
        return {
            success: true,
            data: this.patientRepo.getAll()
        };
    }

    /**
     * Search patients
     * @param {string} query - Search query
     * @returns {Object} Result with success flag and data
     */
    searchPatients(query) {
        return {
            success: true,
            data: this.patientRepo.search(query)
        };
    }

    /**
     * Get patients by account status
     * @param {string} status - Account status
     * @returns {Object} Result with success flag and data
     */
    getPatientsByStatus(status) {
        return {
            success: true,
            data: this.patientRepo.getByStatus(status)
        };
    }

    /**
     * Approve patient account
     * @param {number} id - Patient ID
     * @returns {Object} Result with success flag and data/error
     */
    approvePatient(id) {
        return this.updatePatient(id, { accountStatus: 'approved' });
    }

    /**
     * Reject patient account
     * @param {number} id - Patient ID
     * @returns {Object} Result with success flag and data/error
     */
    rejectPatient(id) {
        return this.updatePatient(id, { accountStatus: 'rejected' });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatientService;
}
