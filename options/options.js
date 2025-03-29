document.addEventListener('DOMContentLoaded', () => {
  const downloadLocation = document.getElementById('download-location');
  const saveBtn = document.getElementById('save-btn');

  // Load saved settings
  chrome.storage.sync.get(['downloadLocation'], (result) => {
    if (result.downloadLocation) {
      downloadLocation.value = result.downloadLocation;
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const location = downloadLocation.value.trim();
    chrome.storage.sync.set({ downloadLocation: location }, () => {
      // Show confirmation
      saveBtn.textContent = 'Saved!';
      setTimeout(() => {
        saveBtn.textContent = 'Save';
      }, 2000);
    });
  });
});