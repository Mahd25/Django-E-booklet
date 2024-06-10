const currentYear = new Date().getFullYear();
// Set the start year
document.getElementById('start-year').textContent = startYear;

// Check and set the current year only if it's different from start year
if (startYear !== currentYear) {
  document.getElementById('current-year').textContent = "-" + currentYear;
} else {
  // Optionally, you can hide the current year span if they are the same
  document.getElementById('current-year').style.display = 'none';
}
