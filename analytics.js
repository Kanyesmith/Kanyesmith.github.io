// Reported annual museum visitation, rounded to the nearest 0.1 million.
(() => {
  const museumData = [
    { name: 'Louvre', visitors: 8.9, region: 'Europe' },
    { name: 'Vatican Museums', visitors: 6.8, region: 'Europe' },
    { name: 'British Museum', visitors: 5.8, region: 'Europe' },
    { name: 'The Met', visitors: 5.8, region: 'North America' },
    { name: 'Tate Modern', visitors: 4.7, region: 'Europe' },
    { name: 'National Gallery, London', visitors: 4.0, region: 'Europe' },
    { name: 'National Museum of Korea', visitors: 3.4, region: 'Asia' },
    { name: 'Reina Sofía', visitors: 3.3, region: 'Europe' },
    { name: 'Museo del Prado', visitors: 3.3, region: 'Europe' },
    { name: 'MoMA', visitors: 2.8, region: 'North America' }
  ];
  const palette = ['#28735f', '#d18a58', '#344e65', '#c4a64c'];

  function buildCharts() {
    if (!window.Chart) return;
    const attendanceCanvas = document.querySelector('#visitors-chart');
    const regionCanvas = document.querySelector('#region-chart');
    if (!attendanceCanvas || !regionCanvas) return;
    Chart.defaults.font.family = 'DM Sans, sans-serif';
    Chart.defaults.color = '#69716d';
    new Chart(attendanceCanvas, {
      type: 'bar',
      data: {
        labels: museumData.map((museum) => museum.name),
        datasets: [{ label: 'Annual visitors', data: museumData.map((museum) => museum.visitors), backgroundColor: '#28735f', hoverBackgroundColor: '#1d5d4c', borderRadius: 2, maxBarThickness: 35 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `${context.parsed.x.toFixed(1)} million visitors` } } },
        scales: { x: { beginAtZero: true, title: { display: true, text: 'Annual visitors (millions)' }, grid: { color: '#e8e8e1' } }, y: { grid: { display: false } } }
      }
    });
    const regions = ['Europe', 'North America', 'Asia'];
    const regionCounts = regions.map((region) => museumData.filter((museum) => museum.region === region).length);
    new Chart(regionCanvas, {
      type: 'doughnut',
      data: { labels: regions, datasets: [{ data: regionCounts, backgroundColor: palette, borderColor: '#fffefa', borderWidth: 3, hoverOffset: 7 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '62%',
        plugins: { legend: { position: 'bottom', labels: { padding: 18, usePointStyle: true, pointStyle: 'circle' } }, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.parsed} of 10 museums` } } }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildCharts, { once: true });
  else buildCharts();
})();