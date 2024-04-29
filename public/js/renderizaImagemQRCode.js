document.addEventListener('DOMContentLoaded', ()=>{

    const inputEncodedImage = document.getElementById('codigoHexaImagem'); // Obtém a imagem codificada do servidor
    const imgElement = document.getElementById('qrCodeImage');
    imgElement.src = 'data:image/jpeg;base64,' + inputEncodedImage.value; // Decodifica a imagem e define o src

    // const encodedImage = document.getElementById('codigoHexaImagem'); // Obtém a imagem codificada do servidor
    // console.log("log:",encodedImage.value)
    // const imageContainer = document.getElementById('imageContainer');
    // const img = document.createElement('img');
    // img.src = 'data:image/jpeg;base64,' + encodedImage.value; // Decodifica a imagem e define o src
    // imageContainer.appendChild(img);
    
})