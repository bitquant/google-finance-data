'use strict';

const puppeteer = require('puppeteer');
const NestedError = require('nested-error-stacks');

function getTextContent(element) {
    return element.getProperty('textContent').then(property => property.jsonValue());;
}

function parseNumber(value) {
    const number =  (value === "-") ? null : 1 * value;
    return number;
}

const getSymbol = async (symbol) => {

    const symbolPrefix = ["", "NYSE:", "NASDAQ:"];

    const browser = await puppeteer.launch({args: ["--no-sandbox"]});
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3205.0 Safari/537.36");

    //page.on('console', msg => console.log('PAGE_LOG:', msg.text));
    symbol = symbol.toUpperCase();
    let fetchError = null;

    for (let prefix of symbolPrefix) {

        try {
            const rsp = await page.goto('https://www.google.com/search?q=' + prefix + symbol);

            if (rsp.status() !== 200) {
                continue;
            }

            const sectionSelector = 'div#knowledge-finance-wholepage__entity-summary g-card-section g-card-section span';
            await page.waitForSelector(sectionSelector, { timeout: 7000 });
            const sectionElements = await page.$$(sectionSelector);
            const tableRowElements = await page.$$('div#knowledge-finance-wholepage__entity-summary g-card-section table tbody tr');

            const stockData = { symbol };

            if (sectionElements.length >= 3) {
                stockData.companyName = await getTextContent(sectionElements[0]);
                stockData.ticker = (await getTextContent(sectionElements[1])).replace(" ", ""); // remove space
                stockData.last = parseNumber((await getTextContent(sectionElements[2])).split(" ")[0]); // remove USD
            }

            for (let row of tableRowElements) {

                const rowData = await row.$$("td");
                const field = await getTextContent(rowData[0]);
                const value = await getTextContent(rowData[1]);

                if (field === 'Open') {
                    stockData.open = parseNumber(value);
                }
                else if (field === 'High') {
                    stockData.high = parseNumber(value);;
                }
                else if (field === 'Low') {
                    stockData.low = parseNumber(value);;
                }
                else if (field === 'Mkt cap') {
                    stockData.marketCap = value;
                }
                else if (field === 'P/E ratio') {
                    stockData.peRatio = parseNumber(value);
                }
                else if (field === 'Div yield') {
                    stockData.yield = parseNumber(value.replace("%", ""));
                }
                else if (field === 'Prev close') {
                    stockData.prevClose = parseNumber(value);
                }
                else if (field === '52-wk high') {
                    stockData.high52week = parseNumber(value);
                }
                else if (field === '52-wk low') {
                    stockData.low52week = parseNumber(value);
                }
            }

            if (Object.keys(stockData).length !== 13) {
                continue;
            }

            browser.close();
            return stockData;
        }
        catch (err) {
            fetchError = err;
        }
    }

    browser.close();
    throw new NestedError(`unable to fetch data for ${symbol}`, fetchError);
};

exports.getSymbol = getSymbol;
