document.addEventListener('DOMContentLoaded', () => {
    const inputSenha = document.getElementById('senha');
    const inputSenhaRepita = document.getElementById('senhaRepita');
    
    inputSenha.addEventListener('blur', () => {
        // alert(inputSenha.value)
        if (inputSenha.value.length < 8) {
            alert('A senha deve ter mais de 8 dígitos.');
            return;
        } 
    });
    inputSenhaRepita.addEventListener('blur', () => {
        // alert(inputSenhaRepita.value)
        if(inputSenha.value !== inputSenhaRepita.value){
            alert('As senha são diferentes.')
            return
        }
    })
});

