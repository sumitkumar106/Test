document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('browserChart').getContext('2d');
    const browserChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Chrome', 'Firefox', 'Safari', 'Edge'],
            datasets: [{
                label: 'Performance Score',
                data: [95, 85, 90, 88],
                backgroundColor: [
                    'rgba(66, 133, 244, 0.2)',
                    'rgba(255, 159, 0, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(0, 135, 189, 0.2)'
                ],
                borderColor: [
                    'rgba(66, 133, 244, 1)',
                    'rgba(255, 159, 0, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(0, 135, 189, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
