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
}