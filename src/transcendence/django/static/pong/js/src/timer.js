export default class Timer {
    constructor() {
      this.startTime = 0;
      this.elapsedTime = 0;
      this.timerInterval = null;
      this.timerElement = document.getElementById('elapsed-time-value');
  
      if (!this.timerElement) {
        console.error('Element with ID "elapsed-time-value" not found.');
      }
  
      this.updateDisplay(0);
    }
  
    start() {
      if (this.timerInterval !== null) return; // Prevent multiple intervals
      this.startTime = Date.now() - this.elapsedTime;
      this.timerInterval = setInterval(() => this.updateDisplay(Date.now()), 1000);
    }
  
    stop() {
      if (this.timerInterval !== null) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  
    reset() {
      this.elapsedTime = 0;
      this.updateDisplay(0);
    }
  
    updateDisplay(now) {
      if (!this.timerElement) return;
  
      this.elapsedTime = Math.max(0, now - this.startTime);
      const minutes = Math.floor(this.elapsedTime / 60000);
      const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
      this.timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }
  