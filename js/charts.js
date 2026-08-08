let taskChart = null;
let categoryChart = null;
let weeklyChart = null;

function getChartTextColor() {
    const isDark =
        document.body.classList.contains("dark-theme") ||
        localStorage.getItem("theme") === "dark";

    if (isDark) {
        return "#ffffff";
    }

    const computedColor = getComputedStyle(document.body)
        .getPropertyValue("--chart-text")
        .trim();

    return computedColor || "#1f2937";
}

function getWeeklyData() {
    try {
        const stored = JSON.parse(localStorage.getItem("weeklyStats"));

        if (Array.isArray(stored) && stored.length === 7) {
            return stored;
        }
    } catch (e) {
        console.error("Error loading weeklyStats", e);
    }

    return [0, 0, 0, 0, 0, 0, 0];
}

function updateChart() {
    const taskCanvas = document.getElementById("taskChart");
    const categoryCanvas = document.getElementById("categoryChart");
    const weeklyCanvas = document.getElementById("weeklyChart");

    if (!taskCanvas || !categoryCanvas || !weeklyCanvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded.");
        return;
    }

    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    const study = tasks.filter(
        task => (task.category || "Personal") === "Study"
    ).length;

    const work = tasks.filter(
        task => (task.category || "Personal") === "Work"
    ).length;

    const personal = tasks.filter(
        task => (task.category || "Personal") === "Personal"
    ).length;

    const fitness = tasks.filter(
        task => (task.category || "Personal") === "Fitness"
    ).length;

    const weekData = getWeeklyData();
    const chartTextColor = getChartTextColor();

    // ==========================================
    // 1. TASK STATUS
    // ==========================================

    if (!taskChart) {
        taskChart = new Chart(taskCanvas.getContext("2d"), {
            type: "doughnut",

            data: {
                labels: ["Completed", "Pending"],

                datasets: [{
                    data: [completed, pending],
                    backgroundColor: ["#27ae60", "#f39c12"],
                    borderWidth: 0
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {
                    legend: {
                        position: "bottom",

                        labels: {
                            color: chartTextColor,
                            padding: 15
                        }
                    }
                }
            }
        });
    } else {
        taskChart.data.datasets[0].data = [
            completed,
            pending
        ];

        taskChart.options.plugins.legend.labels.color = chartTextColor;

        taskChart.update();
    }

    // ==========================================
    // 2. CATEGORY DISTRIBUTION
    // ==========================================

    if (!categoryChart) {
        categoryChart = new Chart(categoryCanvas.getContext("2d"), {
            type: "doughnut",

            data: {
                labels: [
                    "Study",
                    "Work",
                    "Personal",
                    "Fitness"
                ],

                datasets: [{
                    data: [
                        study,
                        work,
                        personal,
                        fitness
                    ],

                    backgroundColor: [
                        "#3498db",
                        "#8e44ad",
                        "#16a085",
                        "#e67e22"
                    ],

                    borderWidth: 0
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                cutout: "65%",

                plugins: {
                    legend: {
                        position: "bottom",

                        labels: {
                            color: chartTextColor,
                            padding: 15
                        }
                    }
                }
            }
        });
    } else {
        categoryChart.data.datasets[0].data = [
            study,
            work,
            personal,
            fitness
        ];

        categoryChart.options.plugins.legend.labels.color =
            chartTextColor;

        categoryChart.update();
    }

    // ==========================================
    // 3. WEEKLY PRODUCTIVITY
    // ==========================================

    if (!weeklyChart) {
        weeklyChart = new Chart(weeklyCanvas.getContext("2d"), {
            type: "bar",

            data: {
                labels: [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun"
                ],

                datasets: [{
                    label: "Tasks Completed",
                    data: weekData,
                    backgroundColor: "#ff7a18",
                    borderRadius: 8
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        ticks: {
                            color: chartTextColor
                        },

                        grid: {
                            display: false
                        }
                    },

                    y: {
                        beginAtZero: true,

                        ticks: {
                            color: chartTextColor
                        }
                    }
                }
            }
        });
    } else {
        weeklyChart.data.datasets[0].data = weekData;

        weeklyChart.options.scales.x.ticks.color =
            chartTextColor;

        weeklyChart.options.scales.y.ticks.color =
            chartTextColor;

        weeklyChart.update();
    }
}


// ==========================================
// Stable Chart Resize Observer
// ==========================================

function setupChartResizeObserver() {
    const chartBoxes = document.querySelectorAll(".chart-box");

    if (!chartBoxes.length || typeof ResizeObserver === "undefined") {
        return;
    }

    const observer = new ResizeObserver(() => {
        if (taskChart) {
            taskChart.resize();
        }

        if (categoryChart) {
            categoryChart.resize();
        }

        if (weeklyChart) {
            weeklyChart.resize();
        }
    });

    chartBoxes.forEach(box => observer.observe(box));

    const weeklyContainer = document.querySelector(".weekly-chart");

    if (weeklyContainer) {
        observer.observe(weeklyContainer);
    }
}


// ==========================================
// Initialize Charts After DOM Is Ready
// ==========================================

function initializeCharts() {
    updateChart();
    setupChartResizeObserver();
}