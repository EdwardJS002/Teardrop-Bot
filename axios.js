const fs = require('fs')
let rawdata = fs.readFileSync('./config.json')
let config = JSON.parse(rawdata)

const axios = require('axios')

const noke = require('./config')

console.log(noke.CREDIT_CARD_NUMBER)

const fire = async () => {
	let response = await axios({
		method: 'post',
		url: `${config.BASE_URL}/account/login`,
		data: { 'customer[email]': 'mkatiuska@hotmail.com', 'customer[password]': 'teardrop!1' }
	})
	console.log(response)

	// resfile = JSON.stringify(response)

	// fs.writeFileSync('./response.json', resfile)
}

try {
	fire()
} catch (error) {
	throw error
}
