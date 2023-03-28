// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const spanp50 = document.querySelector('#p50');
const spanp90 = document.querySelector('#p90');
const spanp95 = document.querySelector('#p95');
const spanLastReleased = document.querySelector('#lastreleased');
const spanNbBrands = document.querySelector('#nbBrands');

const selectBrand = document.querySelector('#brand-select');
const sortOption = document.querySelector('#sort-select');  

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */

const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @param  {String} [brand=''] - brand to filter by
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand = '') => {
  try {
    let url = `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`;
    if (brand!='all') {
      url += `&brand=${encodeURIComponent(brand)}`;
    }
    const response = await fetch(url);
    const body = await response.json();
    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};


// to make filter brand fetch by brand

const fetchProductsByBrand = async (page = 1, size = 12, brand = '') => {
  try {
    let string="";
    if(brand !="all"){
      string=`&brand=${brand}`;
    }
    const response = await fetch(`https://clear-fashion-api.vercel.app?page=${page}&size=${size}`+string);
    const body = await response.json();
    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};


/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);

  const brands = [...new Set(products.map(product => product.brand))];
  const brandSelect = document.getElementById('brand-select');
  
  let allOptionExists = false;
  for (let i = 0; i < brandSelect.options.length; i++) {
    if (brandSelect.options[i].value === 'all') {
      allOptionExists = true;
      break;
    }
  }
  
  if (!allOptionExists) {
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.text = 'all';
    brandSelect.insertBefore(allOption, brandSelect.firstChild);
  }

  brands.forEach(brand => {
    if (!brandSelect.querySelector(`option[value="${brand}"]`)) {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      brandSelect.appendChild(option);
    }
  });
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;
  spanNbProducts.innerHTML = count;
};

const computeIndicators = async() => {
  const {result:products} = await fetchProducts(1, 222);
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000; // timestamp for two weeks ago
  spanNbNewProducts.innerHTML = products.filter(product => new Date(product.released) > twoWeeksAgo).length;
  const productsSorted = products.sort((a, b) => a.price - b.price);
  if(productsSorted.length%2!=0){
    spanp50.innerHTML = productsSorted[(productsSorted.length+1)/2].price;
  }
  else{
    spanp50.innerHTML = (productsSorted[productsSorted.length/2].price + productsSorted[productsSorted.length/2+1].price)/2;
  }
  spanp90.innerHTML = productsSorted[Math.round(productsSorted.length*0.9)].price;
  spanp95.innerHTML = productsSorted[Math.round(productsSorted.length*0.95)].price;
  const productsSortedDate = products.sort((a, b) => new Date(b.released) - new Date(a.released));
  spanLastReleased.innerHTML = productsSortedDate[0].released;
};


const render = (products, pagination) => {
  if (checkbox_price.checked) {
    products = currentProducts.filter(product => product.price < 50);
  }
  if(checkbox_recently.checked){
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000; // timestamp for two weeks ago
    products = currentProducts.filter(product => new Date(product.released) > twoWeeksAgo);
  }
  switch (sortOption.value) {
    case 'price-asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'date-asc':
      products.sort((a, b) => new Date(a.released) - new Date(b.released));
      break;
    case 'date-desc':
      products.sort((a, b) => new Date(b.released) - new Date(a.released));
      break;
    default:
      break;
  }
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);

};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */

selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, parseInt(event.target.value), selectBrand.value);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

// select page to navigate

selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), selectShow.value, selectBrand.value);
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

// FEATURE 2 filter by brand

selectBrand.addEventListener('change', async(event) => {
  const products = await fetchProductsByBrand(currentPagination.currentPage, selectShow.value, event.target.value.toLowerCase());
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});


document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

const checkbox_price = document.getElementById('reasonable_price');
checkbox_price.addEventListener('change', async (event) => {
  render(currentProducts, currentPagination);
});


const checkbox_recently = document.getElementById('recently-released');
checkbox_recently.addEventListener('change', async (event) => {
  render(currentProducts, currentPagination);
});

// SORT

sortOption.addEventListener('change', async (event) => {
  render(currentProducts, currentPagination);
});

//INDICATORS 
computeIndicators();