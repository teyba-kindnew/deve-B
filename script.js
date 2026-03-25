const employeeListElement = document.getElementById("employeeList");
const employeeDetailsElement = document.getElementById("employeeDetails");
const employeeCountElement = document.getElementById("employeeCount");
const employeeForm = document.getElementById("employeeForm");
const addEmployeeBtn = document.getElementById("addEmployeeBtn");

let employees = [];
let selectedEmployeeId = null;

function formatSalary(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function getInitials(firstName, lastName) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function createAvatarMarkup(employee, detailsView = false) {
  const fallbackClass = detailsView ? "details-avatar-fallback" : "avatar-fallback";

  if (employee.profilePic) {
    return `
      <div class="${detailsView ? "details-avatar" : ""}">
        <img class="${detailsView ? "" : "avatar"}" src="${employee.profilePic}" alt="${employee.firstName} ${employee.lastName}">
      </div>
    `;
  }

  return `<div class="${fallbackClass}">${getInitials(employee.firstName, employee.lastName)}</div>`;
}

function renderemployees() {
  employeeListElement.innerHTML = "";
  employeeCountElement.textContent = `${employees.length} employee${employees.length === 1 ? "" : "s"}`;

  employees.forEach((employee) => {
    const employeeCard = document.createElement("article");
    employeeCard.className = "employee-card";
    employeeCard.innerHTML = `
      <div class="employee-summary" data-employee-id="${employee.id}">
        ${createAvatarMarkup(employee)}
        <div class="employee-meta">
          <h3>${employee.firstName} ${employee.lastName}</h3>
          <p>${employee.email}</p>
        </div>
      </div>
      <button class="delete-btn" data-delete-id="${employee.id}" type="button" aria-label="Delete employee">&times;</button>
    `;

    employeeListElement.appendChild(employeeCard);
  });

  if (!employees.length) {
    employeeDetailsElement.innerHTML = '<p class="empty-state">No employees available. Add a new employee to begin.</p>';
    selectedEmployeeId = null;
    return;
  }

  if (!employees.some((employee) => employee.id === selectedEmployeeId)) {
    selectedEmployeeId = employees[0].id;
  }

  renderSingleEmployee(selectedEmployeeId);
}

function renderSingleEmployee(employeeId) {
  const employee = employees.find((item) => item.id === employeeId);

  if (!employee) {
    employeeDetailsElement.innerHTML = '<p class="empty-state">Employee details could not be found.</p>';
    return;
  }

  selectedEmployeeId = employee.id;
  employeeDetailsElement.innerHTML = `
    <div class="details-header">
      ${createAvatarMarkup(employee, true)}
      <div>
        <h3>${employee.firstName} ${employee.lastName}</h3>
        <p>${employee.email}</p>
      </div>
    </div>
    <div class="details-grid">
      <div class="detail-row">
        <span class="detail-label">Contact Number</span>
        <span>${employee.contactNumber}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date of Birth</span>
        <span>${formatDate(employee.dateOfBirth)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Salary</span>
        <span>${formatSalary(employee.salary)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Employee ID</span>
        <span>#${employee.id}</span>
      </div>
    </div>
  `;
}

function deleteEmployee(employeeId) {
  employees = employees.filter((employee) => employee.id !== employeeId);
  renderemployees();
}

function getFormData() {
  const formData = new FormData(employeeForm);

  return {
    id: Date.now(),
    firstName: formData.get("firstName").trim(),
    lastName: formData.get("lastName").trim(),
    email: formData.get("email").trim(),
    contactNumber: formData.get("contactNumber").trim(),
    dateOfBirth: formData.get("dateOfBirth"),
    salary: Number(formData.get("salary")),
    profilePic: formData.get("profilePic").trim()
  };
}

async function loadEmployees() {
  try {
    const response = await fetch("data.json");

    if (!response.ok) {
      throw new Error("Unable to fetch employee data.");
    }

    employees = await response.json();
    renderemployees();
  } catch (error) {
    employeeListElement.innerHTML = `<p class="empty-state">${error.message}</p>`;
    employeeDetailsElement.innerHTML = '<p class="empty-state">Check that data.json is available and reload the page.</p>';
  }
}

addEmployeeBtn.addEventListener("click", () => {
  employeeForm.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("firstName").focus();
});

employeeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newEmployee = getFormData();
  employees = [newEmployee, ...employees];
  renderemployees();
  renderSingleEmployee(newEmployee.id);
  employeeForm.reset();
});

employeeListElement.addEventListener("click", (event) => {
  const summary = event.target.closest("[data-employee-id]");
  const deleteButton = event.target.closest("[data-delete-id]");

  if (deleteButton) {
    deleteEmployee(Number(deleteButton.dataset.deleteId));
    return;
  }

  if (summary) {
    renderSingleEmployee(Number(summary.dataset.employeeId));
  }
});

loadEmployees();
