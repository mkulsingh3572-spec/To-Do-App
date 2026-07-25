// ==========================================
// Mukul's To-Do App
// script.js
// ==========================================

// Elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const currentDate = document.getElementById("currentDate");
const searchTask = document.getElementById("searchTask");
const searchSection = document.getElementById("searchSection");

// ==========================================
// Current Date
// ==========================================

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
});

// ==========================================
// Local Storage
// ==========================================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editIndex = -1;
// ==========================================
// Save Tasks
// ==========================================

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ==========================================
// Update Task Counter
// ==========================================

function updateCounter() {
    taskCount.textContent = `${tasks.length}`;
}

// ==========================================
// Render Tasks
// ==========================================

function renderTasks(filter = "") {

    taskList.innerHTML = "";

    // Show/Hide Search Box
    if (tasks.length === 0) {
        searchSection.style.display = "none";
    } else {
        searchSection.style.display = "block";
    }

    const filteredTasks = tasks.filter(task =>
        task.text.toLowerCase().includes(filter.toLowerCase())
    );

    filteredTasks.forEach(task => {

        const actualIndex = tasks.indexOf(task);

        const li = document.createElement("li");
        li.className = "task";

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
    <span>${task.text}</span>

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

}

// ==========================================
// Add Task
// ==========================================

function addTask() {

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task!");
        return;
    }

    if (editIndex === -1) {

        tasks.push({
            text: text,
            completed: false
        });

    } else {

        tasks[editIndex].text = text;

        editIndex = -1;

    }

    saveTasks();

    renderTasks(searchTask.value);

    taskInput.value = "";

    taskInput.focus();

}
// ==========================================
// Event Listeners
// ==========================================

// Add Button
addTaskBtn.addEventListener("click", addTask);

// Press Enter
taskInput.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {
        addTask();
    }

});

// Search
searchTask.addEventListener("keyup", function () {

    renderTasks(searchTask.value);

});

// ==========================================
// Initial Load
// ==========================================

renderTasks();