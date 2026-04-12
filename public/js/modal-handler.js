class ModalHandler {
    static showSuccess(message) {
        document.getElementById('successModalMessage').textContent = message;
        document.getElementById('successModal').classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    static closeSuccess(callback) {
        const modal = document.getElementById('successModal');
        modal.classList.remove('visible');
        document.body.style.overflow = '';
        
        if (callback && typeof callback === 'function') {
            callback();
        }
    }

    static showError(message) {
        document.getElementById('errorModalMessage').textContent = message;
        document.getElementById('errorModal').classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    static closeError() {
        const modal = document.getElementById('errorModal');
        modal.classList.remove('visible');
        document.body.style.overflow = '';
    }
}