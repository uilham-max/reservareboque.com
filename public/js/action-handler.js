class ActionHandler {
    static async execute(endpoint, successMessage, button) {
        const originalText = button.innerHTML;
        const loadingHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Carregando...';
        
        button.innerHTML = loadingHTML;
        button.disabled = true;

        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                ModalHandler.showSuccess(successMessage);
            } else {
                ModalHandler.showError('Erro ao executar a ação. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro:', error);
            ModalHandler.showError('Erro de conexão. Tente novamente.');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    static async submitForm(formElement, successMessage, button) {
        const originalText = button.innerHTML;
        const loadingHTML = '<span class="spinner-border spinner-border-sm"></span> Processando...';

        button.innerHTML = loadingHTML;
        button.disabled = true;

        try {
            const formData = new FormData(formElement);
            const urlEncoded = new URLSearchParams(formData);

            const response = await fetch(formElement.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: urlEncoded
            });

            if (response.ok) {
                ModalHandler.showSuccess(successMessage);
            } else {
                ModalHandler.showError('Erro ao processar requisição.');
            }

        } catch (error) {
            console.error(error);
            ModalHandler.showError('Erro de conexão.');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    static async info(message) {
        ModalHandler.showInfo(message);
    }
}