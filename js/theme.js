const themeBtn = document.getElementById("themeBtn");

let darkMode = localStorage.getItem("theme") === "dark";

function applyTheme() {

    if (darkMode) {
        document.body.classList.add("dark-theme");
        themeBtn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark-theme");
        themeBtn.textContent = "🌙";
    }

    localStorage.setItem("theme", darkMode ? "dark" : "light");
}

applyTheme();

themeBtn.addEventListener("click", () => {

    darkMode = !darkMode;

    applyTheme();

    // Redraw Chart.js charts with the new theme colors
    if (typeof updateChart === "function") {
        updateChart();
    }

});