document.addEventListener('DOMContentLoaded', () => {

  var inputDataInicio = document.getElementById('dataInicio')
  var inputDataFim = document.getElementById('dataFim')
  var inputHoraInicio = document.getElementById('horaInicio')
  var inputHoraFim = document.getElementById('horaFim')

  invalidHoraInicio = document.getElementById('invalidHoraInicio');


  var data = new Date()

//   console.log(data);

  function obterUltimoDiaMesAtual() {
      let dataAtual = new Date();
      let ano = dataAtual.getFullYear();
      let mes = dataAtual.getMonth();

      let ultimoDiaMesAtual = new Date(ano, mes + 1, 0);
      return ultimoDiaMesAtual.getDate();
  }

  let ultimoDia = obterUltimoDiaMesAtual();

  var ano = data.getFullYear()
  var mes = data.getMonth() + 1
  var dia = data.getDate()
  var hora = data.getHours()

  mes = mes < 10 ? '0' + mes : mes
  dia = dia < 10 ? '0' + dia : dia

  var dataAtual = (`${ano}-${mes}-${dia}`)

  function adicionaUmDia(p1){
      inicio = new Date(p1)
      inicio.setDate(inicio.getDate()+1)
      return inicio.toISOString().slice(0, 10)
  }

  inputDataInicio.value = dataAtual
  inputDataFim.value = adicionaUmDia(inputDataInicio.value)
  inputDataInicio.setAttribute('min', dataAtual); 
  inputDataFim.setAttribute('min', adicionaUmDia(inputDataInicio.value)); // TESTENDO AQUI
  inputHoraInicio.value = hora
  inputHoraFim.value = inputHoraInicio.value

  // Hora de entrega recebe a hora de inicio
  inputHoraInicio.addEventListener('change', () => {
      inputHoraFim.value = inputHoraInicio.value
  })


  // DATA INICIO CHANGE
  inputDataInicio.addEventListener('change',()=>{

    if(inputDataInicio.value != dataAtual){
        inputHoraInicio.value = 8
        inputHoraInicio.classList.remove('is-invalid')
        inputHoraInicio.setCustomValidity('')
        invalidHoraInicio.textContent = '';
    }

    // Não deixa o usuario informar uma data menor que a atual 
    if(inputDataInicio.value < dataAtual){
        inputDataInicio.value = dataAtual
    }

    // Quando baixar a data de inicio a de fim nao baixa
    if((inputDataInicio.value > inputDataFim.value)){
        inputDataFim.value = adicionaUmDia(inputDataInicio.value)
    }

    // DATA FIM SEMPRE SERÁ O DIA SEGUINTE
    inputDataFim.setAttribute('min', adicionaUmDia(inputDataInicio.value));
  })


  // tratamento campo data fim
  inputDataFim.addEventListener('change',()=>{

      // não deixa informar uma data menor que a data atual
      if(inputDataFim.value < dataAtual){
          inputDataFim.value = dataAtual
      }

      // Se o fim for memor que o inicio e maior que a data atual, então baixa a data de inicio
      if(inputDataFim.value < inputDataInicio.value && inputDataFim.value >= dataAtual){
          inputDataInicio.value = inputDataFim.value
      }
  })

  inputHoraInicio.addEventListener('change', () => {
        // Verifica se tem onze dígitos
        if (inputDataInicio.value == dataAtual && inputHoraInicio.value < hora ) {
            inputHoraInicio.classList.add('is-invalid')
            inputHoraInicio.setCustomValidity('mensagem')
            invalidHoraInicio.textContent = `A partir das ${hora}:00hs`;
            return;
        } else {
            inputHoraInicio.classList.remove('is-invalid')
            inputHoraInicio.setCustomValidity('')
            invalidHoraInicio.textContent = '';
        }

    })


  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
          if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
          }

          form.classList.add('was-validated')
      }, false)
  })


  // inputDataFim.addEventListener('blur',()=>{
  //   if(inputDataFim.value < inputDataInicio.value){
  //     inputBotao.disabled = true
  //     inputDataFim.classList.add('is-invalid')
  //     inputDataInicio.classList.add('is-invalid')
  //   } else {
  //     inputBotao.disabled = false
  //     inputDataFim.classList.remove('is-invalid')
  //     inputDataInicio.classList.remove('is-invalid')
  //   }
  // })

})