const fs = require('fs')
let rawdata = fs.readFileSync('./config.json')
let config = JSON.parse(rawdata)

const puppeteer = require('puppeteer')
const axios = require('axios')
const timestamp = require('time-stamp')

const script = async () => {
	/*************************/
	/* BROWSER CONFIGURATION'*
  /************************/

	const browser = await puppeteer.launch({
		//executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		//executablePath: '/Applications/Opera.app/Contents/MacOS/Opera',
		//	slowMo: 100
		//headless: false,
		args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
	})
	//const context = await browser.createIncognitoBrowserContext()
	//let page = await context.newPage()
	let page = (await browser.pages())[0]
	//page.setViewport({ width: 1920, height: 1080 })

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

	const response = await axios({ method: 'GET', url: `${config.BASE_URL}/products.json` })

	const product = response.data.products[0]
	const handle = response.data.products[0].handle
	const item = response.data.products[0].variants[0].id
	const available = response.data.products[0].variants[0].available

	/**************************/
	/* ADDING TO CART PRODUCT */
	/*************************/

	await page.goto(`${config.BASE_URL}/cart/${item}:1`)

	//page.once('load', () => console.info(`${timestamp.utc('YYYY/MM/DD:mm:ss:ms')} : ✅ Product Added to Cart`))

	await page.click('#checkout_id_delivery-pickup')

	const elements = page.url().split('/')

	await page.waitForResponse(`https://${elements[2]}/api/checkouts/${elements[5]}/delivery_options.json`)

	await Promise.all([page.click('#continue_button'), page.waitForNavigation({ waitUntil: 'load' })])
	//await page.click('#continue_button')

	/**************************/
	/* CONFIGURING PAYMENTS */
	/*************************/

	// Credit Card

	//page.waitForNavigation({ waitUntil: 'networkidle2' })

	await page.waitForResponse(`https://monorail-edge.shopifysvc.com/v1/produce`)

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

	// await page.type('#checkout_billing_address_phone', `${config.CHECKOUT_SHIPPING_ADDRESS_PHONE}`, {
	// 	delay: 0
	// })

	//await page.waitForSelector('iframe')

	//const frames = page.frames().find((frame) => frame.name() == /\bcard-fields-number\b/)
	//const iframe = page.frames().find((frame) => frame.name() != undefined)

	const iframe = page.mainFrame()

	console.log(iframe)
	//console.log(typeof iframe)

	//const iframeDoc = iframe.contentDocument
	//console.log(iframeDoc)

	//let iframe = frames.find((f) => f.name() === 'any_iframe')

	//const frameHandle = await page.$("iframe[id='frame1']")

	//console.log(frameHandle)

	//await browser.close()
}

script()
