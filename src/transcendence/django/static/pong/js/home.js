function setupHome() {
    if (localStorage.getItem('tournament_status') === 'created') {
        const resumeButton = document.getElementById('resumeButton');
        resumeButton.disabled = false;
    }
    return;
}
