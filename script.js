// ==========================================
// Mukul's To-Do App
// script.js
// ==========================================

// ---------- Elements ----------
const themeBtn = document.getElementById("themeBtn");
let darkMode = localStorage.getItem("theme") === "dark";
if (darkMode) {

    document.body.classList.add("dark-theme");

    themeBtn.textContent = "☀️";

}
else {

    themeBtn.textContent = "🌙";

}
const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTask");

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

const currentDate = document.getElementById("currentDate");

const searchTask = document.getElementById("searchTask");
const searchSection = document.getElementById("searchSection");
const filterButtons = document.querySelectorAll(".filter-btn");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressStatus = document.getElementById("progressStatus");

// ---------- Current Date ----------
const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
});

// ---------- Local Storage ----------
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let editIndex = -1;
let currentFilter = "all";

// ---------- Save ----------
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ---------- Counter ----------
function updateCounter() {
    taskCount.textContent = tasks.length;
}
// ==========================================
// Progress Bar
// ==========================================

function updateProgress() {

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(task => task.completed).length;

    const percentage =
        totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

    progressFill.style.width = percentage + "%";

 if (percentage < 30) {

    // Red
    progressFill.style.background = "#e74c3c";
    progressText.style.color = "#e74c3c";

}
else if (percentage < 70) {

    // Orange
    progressFill.style.background = "#f39c12";
    progressText.style.color = "#f39c12";

}
else {

    // Green
    progressFill.style.background = "#27ae60";
    progressText.style.color = "#27ae60";

}

    progressText.textContent =
    percentage === 100
        ? "🎉 100%"
        : percentage + "%";
    progressStatus.textContent =
        `${completedTasks} of ${totalTasks} Tasks Completed`;

}


// ---------- Format Date ----------
function formatDate(date) {

    if (!date) return "No Deadline";

    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}
// ==========================================
// Render Tasks
// ==========================================

function renderTasks(filter = "") {

    taskList.innerHTML = "";

    // Show / Hide Search Box
    if (tasks.length === 0) {
        searchSection.style.display = "none";
    } else {
        searchSection.style.display = "block";
    }

    const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3
    };

    const filteredTasks = tasks
    .filter(task => {

        // Search Filter
        const matchesSearch =
            task.text.toLowerCase().includes(filter.toLowerCase());

        // Status Filter
        const matchesStatus =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesStatus;

    })
        .sort((a, b) => {if (a.completed !== b.completed) {
    return a.completed ? 1 : -1;
}

            // Sort by Priority
            const priorityDiff =
                priorityOrder[a.priority || "Medium"] -
                priorityOrder[b.priority || "Medium"];

            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            // Sort by Due Date
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            return new Date(a.dueDate) - new Date(b.dueDate);

        });

    filteredTasks.forEach(task => {

        const actualIndex = tasks.indexOf(task);

        const li = document.createElement("li");
        li.className = "task";

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
            <div class="task-content">

                <span>${task.text}</span>

                <div class="task-info">

                    <div class="priority ${(task.priority || "Medium").toLowerCase()}">

                        ${
                            task.priority === "High"
                                ? "🔴 HIGH"
                                : task.priority === "Low"
                                ? "🟢 LOW"
                                : "🟡 MEDIUM"
                        }

                    </div>

                    <div class="due-date">

                        ${
                            task.dueDate
                                ? `📅 ${formatDate(task.dueDate)}`
                                : "⏳ No Deadline"
                        }

                    </div>

                </div>

            </div>

            <div>

                <button class="complete-btn" title="Complete Task">
                    <i class="fa-solid fa-check"></i>
                </button>

                <button class="edit-btn" title="Edit Task">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button class="delete-btn" title="Delete Task">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>
        `;

        // Complete Task
        li.querySelector(".complete-btn").addEventListener("click", () => {

            tasks[actualIndex].completed = !tasks[actualIndex].completed;

            saveTasks();

            renderTasks(searchTask.value);

        });

        // Edit Task
        li.querySelector(".edit-btn").addEventListener("click", () => {

            taskInput.value = tasks[actualIndex].text;

            priority.value = tasks[actualIndex].priority || "Medium";

            dueDate.value = tasks[actualIndex].dueDate || "";

            editIndex = actualIndex;

            taskInput.focus();

        });

        // Delete Task
        li.querySelector(".delete-btn").addEventListener("click", () => {

            tasks.splice(actualIndex, 1);

            saveTasks();

            renderTasks(searchTask.value);

        });

        taskList.appendChild(li);

    });

   updateCounter();
   updateProgress();

}
// ==========================================
// Add / Edit Task
// ==========================================

function addTask() {

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task!");
        return;
    }

    if (editIndex === -1) {

        // Add New Task
        tasks.push({
            text: text,
            completed: false,
            priority: priority.value,
            dueDate: dueDate.value
        });

    } else {

        // Update Existing Task
        tasks[editIndex].text = text;
        tasks[editIndex].priority = priority.value;
        tasks[editIndex].dueDate = dueDate.value;

        editIndex = -1;

    }

    saveTasks();

    renderTasks(searchTask.value);

    // Reset Form
    taskInput.value = "";
    priority.value = "Medium";
    dueDate.value = "";

    taskInput.focus();

}
// ==========================================
// Event Listeners
// ==========================================

// Add Task Button
addTaskBtn.addEventListener("click", addTask);

// Press Enter to Add Task
taskInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {
        addTask();
    }

});

// Search Tasks
searchTask.addEventListener("keyup", () => {

    renderTasks(searchTask.value);

});
// ==========================================
// Filter Buttons
// ==========================================

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active class
        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        // Highlight clicked button
        button.classList.add("active");

        // Update current filter
        currentFilter = button.dataset.filter;

        // Refresh tasks
        renderTasks(searchTask.value);

    });

});

// ==========================================
// Initial Load
// ==========================================

renderTasks();
themeBtn.addEventListener("click", () => {

    darkMode = !darkMode;

    document.body.classList.toggle("dark-theme");

    themeBtn.textContent = darkMode ? "☀️" : "🌙";

    localStorage.setItem(
        "theme",
        darkMode ? "dark" : "light"
    );

});