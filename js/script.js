// js/script.js - TaskFlow Pro: Full CRUD, LocalStorage, Event Delegation, Filters, Dark Mode

// ---------- STATE ----------
let tasks = [];               // array of task objects
let currentFilter = "all";   // 'all', 'active', 'completed'
let searchQuery = "";        // string for title search

// DOM elements
const tasksContainer = document.getElementById("tasksContainer");
const addBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskTitleInput");
const filterAllBtn = document.getElementById("filterAll");
const filterActiveBtn = document.getElementById("filterActive");
const filterCompletedBtn = document.getElementById("filterCompleted");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const markAllBtn = document.getElementById("markAllBtn");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const taskCounterSpan = document.getElementById("activeTasksCount");
const themeToggle = document.getElementById("themeToggleBtn");

// Modal elements
const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const modalSaveBtn = document.getElementById("modalSaveBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalOverlay = document.getElementById("modalOverlay");

let currentEditId = null;

// ---------- HELPER: Save & Load from localStorage ----------
function saveToLocalStorage() {
  localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
  localStorage.setItem("taskflow_theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function loadFromLocalStorage() {
  const storedTasks = localStorage.getItem("taskflow_tasks");
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  } else {
    // default demo tasks for beautiful showcase
    tasks = [
      { id: Date.now() + 1, title: "Welcome to TaskFlow Pro ✨", completed: false, createdAt: new Date().toISOString() },
      { id: Date.now() + 2, title: "Toggle dark mode from top right", completed: false, createdAt: new Date().toISOString() },
      { id: Date.now() + 3, title: "Create tasks & experience glassmorphism", completed: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
    ];
    saveToLocalStorage();
  }
  // load theme preference
  const savedTheme = localStorage.getItem("taskflow_theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    updateThemeIcon(true);
  } else {
    document.body.classList.remove("dark");
    updateThemeIcon(false);
  }
}

// format date nicely
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ---------- CORE: Filter + Search logic ----------
function getFilteredTasks() {
  let filtered = [...tasks];
  // filter by completion status
  if (currentFilter === "active") filtered = filtered.filter(task => !task.completed);
  else if (currentFilter === "completed") filtered = filtered.filter(task => task.completed);
  // search by title (case insensitive)
  if (searchQuery.trim() !== "") {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter(task => task.title.toLowerCase().includes(lowerQuery));
  }
  return filtered;
}

// update active task counter
function updateCounter() {
  const activeCount = tasks.filter(task => !task.completed).length;
  taskCounterSpan.innerText = activeCount;
}

// Render tasks dynamically using DOM + event delegation (innerHTML approach but with event delegation at parent)
function renderTasks() {
  const filtered = getFilteredTasks();
  updateCounter();

  if (filtered.length === 0) {
    tasksContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <p>✨ No tasks found ✨<br>Create your first task or adjust filters</p>
      </div>
    `;
    return;
  }

  // generate task cards with data attributes for event delegation
  tasksContainer.innerHTML = filtered.map(task => {
    const completedClass = task.completed ? "completed-task" : "";
    const statusText = task.completed ? "Done" : "Pending";
    const statusClass = task.completed ? "status-badge" : "status-badge pending";
    return `
      <div class="task-card ${completedClass}" data-task-id="${task.id}">
        <div class="task-header">
          <span class="task-title">${escapeHtml(task.title)}</span>
        </div>
        <div class="task-meta">
          <span class="task-date"><i class="far fa-calendar-alt"></i> ${formatDate(task.createdAt)}</span>
          <span class="${statusClass}"><i class="fas ${task.completed ? 'fa-check-circle' : 'fa-clock'}"></i> ${statusText}</span>
        </div>
        <div class="task-actions">
          <button class="complete-btn" data-action="complete" data-id="${task.id}" aria-label="Toggle complete"><i class="fas ${task.completed ? 'fa-undo-alt' : 'fa-check-circle'}"></i></button>
          <button class="edit-btn" data-action="edit" data-id="${task.id}" aria-label="Edit task"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-action="delete" data-id="${task.id}" aria-label="Delete task"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join("");
}

// simple escape to avoid XSS
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
    return c;
  });
}

// ---------- CRUD OPERATIONS ----------
function addTask(title) {
  if (!title.trim()) {
    alert("Task title cannot be empty!");
    return false;
  }
  const newTask = {
    id: Date.now(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  saveToLocalStorage();
  renderTasks();
  return true;
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveToLocalStorage();
  renderTasks();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveToLocalStorage();
    renderTasks();
  }
}

function updateTaskTitle(id, newTitle) {
  if (!newTitle.trim()) {
    alert("Title cannot be empty!");
    return false;
  }
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = newTitle.trim();
    saveToLocalStorage();
    renderTasks();
    return true;
  }
  return false;
}

function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  saveToLocalStorage();
  renderTasks();
}

function markAllCompleted() {
  tasks.forEach(task => { task.completed = true; });
  saveToLocalStorage();
  renderTasks();
}

// ---------- MODAL LOGIC (edit) ----------
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  currentEditId = id;
  editTaskInput.value = task.title;
  editModal.hidden = false;
  editTaskInput.focus();
}

function closeEditModal() {
  editModal.hidden = true;
  currentEditId = null;
  editTaskInput.value = "";
}

function saveEditModal() {
  if (currentEditId !== null) {
    const newTitle = editTaskInput.value;
    if (updateTaskTitle(currentEditId, newTitle)) {
      closeEditModal();
    }
  } else {
    closeEditModal();
  }
}

// ---------- EVENT DELEGATION (Tasks container) ----------
tasksContainer.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  const action = button.getAttribute("data-action");
  const id = parseInt(button.getAttribute("data-id"));
  if (!id && action !== "markAll" && action !== "clear") return;

  if (action === "complete") toggleComplete(id);
  else if (action === "delete") deleteTask(id);
  else if (action === "edit") openEditModal(id);
});

// ---------- FILTER & SEARCH HANDLERS ----------
function setActiveFilterBtn(filter) {
  [filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach(btn => btn.classList.remove("active"));
  if (filter === "all") filterAllBtn.classList.add("active");
  else if (filter === "active") filterActiveBtn.classList.add("active");
  else if (filter === "completed") filterCompletedBtn.classList.add("active");
}

filterAllBtn.addEventListener("click", () => {
  currentFilter = "all";
  setActiveFilterBtn("all");
  renderTasks();
});
filterActiveBtn.addEventListener("click", () => {
  currentFilter = "active";
  setActiveFilterBtn("active");
  renderTasks();
});
filterCompletedBtn.addEventListener("click", () => {
  currentFilter = "completed";
  setActiveFilterBtn("completed");
  renderTasks();
});

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderTasks();
});
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  renderTasks();
});

// additional buttons
clearCompletedBtn.addEventListener("click", clearCompletedTasks);
markAllBtn.addEventListener("click", markAllCompleted);

// Add task with enter key + button
addBtn.addEventListener("click", () => {
  if (addTask(taskInput.value)) taskInput.value = "";
});
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    if (addTask(taskInput.value)) taskInput.value = "";
  }
});

// ---------- DARK MODE TOGGLE & ICON PERSISTENCE ----------
function updateThemeIcon(isDark) {
  const icon = themeToggle.querySelector("i");
  if (isDark) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  updateThemeIcon(isDark);
  localStorage.setItem("taskflow_theme", isDark ? "dark" : "light");
});

// ---------- MODAL EVENT LISTENERS (accessibility) ----------
modalSaveBtn.addEventListener("click", saveEditModal);
modalCancelBtn.addEventListener("click", closeEditModal);
closeModalBtn.addEventListener("click", closeEditModal);
modalOverlay.addEventListener("click", closeEditModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && editModal && !editModal.hidden) {
    closeEditModal();
  }
});

// ---------- INITIAL BOOTSTRAP ----------
function init() {
  loadFromLocalStorage();
  renderTasks();
  // sync filter UI
  setActiveFilterBtn(currentFilter);
  // extra accessibility: set aria-pressed states for filter, etc.
}

init();