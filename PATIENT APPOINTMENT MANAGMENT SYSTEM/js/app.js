/**
 * Application Initialization
 * Sets up all services and makes them globally available
 */

// Initialize repositories
const doctorRepository = new DoctorRepository();
const patientRepository = new PatientRepository();
const appointmentRepository = new AppointmentRepository();
const scheduleRepository = new ScheduleRepository();

// Initialize validation service
const validationService = new ValidationService();

// Initialize services
const authService = new AuthenticationService();
const doctorService = new DoctorService(doctorRepository, validationService);
const patientService = new PatientService(patientRepository, validationService);
const scheduleService = new ScheduleService(scheduleRepository, appointmentRepository, validationService);
const appointmentService = new AppointmentService(
    appointmentRepository,
    scheduleService,
    doctorRepository,
    patientRepository,
    validationService
);

// Make services globally available
window.AppServices = {
    auth: authService,
    doctor: doctorService,
    patient: patientService,
    schedule: scheduleService,
    appointment: appointmentService,
    validation: validationService
};

// Initialize sample data if none exists
function initializeSampleData() {
    // Check if data already exists
    if (doctorRepository.getAll().length > 0) {
        console.log('Data already exists, skipping initialization');
        return;
    }

    console.log('Initializing sample data...');

    // Create sample doctors
    const doctors = [
        {
            name: 'Dr. John Smith',
            license: 'MD12345',
            specialization: 'Cardiology',
            experience: 15,
            phone: '+1-555-0101',
            email: 'john.smith@hospital.com',
            availability: 'available',
            consultationFee: 150.00,
            workingHours: 'Mon-Fri 9:00 AM - 5:00 PM',
            qualifications: 'MD, Cardiology Specialist, Board Certified',
            bio: 'Experienced cardiologist with 15 years of practice. Specializes in heart disease prevention and treatment.'
        },
        {
            name: 'Dr. Sarah Johnson',
            license: 'MD12346',
            specialization: 'Pediatrics',
            experience: 12,
            phone: '+1-555-0102',
            email: 'sarah.johnson@hospital.com',
            availability: 'available',
            consultationFee: 120.00,
            workingHours: 'Mon-Sat 8:00 AM - 4:00 PM',
            qualifications: 'MD, Pediatrics Specialist, FAAP',
            bio: 'Dedicated pediatrician focused on child health and development.'
        },
        {
            name: 'Dr. Michael Davis',
            license: 'MD12347',
            specialization: 'Orthopedics',
            experience: 18,
            phone: '+1-555-0103',
            email: 'michael.davis@hospital.com',
            availability: 'available',
            consultationFee: 180.00,
            workingHours: 'Mon-Fri 10:00 AM - 6:00 PM',
            qualifications: 'MD, Orthopedic Surgeon, Board Certified',
            bio: 'Orthopedic surgeon specializing in joint replacement and sports medicine.'
        }
    ];

    const createdDoctors = [];
    doctors.forEach(doctorData => {
        const result = doctorService.createDoctor(doctorData);
        if (result.success) {
            createdDoctors.push(result.data);
            console.log(`Created doctor: ${result.data.name}`);
        }
    });

    // Create schedules for doctors
    createdDoctors.forEach(doctor => {
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        weekdays.forEach(day => {
            scheduleService.createSchedule(doctor.id, {
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '17:00',
                slotDuration: 30,
                breakStartTime: '13:00',
                breakEndTime: '14:00'
            });
        });
        console.log(`Created schedule for ${doctor.name}`);
    });

    // Create sample patients
    const patients = [
        {
            name: 'John Doe',
            age: 35,
            gender: 'male',
            phone: '+1-555-1001',
            email: 'john.doe@email.com',
            address: '123 Main St, City, State',
            medicalHistory: 'Hypertension, Diabetes'
        },
        {
            name: 'Jane Smith',
            age: 28,
            gender: 'female',
            phone: '+1-555-1002',
            email: 'jane.smith@email.com',
            address: '456 Oak Ave, City, State',
            medicalHistory: 'Allergies to penicillin'
        },
        {
            name: 'Michael Brown',
            age: 42,
            gender: 'male',
            phone: '+1-555-1003',
            email: 'michael.brown@email.com',
            address: '789 Pine St, City, State',
            medicalHistory: 'Previous surgery on knee'
        }
    ];

    const createdPatients = [];
    patients.forEach(patientData => {
        const result = patientService.registerPatient(patientData);
        if (result.success) {
            createdPatients.push(result.data);
            console.log(`Created patient: ${result.data.name}`);
        }
    });

    // Create sample appointments
    if (createdDoctors.length > 0 && createdPatients.length > 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        appointmentService.createAppointment({
            patientId: createdPatients[0].id,
            doctorId: createdDoctors[0].id,
            date: tomorrowStr,
            time: '10:00',
            type: 'consultation',
            reason: 'Regular checkup',
            notes: 'Patient has history of hypertension'
        });

        console.log('Created sample appointment');
    }

    console.log('Sample data initialization complete');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    console.log('Application services initialized');
});

// Utility function to show messages
function showMessage(message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    Object.assign(messageEl.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        background: type === 'success' ? '#28a745' : '#dc3545',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animation: 'slideInRight 0.3s ease'
    });
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// Make utility functions globally available
window.showMessage = showMessage;
