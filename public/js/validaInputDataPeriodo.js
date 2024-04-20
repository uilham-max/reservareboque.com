document.addEventListener('DOMContentLoaded', () => {

  var inputDataInicio = document.getElementById('dataInicio')
  var inputDataFim = document.getElementById('dataFim')

  // var dataAtualT = new Date().toISOString().split('T')[0]; // Problema com fuso horario

  var data = new Date()

  var ano = data.getFullYear()
  var mes = data.getMonth() + 1
  var dia = data.getDate()

  mes = mes < 10 ? '0' + mes : mes
  dia = dia < 10 ? '0' + dia : dia

  var dataAtual = (`${ano}-${mes}-${dia}`)

  inputDataInicio.value = dataAtual
  inputDataFim.value = inputDataInicio.value
  inputDataInicio.setAttribute('min', dataAtual); 
  inputDataFim.setAttribute('min', inputDataInicio.value);

  // tratamento do campo data inicio
  inputDataInicio.addEventListener('change',()=>{

    // Não deixa o usuario informar uma data menor que a atual 
    if(inputDataInicio.value < dataAtual){
      inputDataInicio.value = dataAtual
    }

    // Quando baixar a data de inicio a de fim nao baixa
    if((inputDataInicio.value > inputDataFim.value)){
      inputDataFim.value = inputDataInicio.value
    }

    // Não funciona no date picker do iphone
    inputDataFim.setAttribute('min', inputDataInicio.value);
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


  
  
