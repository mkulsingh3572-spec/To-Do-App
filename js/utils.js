function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function refreshUI(save = false) {
    if (save) {
        saveTasks();
    }
    renderTasks(searchTask.value);
    updateChart();
    updateStats();
    updateProgress();
    updateStreak();
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

function showToast(message, type = "success") {
    toastMessage.textContent = message;
    toast.className = "";
    toast.classList.add(type);
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

