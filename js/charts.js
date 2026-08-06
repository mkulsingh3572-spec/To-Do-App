const ctx = document.getElementById("taskChart");
const categoryCtx = document.getElementById("categoryChart");
const weeklyCtx = document.getElementById("weeklyChart");
let taskChart;
let categoryChart;
let weeklyChart;
function updateChart() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;
    // Destroy old charts
    if (taskChart) taskChart.destroy();
    if (categoryChart) categoryChart.destroy();
    if (weeklyChart) weeklyChart.destroy();
    // =========================
    // Completion Chart
    // =========================
    taskChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [completed, pending],
                backgroundColor: [
                    "#27ae60",
                    "#f39c12"
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
                        color: "#ffffff",
                        padding: 15
                    }
                }
            }
        }
    });
    // =========================
    // Category Chart
    // =========================
    const study =
        tasks.filter(task => task.category === "Study").length;
    const work =
        tasks.filter(task => task.category === "Work").length;
    const personal =
        tasks.filter(task => task.category === "Personal").length;
    const fitness =
        tasks.filter(task => task.category === "Fitness").length;
    categoryChart = new Chart(categoryCtx, {
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
                        color: "#ffffff",
                        padding: 15
                    }
                }
            }
        }
    });
    const weekData =
        JSON.parse(localStorage.getItem("weeklyStats")) ||
        [0, 0, 0, 0, 0, 0, 0];
    weeklyChart = new Chart(weeklyCtx, {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
                        color: "#fff"
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#fff"
                    }
                }
            }
        }
    });
}