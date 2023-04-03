const fetch = require('node-fetch');
const cheerio = require('cheerio');
/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
    const $ = cheerio.load(data);
  
    return $('.products-list .products-list__block')
      .map((i, element) => {
        const name = $(element)
          .find('.text-reset')
          .text()
          .trim()
          .replace(/\s/g, ' ')
          .toLowerCase();
        const price = parseInt(
          $(element)
            .find('.price')
            .text()
        );

        let image = $(element)
          .find('.product-miniature__thumb')
          .children('img')
          .find('img')
          .attr('data-src')

        if (image === null){
          image = $(element)
          .find('.product-miniature__thumb')
          .find('source').eq(1)
          .attr('src')
        }

        const l = $(element)
        .find('.product-miniature__title')
        .children('a')
        .attr('href')

        const brand = "Montlimart";

        return {name, price, image, l, brand};
      })
      .get();
  };
  
  /**
   * Scrape all the products for a given url page
   * @param  {[type]}  url
   * @return {Array|null}
   */
  module.exports.scrape = async (url='https://www.montlimart.com/99-vetements') => {
    try {
      const response = await fetch(url);
  
      if (response.ok) {
        const body = await response.text();
  
        return parse(body);
      }
  
      console.error(response);
  
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };