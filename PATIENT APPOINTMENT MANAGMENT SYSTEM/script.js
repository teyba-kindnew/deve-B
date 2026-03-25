// Patient Appointment Management System - JavaScript

// Sample data
let patients = [
    {
        id: 1,
        name: "John Smith",
        age: 35,
        gender: "male",
        phone: "+1-555-0123",
        email: "john.smith@email.com",
        address: "123 Main St, City, State",
        medicalHistory: "Hypertension, Diabetes"
    },
    {
        id: 2,
        name: "Sarah Johnson",
        age: 28,
        gender: "female",
        phone: "+1-555-0124",
        email: "sarah.johnson@email.com",
        address: "456 Oak Ave, City, State",
        medicalHistory: "Allergies to penicillin"
    },
    {
        id: 3,
        name: "Michael Brown",
        age: 42,
        gender: "male",
        phone: "+1-555-0125",
        email: "michael.brown@email.com",
        address: "789 Pine St, City, State",
        medicalHistory: "Previous surgery on knee"
    }
];

let doctors = [
    {
        id: 1,
        name: "Dr. John Smith",
        license: "MD12345",
        specialization: "cardiology",
        experience: 15,
        phone: "+1-555-1001",
        email: "dr.john.smith@hospital.com",
        availability: "available",
        consultationFee: 150.00,
        workingHours: "Mon-Fri 9:00 AM - 5:00 PM",
        qualifications: "MD, Cardiology Specialist, Board Certified",
        bio: "Experienced cardiologist with 15 years of practice. Specializes in heart disease prevention and treatment."
    },
    {
        id: 2,
        name: "Dr. Sarah Johnson",
        license: "MD12346",
        specialization: "pediatrics",
        experience: 12,
        phone: "+1-555-1002",
        email: "dr.sarah.johnson@hospital.com",
        availability: "available",
        consultationFee: 120.00,
        workingHours: "Mon-Sat 8:00 AM - 4:00 PM",
        qualifications: "MD, Pediatrics Specialist, FAAP",
        bio: "Dedicated pediatrician focused on child health and development. Expert in childhood diseases and preventive care."
    },
    {
        id: 3,
        name: "Dr. Michael Brown",
        license: "MD12347",
        specialization: "general",
        experience: 8,
        phone: "+1-555-1003",
        email: "dr.michael.brown@hospital.com",
        availability: "busy",
        consultationFee: 100.00,
        workingHours: "Mon-Fri 10:00 AM - 6:00 PM",
        qualifications: "MD, Family Medicine",
        bio: "General practitioner providing comprehensive healthcare for patients of all ages. Focus on preventive medicine."
    },
    {
        id: 4,
        name: "Dr. Emily Davis",
        license: "MD12348",
        specialization: "dermatology",
        experience: 10,
        phone: "+1-555-1004",
        email: "dr.emily.davis@hospital.com",
        availability: "available",
        consultationFee: 180.00,
        workingHours: "Tue-Sat 9:00 AM - 5:00 PM",
        qualifications: "MD, Dermatology Specialist, Board Certified",
        bio: "Dermatologist specializing in skin conditions, cosmetic procedures, and skin cancer prevention."
    }
];

let appointments = [
    {
        id: 1,
        patientId: 1,
        patientName: "John Smith",
        date: "2024-12-03",
        time: "09:00",
        type: "consultation",
        doctor: "Dr. John Smith",
        status: "confirmed",
        notes: "Regular checkup"
    },
    {
        id: 2,
        patientId: 2,
        patientName: "Sarah Johnson",
        date: "2024-12-03",
        time: "10:30",
        type: "checkup",
        doctor: "Dr. Sarah Johnson",
        status: "pending",
        notes: "Follow-up visit"
    },
    {
        id: 3,
        patientId: 3,
        patientName: "Michael Brown",
        date: "2024-12-02",
        time: "14:00",
        type: "follow-up",
        doctor: "Dr. Michael Brown",
        status: "completed",
        notes: "Post-surgery checkup"
    }
];

// Application state
let currentSection = 'dashboard';
let currentStep = 1;
let editingAppointment = null;
let editingPatient = null;
let editingDoctor = null;

// DOM Elements
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('page-title');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateDashboard();
    loadAppointments();
    loadPatients();
});

function initializeApp() {
    // Check if user is logged in (simple localStorage check)
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        showMainApp();
    } else {
        showLoginPage();
    }
}

function setupEventListeners() {
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });

    // Add appointment button
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => openAppointmentModal());
    }

    // Add patient button
    const addPatientBtn = document.getElementById('add-patient-btn');
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', () => openPatientModal());
    }

    // Add doctor button
    const addDoctorBtn = document.getElementById('add-doctor-btn');
    if (addDoctorBtn) {
        addDoctorBtn.addEventListener('click', () => openDoctorModal());
    }

    // Appointment form
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }

    // Patient form
    const patientForm = document.getElementById('patient-form');
    if (patientForm) {
        patientForm.addEventListener('submit', handlePatientSubmit);
    }

    // Doctor form
    const doctorForm = document.getElementById('doctor-form');
    if (doctorForm) {
        doctorForm.addEventListener('submit', handleDoctorSubmit);
    }

    // Booking form
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Form step navigation
    document.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', nextStep);
    });

    document.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', prevStep);
    });

    // New patient toggle
    const newPatientToggle = document.getElementById('new-patient-toggle');
    if (newPatientToggle) {
        newPatientToggle.addEventListener('click', toggleNewPatientFields);
    }

    // Search and filter functionality
    setupSearchAndFilters();
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple authentication (demo purposes)
    if (username === 'admin' && password === 'password') {
        localStorage.setItem('isLoggedIn', 'true');
        showMainApp();
        showSuccessMessage('Login successful!');
    } else {
        showErrorMessage('Invalid credentials. Use admin/password');
    }
}

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    showLoginPage();
}

function showLoginPage() {
    if (loginPage) loginPage.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
}

function showMainApp() {
    if (loginPage) loginPage.style.display = 'none';
    if (mainApp) mainApp.style.display = 'flex';
}

function handleNavigation(e) {
    e.preventDefault();
    const targetSection = e.currentTarget.dataset.section;
    
    // Update active nav link
    navLinks.forEach(link => link.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Show target section
    sections.forEach(section => section.classList.remove('active'));
    const targetSectionElement = document.getElementById(targetSection);
    if (targetSectionElement) {
        targetSectionElement.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'appointments': 'Appointments',
        'booking': 'Book Appointment',
        'patients': 'Patients',
        'doctors': 'Doctors',
        'reports': 'Reports'
    };
    
    if (pageTitle) {
        pageTitle.textContent = titles[targetSection] || 'Dashboard';
    }
    
    currentSection = targetSection;
    
    // Load section-specific data
    if (targetSection === 'dashboard') {
        updateDashboard();
    } else if (targetSection === 'appointments') {
        loadAppointments();
    } else if (targetSection === 'patients') {
        loadPatients();
    } else if (targetSection === 'doctors') {
        loadDoctors();
    } else if (targetSection === 'booking') {
        loadBookingForm();
    }
}

function toggleMobileMenu() {
    sidebar.classList.toggle('mobile-open');
    
    // Add overlay for mobile
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        });
    }
    
    overlay.classList.toggle('active');
}

function updateDashboard() {
    // Update statistics
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const totalPatients = patients.length;
    
    document.getElementById('total-appointments').textContent = totalAppointments;
    document.getElementById('pending-appointments').textContent = pendingAppointments;
    document.getElementById('completed-appointments').textContent = completedAppointments;
    document.getElementById('total-patients').textContent = totalPatients;
    
    // Load recent appointments
    loadRecentAppointments();
}

function loadRecentAppointments() {
    const recentList = document.getElementById('recent-list');
    if (!recentList) return;
    
    const recentAppointments = appointments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentList.innerHTML = '';
    
    if (recentAppointments.length === 0) {
        recentList.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>No recent appointments</p></div>';
        return;
    }
    
    recentAppointments.forEach(appointment => {
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'recent-appointment';
        appointmentElement.innerHTML = `
            <div class="recent-appointment-info">
                <h4>${appointment.patientName}</h4>
                <p>${formatDate(appointment.date)} at ${formatTime(appointment.time)} - ${appointment.type}</p>
            </div>
            <span class="status ${appointment.status}">${appointment.status}</span>
        `;
        recentList.appendChild(appointmentElement);
    });
}

function loadAppointments() {
    const appointmentsList = document.getElementById('appointments-list');
    if (!appointmentsList) return;
    
    appointmentsList.innerHTML = '';
    
    // Create table header
    const header = document.createElement('div');
    header.className = 'appointment-header';
    header.innerHTML = `
        <div>Patient</div>
        <div>Date</div>
        <div>Time</div>
        <div>Type</div>
        <div>Status</div>
        <div>Actions</div>
    `;
    appointmentsList.appendChild(header);
    
    // Add appointments
    appointments.forEach(appointment => {
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-item';
        appointmentElement.innerHTML = `
            <div>
                <strong>${appointment.patientName}</strong>
                <br><small>${appointment.doctor}</small>
            </div>
            <div>${formatDate(appointment.date)}</div>
            <div>${formatTime(appointment.time)}</div>
            <div>${appointment.type}</div>
            <div><span class="status ${appointment.status}">${appointment.status}</span></div>
            <div>
                <button class="btn btn-secondary btn-sm" onclick="editAppointment(${appointment.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${appointment.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        appointmentsList.appendChild(appointmentElement);
    });
}

function loadPatients() {
    const patientsList = document.getElementById('patients-list');
    if (!patientsList) return;
    
    patientsList.innerHTML = '';
    
    patients.forEach(patient => {
        const patientElement = document.createElement('div');
        patientElement.className = 'patient-card';
        patientElement.innerHTML = `
            <div class="patient-header">
                <div class="patient-info">
                    <h3>${patient.name}</h3>
                    <p>${patient.age} years old • ${patient.gender}</p>
                    <p><i class="fas fa-phone"></i> ${patient.phone}</p>
                    <p><i class="fas fa-envelope"></i> ${patient.email}</p>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn btn-primary btn-sm" onclick="bookAppointmentForPatient(${patient.id})">
                    <i class="fas fa-calendar-plus"></i> Book
                </button>
                <button class="btn btn-secondary btn-sm" onclick="editPatient(${patient.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deletePatient(${patient.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        patientsList.appendChild(patientElement);
    });
}

function loadDoctors() {
    const doctorsList = document.getElementById('doctors-list');
    if (!doctorsList) return;
    
    doctorsList.innerHTML = '';
    
    doctors.forEach(doctor => {
        const availabilityClass = doctor.availability === 'available' ? 'available' : 
                                 doctor.availability === 'busy' ? 'busy' : 'off-duty';
        
        const doctorElement = document.createElement('div');
        doctorElement.className = 'doctor-card';
        doctorElement.innerHTML = `
            <div class="doctor-header">
                <div class="doctor-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="doctor-info">
                    <h3>${doctor.name}</h3>
                    <p class="specialization">${formatSpecialization(doctor.specialization)}</p>
                    <p class="experience">${doctor.experience} years experience</p>
                    <div class="availability-status">
                        <span class="status ${availabilityClass}">${formatAvailability(doctor.availability)}</span>
                    </div>
                </div>
            </div>
            <div class="doctor-details">
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${doctor.phone}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-envelope"></i>
                    <span>${doctor.email}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${doctor.workingHours}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>$${doctor.consultationFee}</span>
                </div>
            </div>
            <div class="doctor-bio">
                <p>${doctor.bio}</p>
            </div>
            <div class="doctor-actions">
                <button class="btn btn-primary btn-sm" onclick="bookAppointmentWithDoctor(${doctor.id})" ${doctor.availability !== 'available' ? 'disabled' : ''}>
                    <i class="fas fa-calendar-plus"></i> Book Appointment
                </button>
                <button class="btn btn-secondary btn-sm" onclick="editDoctor(${doctor.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteDoctor(${doctor.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        doctorsList.appendChild(doctorElement);
    });
}

function loadBookingForm() {
    // Populate patient select
    const patientSelect = document.getElementById('booking-patient-select');
    if (patientSelect) {
        patientSelect.innerHTML = '<option value="">Choose existing patient</option>';
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} - ${patient.phone}`;
            patientSelect.appendChild(option);
        });
    }
    
    // Set minimum date to today
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
    
    // Reset form steps
    currentStep = 1;
    updateFormStep();
}

function nextStep() {
    if (currentStep < 2) {
        currentStep++;
        updateFormStep();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateFormStep();
    }
}

function updateFormStep() {
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });
}

function toggleNewPatientFields() {
    const newPatientFields = document.getElementById('new-patient-fields');
    const patientSelect = document.getElementById('booking-patient-select');
    const toggle = document.getElementById('new-patient-toggle');
    
    if (newPatientFields.style.display === 'none' || !newPatientFields.style.display) {
        newPatientFields.style.display = 'block';
        patientSelect.disabled = true;
        patientSelect.value = '';
        toggle.innerHTML = '<i class="fas fa-user"></i> Existing Patient';
    } else {
        newPatientFields.style.display = 'none';
        patientSelect.disabled = false;
        toggle.innerHTML = '<i class="fas fa-user-plus"></i> New Patient';
    }
}

// Modal functions
function openAppointmentModal(appointmentId = null) {
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('appointment-form');
    const title = document.getElementById('appointment-modal-title');
    
    if (appointmentId) {
        const appointment = appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            editingAppointment = appointment;
            title.textContent = 'Edit Appointment';
            populateAppointmentForm(appointment);
        }
    } else {
        editingAppointment = null;
        title.textContent = 'Add New Appointment';
        form.reset();
        populatePatientSelect();
    }
    
    modal.style.display = 'block';
}

function openPatientModal(patientId = null) {
    const modal = document.getElementById('patient-modal');
    const form = document.getElementById('patient-form');
    const title = document.getElementById('patient-modal-title');
    
    if (patientId) {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            editingPatient = patient;
            title.textContent = 'Edit Patient';
            populatePatientForm(patient);
        }
    } else {
        editingPatient = null;
        title.textContent = 'Add New Patient';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function openDoctorModal(doctorId = null) {
    const modal = document.getElementById('doctor-modal');
    const form = document.getElementById('doctor-form');
    const title = document.getElementById('doctor-modal-title');
    
    if (doctorId) {
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
            editingDoctor = doctor;
            title.textContent = 'Edit Doctor';
            populateDoctorForm(doctor);
        }
    } else {
        editingDoctor = null;
        title.textContent = 'Add New Doctor';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    editingAppointment = null;
    editingPatient = null;
    editingDoctor = null;
}

// Form submission handlers
function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const appointmentData = {
        patientId: parseInt(document.getElementById('patient-select').value),
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        type: document.getElementById('appointment-type').value,
        notes: document.getElementById('appointment-notes').value,
        status: 'pending',
        doctor: 'Dr. Smith' // Default doctor
    };
    
    // Get patient name
    const patient = patients.find(p => p.id === appointmentData.patientId);
    if (patient) {
        appointmentData.patientName = patient.name;
    }
    
    if (editingAppointment) {
        // Update existing appointment
        const index = appointments.findIndex(apt => apt.id === editingAppointment.id);
        appointments[index] = { ...editingAppointment, ...appointmentData };
        showSuccessMessage('Appointment updated successfully!');
    } else {
        // Add new appointment
        appointmentData.id = Date.now();
        appointments.push(appointmentData);
        showSuccessMessage('Appointment created successfully!');
    }
    
    closeModal();
    loadAppointments();
    updateDashboard();
}

function handlePatientSubmit(e) {
    e.preventDefault();
    
    const patientData = {
        name: document.getElementById('patient-name').value,
        age: parseInt(document.getElementById('patient-age').value),
        gender: document.getElementById('patient-gender').value,
        phone: document.getElementById('patient-phone').value,
        email: document.getElementById('patient-email').value,
        address: document.getElementById('patient-address').value,
        medicalHistory: document.getElementById('patient-medical-history').value
    };
    
    if (editingPatient) {
        // Update existing patient
        const index = patients.findIndex(p => p.id === editingPatient.id);
        patients[index] = { ...editingPatient, ...patientData };
        showSuccessMessage('Patient updated successfully!');
    } else {
        // Add new patient
        patientData.id = Date.now();
        patients.push(patientData);
        showSuccessMessage('Patient added successfully!');
    }
    
    closeModal();
    loadPatients();
    updateDashboard();
}

function handleDoctorSubmit(e) {
    e.preventDefault();
    
    const doctorData = {
        name: document.getElementById('doctor-name').value,
        license: document.getElementById('doctor-license').value,
        specialization: document.getElementById('doctor-specialization').value,
        experience: parseInt(document.getElementById('doctor-experience').value),
        phone: document.getElementById('doctor-phone').value,
        email: document.getElementById('doctor-email').value,
        availability: document.getElementById('doctor-availability').value,
        consultationFee: parseFloat(document.getElementById('doctor-consultation-fee').value),
        workingHours: document.getElementById('doctor-working-hours').value,
        qualifications: document.getElementById('doctor-qualifications').value,
        bio: document.getElementById('doctor-bio').value
    };
    
    if (editingDoctor) {
        // Update existing doctor
        const index = doctors.findIndex(d => d.id === editingDoctor.id);
        doctors[index] = { ...editingDoctor, ...doctorData };
        showSuccessMessage('Doctor updated successfully!');
    } else {
        // Add new doctor
        doctorData.id = Date.now();
        doctors.push(doctorData);
        showSuccessMessage('Doctor added successfully!');
    }
    
    closeModal();
    loadDoctors();
    updateDashboard();
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    let patientId;
    let patientName;
    
    // Check if using existing patient or creating new one
    const newPatientFields = document.getElementById('new-patient-fields');
    if (newPatientFields.style.display === 'block') {
        // Create new patient
        const newPatient = {
            id: Date.now(),
            name: document.getElementById('booking-patient-name').value,
            phone: document.getElementById('booking-patient-phone').value,
            email: document.getElementById('booking-patient-email').value,
            age: parseInt(document.getElementById('booking-patient-age').value),
            gender: 'not-specified',
            address: '',
            medicalHistory: ''
        };
        patients.push(newPatient);
        patientId = newPatient.id;
        patientName = newPatient.name;
    } else {
        // Use existing patient
        patientId = parseInt(document.getElementById('booking-patient-select').value);
        const patient = patients.find(p => p.id === patientId);
        patientName = patient ? patient.name : '';
    }
    
    const appointmentData = {
        id: Date.now(),
        patientId: patientId,
        patientName: patientName,
        date: document.getElementById('booking-date').value,
        time: document.getElementById('booking-time').value,
        type: document.getElementById('booking-type').value,
        doctor: document.getElementById('booking-doctor').value,
        notes: document.getElementById('booking-notes').value,
        status: 'confirmed'
    };
    
    appointments.push(appointmentData);
    showSuccessMessage('Appointment booked successfully!');
    
    // Reset form
    document.getElementById('booking-form').reset();
    currentStep = 1;
    updateFormStep();
    loadBookingForm();
    updateDashboard();
}

// Utility functions
function populatePatientSelect() {
    const select = document.getElementById('patient-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Patient</option>';
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.name} - ${patient.phone}`;
        select.appendChild(option);
    });
}

function populateAppointmentForm(appointment) {
    document.getElementById('patient-select').value = appointment.patientId;
    document.getElementById('appointment-date').value = appointment.date;
    document.getElementById('appointment-time').value = appointment.time;
    document.getElementById('appointment-type').value = appointment.type;
    document.getElementById('appointment-notes').value = appointment.notes || '';
}

function populatePatientForm(patient) {
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-age').value = patient.age;
    document.getElementById('patient-gender').value = patient.gender;
    document.getElementById('patient-phone').value = patient.phone;
    document.getElementById('patient-email').value = patient.email || '';
    document.getElementById('patient-address').value = patient.address || '';
    document.getElementById('patient-medical-history').value = patient.medicalHistory || '';
}

function populateDoctorForm(doctor) {
    document.getElementById('doctor-name').value = doctor.name;
    document.getElementById('doctor-license').value = doctor.license;
    document.getElementById('doctor-specialization').value = doctor.specialization;
    document.getElementById('doctor-experience').value = doctor.experience;
    document.getElementById('doctor-phone').value = doctor.phone;
    document.getElementById('doctor-email').value = doctor.email;
    document.getElementById('doctor-availability').value = doctor.availability;
    document.getElementById('doctor-consultation-fee').value = doctor.consultationFee;
    document.getElementById('doctor-working-hours').value = doctor.workingHours;
    document.getElementById('doctor-qualifications').value = doctor.qualifications || '';
    document.getElementById('doctor-bio').value = doctor.bio || '';
}

function editAppointment(id) {
    openAppointmentModal(id);
}

function editPatient(id) {
    openPatientModal(id);
}

function editDoctor(id) {
    openDoctorModal(id);
}

function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        appointments = appointments.filter(apt => apt.id !== id);
        loadAppointments();
        updateDashboard();
        showSuccessMessage('Appointment deleted successfully!');
    }
}

function deletePatient(id) {
    if (confirm('Are you sure you want to delete this patient?')) {
        patients = patients.filter(p => p.id !== id);
        // Also remove related appointments
        appointments = appointments.filter(apt => apt.patientId !== id);
        loadPatients();
        loadAppointments();
        updateDashboard();
        showSuccessMessage('Patient deleted successfully!');
    }
}

function deleteDoctor(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        doctors = doctors.filter(d => d.id !== id);
        loadDoctors();
        updateDashboard();
        showSuccessMessage('Doctor deleted successfully!');
    }
}

function bookAppointmentWithDoctor(doctorId) {
    // Switch to booking section and pre-select doctor
    document.querySelector('[data-section="booking"]').click();
    setTimeout(() => {
        const doctorSelect = document.getElementById('booking-doctor');
        if (doctorSelect) {
            // Find the doctor and set the select value
            const doctor = doctors.find(d => d.id === doctorId);
            if (doctor) {
                // Update the doctor select options to include the doctor ID
                Array.from(doctorSelect.options).forEach(option => {
                    if (option.textContent.includes(doctor.name)) {
                        doctorSelect.value = option.value;
                    }
                });
            }
        }
    }, 100);
}

function bookAppointmentForPatient(patientId) {
    // Switch to booking section and pre-select patient
    document.querySelector('[data-section="booking"]').click();
    setTimeout(() => {
        const patientSelect = document.getElementById('booking-patient-select');
        if (patientSelect) {
            patientSelect.value = patientId;
        }
    }, 100);
}

function setupSearchAndFilters() {
    // Appointment filters
    const filterDate = document.getElementById('filter-date');
    const filterStatus = document.getElementById('filter-status');
    const searchPatient = document.getElementById('search-patient');
    
    if (filterDate) {
        filterDate.addEventListener('change', filterAppointments);
    }
    if (filterStatus) {
        filterStatus.addEventListener('change', filterAppointments);
    }
    if (searchPatient) {
        searchPatient.addEventListener('input', filterAppointments);
    }
    
    // Patient search
    const searchPatients = document.getElementById('search-patients');
    if (searchPatients) {
        searchPatients.addEventListener('input', filterPatients);
    }

    // Doctor search and filters
    const searchDoctors = document.getElementById('search-doctors');
    const filterSpecialization = document.getElementById('filter-specialization');
    const filterAvailability = document.getElementById('filter-availability');
    
    if (searchDoctors) {
        searchDoctors.addEventListener('input', filterDoctors);
    }
    if (filterSpecialization) {
        filterSpecialization.addEventListener('change', filterDoctors);
    }
    if (filterAvailability) {
        filterAvailability.addEventListener('change', filterDoctors);
    }
}

function filterAppointments() {
    const dateFilter = document.getElementById('filter-date')?.value;
    const statusFilter = document.getElementById('filter-status')?.value;
    const searchFilter = document.getElementById('search-patient')?.value.toLowerCase();
    
    let filteredAppointments = appointments;
    
    if (dateFilter) {
        filteredAppointments = filteredAppointments.filter(apt => apt.date === dateFilter);
    }
    
    if (statusFilter) {
        filteredAppointments = filteredAppointments.filter(apt => apt.status === statusFilter);
    }
    
    if (searchFilter) {
        filteredAppointments = filteredAppointments.filter(apt => 
            apt.patientName.toLowerCase().includes(searchFilter)
        );
    }
    
    displayFilteredAppointments(filteredAppointments);
}

function filterPatients() {
    const searchFilter = document.getElementById('search-patients')?.value.toLowerCase();
    
    let filteredPatients = patients;
    
    if (searchFilter) {
        filteredPatients = filteredPatients.filter(patient => 
            patient.name.toLowerCase().includes(searchFilter) ||
            patient.phone.includes(searchFilter) ||
            patient.email.toLowerCase().includes(searchFilter)
        );
    }
    
    displayFilteredPatients(filteredPatients);
}

function displayFilteredAppointments(filteredAppointments) {
    const appointmentsList = document.getElementById('appointments-list');
    if (!appointmentsList) return;
    
    appointmentsList.innerHTML = '';
    
    // Create table header
    const header = document.createElement('div');
    header.className = 'appointment-header';
    header.innerHTML = `
        <div>Patient</div>
        <div>Date</div>
        <div>Time</div>
        <div>Type</div>
        <div>Status</div>
        <div>Actions</div>
    `;
    appointmentsList.appendChild(header);
    
    // Add filtered appointments
    filteredAppointments.forEach(appointment => {
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-item';
        appointmentElement.innerHTML = `
            <div>
                <strong>${appointment.patientName}</strong>
                <br><small>${appointment.doctor}</small>
            </div>
            <div>${formatDate(appointment.date)}</div>
            <div>${formatTime(appointment.time)}</div>
            <div>${appointment.type}</div>
            <div><span class="status ${appointment.status}">${appointment.status}</span></div>
            <div>
                <button class="btn btn-secondary btn-sm" onclick="editAppointment(${appointment.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${appointment.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        appointmentsList.appendChild(appointmentElement);
    });
}

function displayFilteredPatients(filteredPatients) {
    const patientsList = document.getElementById('patients-list');
    if (!patientsList) return;
    
    patientsList.innerHTML = '';
    
    filteredPatients.forEach(patient => {
        const patientElement = document.createElement('div');
        patientElement.className = 'patient-card';
        patientElement.innerHTML = `
            <div class="patient-header">
                <div class="patient-info">
                    <h3>${patient.name}</h3>
                    <p>${patient.age} years old • ${patient.gender}</p>
                    <p><i class="fas fa-phone"></i> ${patient.phone}</p>
                    <p><i class="fas fa-envelope"></i> ${patient.email}</p>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn btn-primary btn-sm" onclick="bookAppointmentForPatient(${patient.id})">
                    <i class="fas fa-calendar-plus"></i> Book
                </button>
                <button class="btn btn-secondary btn-sm" onclick="editPatient(${patient.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deletePatient(${patient.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        patientsList.appendChild(patientElement);
    });
}

// Message functions
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Style the message
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// Utility formatting functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .btn-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
    }
`;
document.head.appendChild(style);