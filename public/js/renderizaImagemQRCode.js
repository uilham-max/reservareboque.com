document.addEventListener('DOMContentLoaded', ()=>{

    const inputPIXCopiaECola = document.getElementById('PIXCopiaECola');
    const inputCopyPIXButton = document.getElementById('copyPIXButton');

    inputCopyPIXButton.addEventListener('click', () => {
        navigator.clipboard.writeText(inputPIXCopiaECola.value).then(()=>{
            alert('Código PIX copiado para área de transferência.');
        })
    });

    const inputEncodedImage = document.getElementById('codigoHexaImagem'); // Obtém a imagem codificada do servidor
    const imgElement = document.getElementById('qrCodeImage');
    imgElement.src = 'data:image/jpeg;base64,' + inputEncodedImage.value; // Decodifica a imagem e define o src


    
    // IMPLENTAÇÃO DO JOSÉ
    // const encodedImage = document.getElementById('codigoHexaImagem'); // Obtém a imagem codificada do servidor
    // console.log("log:",encodedImage.value)
    // const imageContainer = document.getElementById('imageContainer');
    // const img = document.createElement('img');
    // img.src = 'data:image/jpeg;base64,' + encodedImage.value; // Decodifica a imagem e define o src
    // imageContainer.appendChild(img);
    
})