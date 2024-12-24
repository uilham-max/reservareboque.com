
export class Env {

    static getAccessToken(){
        return process.env.ACCESS_TOKEN
    }

    static getUrlBase(){
        return process.env.URL_BASE
    }

}

// module.exports = Env