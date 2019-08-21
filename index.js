const moment = require('moment');
const puppeteer = require('puppeteer');
const fs = require('fs');
const configData = require('./config.json');
const url = configData.url;
const outputFilePath = configData.outputFilePath;
const path = require('path');

let accessCount = 0;

let page;

async function setup() {
    const browser = await puppeteer.launch();
    page = await browser.newPage();
}

async function accessUrl() {
    accessCount++;
    const response = await page.goto(url);
    console.log(`access for ${accessCount} time(s)`);
    try {
        const status = response.status();
        console.log(status);
        if (status === 200 || status === 201) {
            const content = await page.content();
            console.log(content);
            fs.writeFileSync(`output/${outputFilePath}`, content);
            console.log('SUCCESS');
            console.log(moment().format('DD-MM-YYYY, h:mm:ss a'));
        } else {
            console.log(`retry...`);
            await retry();
        }
    } catch (e) {
        console.log(`retry...`);
        await retry();
    }

}

async function retry() {
    await accessUrl();
}

async function init() {
    await setup();
    await accessUrl();
    const browser = await puppeteer.launch({
        headless: false
    });
    page = await browser.newPage();
    await page.goto(path.resolve(__dirname, `output/${outputFilePath}`));
}

init();
