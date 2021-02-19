const fs = require('fs')
let rawdata = fs.readFileSync('./config.json')
let config = JSON.parse(rawdata)

const puppeteer = require('puppeteer')
const axios = require('axios')

const script = async () => {
	/*************************/
	/* BROWSER CONFIGURATION'*
  /************************/

	const browser = await puppeteer.launch({
		executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		//	slowMo: 100
		//args: ['--incognito'],
		headless: false
	})
	//const context = await browser.createIncognitoBrowserContext()
	//let page = await context.newPage()
	let page = (await browser.pages())[0]
	// page.setViewport({ width: 1920, height: 1080 })

	/*************************/
	/*   LOG IN TO WEBSITE   *
  /************************/

	await page.goto(`${config.BASE_URL}/account/login`)
	//await page.waitForSelector('#CustomerLoginForm')
	//await page.waitForNavigation({ waitUntil: 'load' })
	await page.waitForNavigation()
	await page.type('#CustomerEmail', `${config.EMAIL}`, { delay: 50 })
	await page.type('#CustomerPassword', `${config.PASSWORD}`, { delay: 50 })
	await page.keyboard.press('Enter')
	//	page.once('load', () => console.info('✅ Page is loaded'))

	/*************************/
	/* WAITING THE PRODUCT   *
  /************************/

	const response = await axios({ method: 'GET', url: `${config.BASE_URL}/products.json` })

	const product = response.data.products[0]
	const handle = response.data.products[0].handle
	const item = product.variants[0].id

	console.log(`Handle is : ${handle}`)
	console.log(item)

	/*************************/
	/* ADDING TO CAR PRODUCT   *
  /************************/

	page.goto(`${config.BASE_URL}/products/${handle}`)
	await page.waitForNavigation()
	page.goto(`${config.BASE_URL}/cart/add.js?quantity=1&id=${item}`)
	//page.goto(`${config.BASE_URL}/cart/add.js`)

	// Close browser...
	//await browser.close()
}

script()
