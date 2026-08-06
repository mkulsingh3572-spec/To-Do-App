console.log("pin.js loaded");
function togglePin(index) {

    tasks[index].pinned = !tasks[index].pinned;

    saveTasks();
refreshUI();
    showToast(
        tasks[index].pinned
            ? "📌 Task pinned!"
            : "📍 Task unpinned!",
        "info"
    );

}