// Client-side interactions & helper functions
document.addEventListener('DOMContentLoaded', () => {
  // Auto-hide alert messages after 5 seconds
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) {
        bsAlert.close();
      }
    }, 5000);
  });

  // Enable tooltips if present
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
