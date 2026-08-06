/* ===========================================================
   Mukul's Professional To-Do App
   Author : Mukul Anand
   Version: 2.0
   Description:
   A modern task management application featuring analytics,
   drag & drop, charts, pinning, import/export, streak tracking,
   and productivity insights.
=========================================================== */

// ---------- Elements ---------
const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const category = document.getElementById("category");
const dueDate = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTask");

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

const currentDate = document.getElementById("currentDate");

const searchTask = document.getElementById("searchTask");
const searchSection = document.getElementById("searchSection");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortBy = document.getElementById("sortBy");
let currentSort = "manual";
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
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
tasks.forEach((task, index) => {
    if (task.order === undefined) {
        task.order = index;
    }
});
let editIndex = -1;
let currentFilter = "all";
let currentCategory = "all";
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
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => {
        if (task.completed || !task.dueDate) return false;
        return new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
    }).length;
    const successRate =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);
    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("overdueTasks").textContent = overdue;
    document.getElementById("completionRate").textContent =
        successRate + "%";
}
// Complete Task
function toggleComplete(index) {
    const isCompleting = !tasks[index].completed;
    updateWeeklyStats(isCompleting);
    tasks[index].completed = isCompleting;
    showToast(
        isCompleting
            ? "✔️ Task completed!"
            : "↩️ Task marked active!",
        "success"
    );
    refreshUI(true);
}
// Render Tasks

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
            // Category Filter
            const matchesCategory =
                currentCategory === "all" ||
                (task.category || "Personal") === currentCategory;
            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );
        })
        .sort((a, b) => {
            // 📌 Pinned tasks always first
            // Active tasks always above completed tasks
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            // Within the same group, pinned tasks first
            if (a.pinned !== b.pinned) {
                return b.pinned - a.pinned;
            }
            switch (currentSort) {
                case "priority":
                    return priorityOrder[a.priority || "Medium"] -
                        priorityOrder[b.priority || "Medium"];
                case "duedate":
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case "alphabet":
                    return a.text.localeCompare(b.text);
                case "manual":
                default:
                    return a.order - b.order;
            }
        });

    filteredTasks.forEach(task => {
        const actualIndex = tasks.indexOf(task);
        const li = document.createElement("li");
        li.className = task.pinned
            ? "task pinned"
            : "task";
        // Check if task is overdue
        const isOverdue =
            task.dueDate &&
            !task.completed &&
            new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
        if (isOverdue) {
            li.classList.add("overdue");
        }
        li.setAttribute("draggable", "true");
        li.dataset.index = actualIndex;
        if (task.completed) {
            li.classList.add("completed");
        }
        li.innerHTML = `
            <div class="task-content">
    ${task.pinned ? `<i class="fa-solid fa-thumbtack pinned-icon"></i>` : ""}
    <h4 class="task-title">${task.text}</h4>
                <div class="task-info">
    <div class="category ${(task.category || "Personal").toLowerCase()}">
        ${task.category === "Study"
                ? "📚 STUDY"
                : task.category === "Work"
                    ? "💼 WORK"
                    : task.category === "Fitness"
                        ? "🏋️ FITNESS"
                        : "🏠 PERSONAL"
            }
    </div>
    <div class="priority ${(task.priority || "Medium").toLowerCase()}">
        ${task.priority === "High"
                ? "🔴 HIGH"
                : task.priority === "Low"
                    ? "🟢 LOW"
                    : "🟡 MEDIUM"
            }
    </div>
    <div class="due-date">
    ${isOverdue
                ? `🔴 OVERDUE • ${formatDate(task.dueDate)}`
                : task.dueDate
                    ? `📅 ${formatDate(task.dueDate)}`
                    : "⏳ No Deadline"
            }
</div>
</div>

            </div>

            <div class="task-buttons">

    <button class="pin-btn ${task.pinned ? "active-pin" : ""}" title="Pin Task">
        <i class="fa-solid fa-thumbtack"></i>
    </button>

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

</div>
        `;


        // Complete Button
        li.querySelector(".complete-btn").addEventListener("click", () => {

            toggleComplete(actualIndex);

        });
        li.querySelector(".pin-btn").addEventListener("click", () => {

            togglePin(actualIndex);

        });




        // Edit Task
        li.querySelector(".edit-btn").addEventListener("click", () => {

            taskInput.value = tasks[actualIndex].text;

            priority.value = tasks[actualIndex].priority || "Medium";
            category.value = tasks[actualIndex].category || "Personal";

            dueDate.value = tasks[actualIndex].dueDate || "";

            editIndex = actualIndex;

            taskInput.focus();

        });

        // Delete Task
        li.querySelector(".delete-btn").addEventListener("click", () => {

            deletedTask = tasks[actualIndex];

            deletedIndex = actualIndex;

            tasks.splice(actualIndex, 1);

            undoBtn.style.display = "block";

            showToast("🗑️ Task deleted", "error");

            refreshUI(true);

            clearTimeout(window.undoTimer);

            window.undoTimer = setTimeout(() => {

                deletedTask = null;

                deletedIndex = null;

                undoBtn.style.display = "none";

            }, 5000);
        });
        li.addEventListener("dragstart", handleDragStart);

        li.addEventListener("dragover", handleDragOver);

        li.addEventListener("drop", handleDrop);

        li.addEventListener("dragend", handleDragEnd);

        taskList.appendChild(li);

    });

    updateCounter();
    updateProgress();
    updateStatistics();

}
// ==========================================
// Add / Edit Task
// ==========================================

function addTask() {
    const text = taskInput.value.trim();
    if (text === "") {
        showToast("⚠️ Please enter a task!", "warning");
        return;
    }
    if (editIndex === -1) {
        // Add New Task
        tasks.push({
            text: text,
            completed: false,
            pinned: false,     // ← Add this line
            priority: priority.value,
            category: category.value,
            dueDate: dueDate.value,
            order: Date.now()
        });
        showToast("✅ Task added successfully!", "success");
    } else {
        // Update Existing Task
        tasks[editIndex].text = text;
        tasks[editIndex].priority = priority.value;
        tasks[editIndex].category = category.value;
        tasks[editIndex].dueDate = dueDate.value;
        showToast("✏️ Task updated!", "info");
        editIndex = -1;
    }
    refreshUI(true);
    // Reset Form
    taskInput.value = "";
    priority.value = "Medium";
    category.value = "Personal";
    dueDate.value = "";
    taskInput.focus();

}

// ==========================================
// Export Tasks
// ==========================================

function exportTasks() {

    const data = JSON.stringify(tasks, null, 2);

    const blob = new Blob([data], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "tasks.json";

    link.click();

    URL.revokeObjectURL(url);

    showToast("📤 Tasks exported successfully!", "success");

}
// ==========================================
// Import Tasks
// ==========================================

function importTasks(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const importedTasks = JSON.parse(e.target.result);

            if (!Array.isArray(importedTasks)) {
                throw new Error();
            }

            if (!confirm("Importing will replace all current tasks. Continue?")) {
                return;
            }

            tasks = importedTasks;

            refreshUI(true);
            showToast("📥 Tasks imported successfully!", "success");
            importFile.value = "";

        }

        catch {

            showToast("❌ Invalid JSON file!", "error");

        }

    };

    reader.readAsText(file);

}

// ==========================================
// Toast Notification
// ==========================================

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const undoBtn = document.getElementById("undoBtn");
let deletedTask = null;
let deletedIndex = null;

let draggedIndex = null;
let dropIndex = null;
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
exportBtn.addEventListener("click", exportTasks);

importFile.addEventListener("change", importTasks);
sortBy.addEventListener("change", () => {

    currentSort = sortBy.value;

    renderTasks(searchTask.value);

});
categoryFilter.addEventListener("change", () => {

    currentCategory = categoryFilter.value;

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
undoBtn.addEventListener("click", () => {

    if (deletedTask === null) return;

    tasks.splice(deletedIndex, 0, deletedTask);

    refreshUI(true);

    showToast("↩️ Task restored!", "success");

    undoBtn.style.display = "none";

    deletedTask = null;

    deletedIndex = null;

});
function handleDragStart() {

    draggedIndex = Number(this.dataset.index);

    this.classList.add("dragging");

}

function handleDragOver(e) {

    e.preventDefault();

    this.classList.add("drag-over");

}

function handleDrop() {

    dropIndex = Number(this.dataset.index);

    if (draggedIndex === dropIndex) return;

    // Remove dragged task
    const draggedTask = tasks.splice(draggedIndex, 1)[0];

    // Insert into new position
    tasks.splice(dropIndex, 0, draggedTask);

    // Reassign order values
    tasks.forEach((task, index) => {
        task.order = index;
    });
    refreshUI(true);

    showToast("📌 Task moved successfully!", "success");

}

function handleDragEnd() {

    document.querySelectorAll(".task").forEach(task => {

        task.classList.remove("dragging");

        task.classList.remove("drag-over");

    });

}

// ==========================================
// Initial Load
// ==========================================

renderTasks();
updateChart();
updateStreak();

function updateWeeklyStats(isCompleted = true) {
    let weeklyStats =
        JSON.parse(localStorage.getItem("weeklyStats")) ||
        [0, 0, 0, 0, 0, 0, 0];

    const today = new Date().getDay();
    const index = (today + 6) % 7;
    console.log("Before:", weeklyStats[index]);
    if (isCompleted) {
        weeklyStats[index]++;
    } else {
        weeklyStats[index] = Math.max(0, weeklyStats[index] - 1);
    }
    console.log("After:", weeklyStats[index]);
    localStorage.setItem(
        "weeklyStats",
        JSON.stringify(weeklyStats)
    );
}
function updateStreak() {
    const streak = localStorage.getItem("currentStreak") || 0;
    document.getElementById("currentStreak").textContent = streak;
}