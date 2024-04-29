  // Decodifica e exibe a imagem
  window.onload = function() {
    const encodedImage = '<%= image %>'; // Obtém a imagem codificada do servidor
    const imageContainer = document.getElementById('imageContainer');
    const img = document.createElement('img');
    img.src = 'data:image/jpeg;base64,' + encodedImage; // Decodifica a imagem e define o src
    imageContainer.appendChild(img);
};