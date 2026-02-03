
if (localStorage.getItem('session') !== 'yes') {
    window.location.href = "./login.html";
}

const userRole = localStorage.getItem('role');
const userId = String(localStorage.getItem('userId')); 

const dashboardSection = document.getElementById('dashboardSection');
const tasksSection = document.getElementById('tasksSection');
const profileSection = document.getElementById('profileSection');

const menuItems = document.querySelectorAll('.menu-item');
const dashboardMenu = document.querySelector('[data-section="dashboard"]');

// ===== DASHBOARD =====
const taskTable = document.getElementById('taskTable');
const totalTasks = document.getElementById('totalTasks');
const inProgress = document.getElementById('inProgress');
const completed = document.getElementById('completed');
const pending = document.getElementById('pending');
const searchTask = document.getElementById('searchTask');

// ===== MY TASK =====
const myTaskTable = document.getElementById('myTaskTable');
const myTotalTasks = document.getElementById('myTotalTasks');
const myInProgress = document.getElementById('myInProgress');
const myCompleted = document.getElementById('myCompleted');
const myPending = document.getElementById('myPending');
const searchMyTask = document.getElementById('searchMyTask');

const taskName = document.getElementById('taskName');
const taskCategory = document.getElementById('taskCategory');
const taskPriority = document.getElementById('taskPriority');
const taskStatus = document.getElementById('taskStatus');


let tasks = [];
let myTasks = [];
let editingTaskId = null;

// ===== UTIL =====
function getStatusColor(status) {
    if (status === "Completed") return "bg-success";
    if (status === "In Progress") return "bg-primary";
    return "bg-warning text-dark";
}

function hideAllSections() {
    dashboardSection.classList.add('d-none');
    tasksSection.classList.add('d-none');
    profileSection.classList.add('d-none');
}

// ===== DASHBOARD =====
function renderTasks(data) {
    taskTable.innerHTML = "";
    data.forEach(task => {
        taskTable.innerHTML += `
            <tr>
                <td>${task.name}</td>
                <td>${task.category}</td>
                <td>${task.priority}</td>
                <td><span class="badge ${getStatusColor(task.status)}">${task.status}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm me-1" onclick="editTask('${task.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function updateStats(data) {
    totalTasks.textContent = data.length;
    inProgress.textContent = data.filter(t => t.status === "In Progress").length;
    completed.textContent = data.filter(t => t.status === "Completed").length;
    pending.textContent = data.filter(t => t.status === "Pending").length;
}

// ===== MY TASK =====
function renderMyTasks(data) {
    myTaskTable.innerHTML = "";
    data.forEach(task => {
        myTaskTable.innerHTML += `
            <tr>
                <td>${task.name}</td>
                <td>${task.category}</td>
                <td>${task.priority}</td>
                <td><span class="badge ${getStatusColor(task.status)}">${task.status}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm me-1" onclick="editTask('${task.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function updateMyStats(data) {
    myTotalTasks.textContent = data.length;
    myInProgress.textContent = data.filter(t => t.status === "In Progress").length;
    myCompleted.textContent = data.filter(t => t.status === "Completed").length;
    myPending.textContent = data.filter(t => t.status === "Pending").length;
}

// ===== LOAD =====
async function loadMyTasks() {
    const res = await fetch('http://localhost:5000/tasks');
    const data = await res.json();

    // Normalizar todos los ids a string
    myTasks = data.filter(t => String(t.userId) === userId).map(t => ({ ...t, id: String(t.id) }));
    renderMyTasks(myTasks);
    updateMyStats(myTasks);
}

async function loadAdminTasks() {
    const res = await fetch('http://localhost:5000/tasks');
    const data = await res.json();

    tasks = data.map(t => ({ ...t, id: String(t.id) }));
    renderTasks(tasks);
    updateStats(tasks);
}

// ===== DELETE =====
async function deleteTask(id) {
    if (!confirm("¿Eliminar tarea?")) return;

    await fetch(`http://localhost:5000/tasks/${id}`, { method: 'DELETE' });

    tasks = tasks.filter(t => String(t.id) !== String(id));
    myTasks = myTasks.filter(t => String(t.id) !== String(id));

    renderTasks(tasks);
    updateStats(tasks);

    renderMyTasks(myTasks);
    updateMyStats(myTasks);
}

// ===== EDIT =====
function editTask(id) {
    const task =
        tasks.find(t => String(t.id) === String(id)) ||
        myTasks.find(t => String(t.id) === String(id));

    if (!task) return;

    editingTaskId = String(id);

    taskName.value = task.name;
    taskCategory.value = task.category;
    taskPriority.value = task.priority;
    taskStatus.value = task.status;

    new bootstrap.Modal(document.getElementById('newTaskModal')).show();
}

// ===== CREATE / UPDATE =====
document.getElementById('newTaskForm').addEventListener('submit', async e => {
    e.preventDefault();

    const taskData = {
        name: taskName.value,
        category: taskCategory.value,
        priority: taskPriority.value,
        status: taskStatus.value,
        userId
    };

    if (editingTaskId) {
        const res = await fetch(`http://localhost:5000/tasks/${editingTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        const updated = await res.json();

        // Actualizar ambos arrays
        tasks = tasks.map(t =>
            String(t.id) === String(editingTaskId) ? updated : t
        );

        myTasks = myTasks.map(t =>
            String(t.id) === String(editingTaskId) ? updated : t
        );

        editingTaskId = null;
    } else {
        const res = await fetch('http://localhost:5000/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        const created = await res.json();

        tasks.push(created);
        myTasks.push(created);
    }

    renderTasks(tasks);
    updateStats(tasks);

    renderMyTasks(myTasks);
    updateMyStats(myTasks);

    e.target.reset();
    bootstrap.Modal.getInstance(document.getElementById('newTaskModal')).hide();
});

// ===== SEARCH =====
searchMyTask.addEventListener('input', e => {
    const v = e.target.value.toLowerCase();
    renderMyTasks(myTasks.filter(t => t.name.toLowerCase().includes(v)));
});

searchTask.addEventListener('input', e => {
    const v = e.target.value.toLowerCase();
    renderTasks(tasks.filter(t => t.name.toLowerCase().includes(v)));
});

// ===== INIT =====
hideAllSections();

if (userRole === "Administrador") {
    dashboardSection.classList.remove('d-none');
    loadAdminTasks();
} else {
    tasksSection.classList.remove('d-none');
    dashboardMenu.style.display = 'none';
    loadMyTasks();
}

// ===== SIDEBAR =====
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        hideAllSections();
        const s = item.dataset.section;

        if (s === "dashboard" && userRole === "Administrador") dashboardSection.classList.remove('d-none');
        if (s === "tasks") tasksSection.classList.remove('d-none');
        if (s === "profile") profileSection.classList.remove('d-none');
    });
});