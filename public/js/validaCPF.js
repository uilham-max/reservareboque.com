document.addEventListener('DOMContentLoaded', ()=>{
  inputCPF = document.getElementById('cpf')
  inputCPF.addEventListener('blur', async ()=>{
    const cpf = inputCPF.value.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    
    if (cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
      alert("Deve ter 11 digitos.")
      return; // O CPF deve ter 11 dígitos numéricos
    }
  
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
      alert("Dígitos repetidos.")
      return;
    }
  
    // Verifica o primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
  
    if (parseInt(cpf.charAt(9)) !== digitoVerificador1) {
      alert("Erro. Primeiro dígito verificador inválido.")
      return;
    }
  
    // Verifica o segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
  
    if (parseInt(cpf.charAt(10)) !== digitoVerificador2) {
      alert("Erro. Segundo dígito verificador inválido.")
      return;
    }

  })
})

  