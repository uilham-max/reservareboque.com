
function isAdulto(dataNascimento) {
    return new Date(dataNascimento).getTime() < new Date(new Date().getTime() - 568036800000);
}

module.exports = {isAdulto}