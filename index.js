const fs = require('fs')
let rawdata = fs.readFileSync('./config.json')
let config = JSON.parse(rawdata)

const puppeteer = require('puppeteer')
const axios = require('axios')
const timestamp = require('time-stamp')
const { exit } = require('process')

const script = async () => {
	/*************************/
	/* BROWSER CONFIGURATION'*
  /************************/

	const browser = await puppeteer.launch({
		//executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		//executablePath: '/Applications/Opera.app/Contents/MacOS/Opera',
		//	slowMo: 50,
		//headless: false,
		args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
	})
	//const context = await browser.createIncognitoBrowserContext()
	//let page = await context.newPage()
	let page = (await browser.pages())[0]
	page.setViewport({ width: 1920, height: 1080 })

	/*************************/
	/*   LOG IN TO WEBSITE   *
  /************************/

	await page.goto(`${config.BASE_URL}/account/login`, {
		waitUntil: 'networkidle2'
	})
	await page.type('#CustomerEmail', `${config.EMAIL}`, { delay: 0 })
	await page.type('#CustomerPassword', `${config.PASSWORD}`, { delay: 0 })

	await Promise.all([page.click('input.btn'), page.waitForNavigation({ waitUntil: 'load' })])

	page.once('load', () => console.info(`${timestamp.utc('YYYY/MM/DD:mm:ss:ms')} : ✅ Connected to Website`))

	/*************************/
	/* WAITING THE PRODUCT   *
  /************************/
	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms)
		})
	}

	let response = await axios({ method: 'GET', url: `${config.BASE_URL}/products.json` })

	let count = 0

	let product = response.data.products[0].id
	let handle = response.data.products[0].handle
	let item = response.data.products[0].variants[0].id
	let available = response.data.products[0].variants[0].available

	while (available === false) {
		response = await axios({ method: 'GET', url: `${config.BASE_URL}/products.json` })
		available = response.data.products[0].variants[0].available
		count++
		console.log(`🔍 Searching - nombre d'essais: ${count}`)

		if (response.data.products[0].id !== product) {
			console.info(`${timestamp.utc('YYYY/MM/DD:mm:ss:ms')} : 😭 Produit plus la, fin de la mission !!`)
			exit()
		}
		await sleep(600)
	}

	console.info(`${timestamp.utc('YYYY/MM/DD:mm:ss:ms')} : 🎯 Objet Disponible !!`)

	/**************************/
	/* ADDING TO CART PRODUCT */
	/*************************/

	await page.goto(`${config.BASE_URL}/cart/${item}:1`)

	//page.once('load', () => console.info(`${timestamp.utc('YYYY/MM/DD:mm:ss:ms')} : ✅ Product Added to Cart`))

	//await Promise.all([page.click('#checkout_id_delivery-pickup'), page.waitForNavigation({ waitUntil: 'load' })])

	await page.click('#checkout_id_delivery-pickup')

	const elements = page.url().split('/')

	await page.waitForResponse(`https://${elements[2]}/api/checkouts/${elements[5]}/delivery_options.json`)

	await Promise.all([page.click('#continue_button'), page.waitForNavigation({ waitUntil: 'load' })])
	//await page.click('#continue_button')

	/**************************/
	/* CONFIGURING PAYMENTS */
	/*************************/

	// Credit Card

	await page.waitForResponse(`https://monorail-edge.shopifysvc.com/v1/produce`)
	await page.waitForSelector('iframe')

	const elementHandle = await page.$$('.card-fields-iframe')
	const frameNumber = await elementHandle[0].contentFrame()
	const frameName = await elementHandle[1].contentFrame()
	const frameExpiry = await elementHandle[2].contentFrame()
	const frameCCV = await elementHandle[3].contentFrame()

	await frameNumber.type('#number', `${config.CREDIT_CARD_NUMBER}`, {
		delay: 10
	})

	await frameName.type(
		'#name',
		`${config.CHECKOUT_SHIPPING_ADDRESS_LASTNAME} ${config.CHECKOUT_SHIPPING_ADDRESS_FIRSTNAME}`,
		{
			delay: 0
		}
	)

	await frameExpiry.type('#expiry', `${config.CREDIT_CARD_MONTH}`, {
		delay: 0
	})

	await frameExpiry.type('#expiry', `${config.CREDIT_CARD_YEAR}`, {
		delay: 0
	})

	await frameCCV.type('#verification_value', `${config.CREDIT_CARD_CCV}`, {
		delay: 0
	})

	// BILLING INFO

	await page.evaluate(() => (document.getElementById('checkout_billing_address_first_name').value = ''))
	await page.evaluate(() => (document.getElementById('checkout_billing_address_last_name').value = ''))
	await page.evaluate(() => (document.getElementById('checkout_billing_address_address1').value = ''))
	await page.evaluate(() => (document.getElementById('checkout_billing_address_zip').value = ''))
	await page.evaluate(() => (document.getElementById('checkout_billing_address_city').value = ''))

	await page.type('#checkout_billing_address_first_name', `${config.CHECKOUT_SHIPPING_ADDRESS_FIRSTNAME}`, {
		delay: 0
	})

	await page.type('#checkout_billing_address_last_name', `${config.CHECKOUT_SHIPPING_ADDRESS_LASTNAME}`, {
		delay: 0
	})

	await page.type('#checkout_billing_address_address1', `${config.CHECKOUT_SHIPPING_ADDRESS_ADDRESS1}`, {
		delay: 0
	})

	await page.type('#checkout_billing_address_zip', `${config.CHECKOUT_SHIPPING_ADDRESS_ZIP}`, {
		delay: 0
	})

	await page.type('#checkout_billing_address_city', `${config.CHECKOUT_SHIPPING_ADDRESS_CITY}`, {
		delay: 0
	})

	//await page.waitForFunction('document.getElementById("checkout_credit_card_vault").value != false')

	await page.click('#continue_button')

	await Promise.all([page.click('#continue_button'), page.waitForNavigation({ waitUntil: 'load' })])

	await page
		.click('#continue_button', { waitUntil: 'networkidle2' })
		.then(console.info(`${timestamp.utc('YYYY/MM/DD:mm:ss:ms')} : 🎉 Finished`))

	await browser.close()
}

script()
