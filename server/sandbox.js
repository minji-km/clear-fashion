/* eslint-disable no-console, no-process-exit */
const dedicated = require('./eshops/dedicatedbrand');
const montlimart = require('./eshops/montlimart.js');
const circle = require('./eshops/circle.js');
const fs = require("fs");

async function sandbox (eshop) {
  try {
    console.log(`🕵️‍♀️  browsing eshop`);

    const products_dedicated = await dedicated.scrape(eshop);
    const products_montlimart = await montlimart.scrape(eshop);
    const products_circle = await circle.scrape(eshop);
    console.log(products_dedicated);
    console.log('done dedicated');
    console.log(products_montlimart);
    console.log('done montlimart');
    console.log(products_circle);
    console.log('done circle');

    var products =  products_dedicated.concat(products_montlimart).concat(products_circle);
    var all = {}
    all.products = products
    const json = JSON.stringify(all, null, 2);
    fs.writeFile("list.json", json, 'utf8', function (err) {
      if (err) {
          console.log("ERROR!");
          return console.log(err);
      }
      console.log("done save");
    });

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
