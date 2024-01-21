const fetch = require('node-fetch')
module.exports = {
    async getCountry () {
        const response = await fetch('https://restcountries.com/v2/all')
        const country = await response.json()
        return country
    }
}



