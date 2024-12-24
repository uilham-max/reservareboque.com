

    getAccessToken = () => {
        return process.env.ACCESS_TOKEN
    }

    getUrlBase = () => {
        return process.env.URL_BASE
    }


module.exports = {
    getAccessToken,
    getUrlBase
}