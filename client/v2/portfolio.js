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
const selectBrand = document.querySelector('#brand-select');

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

// to make filter price under 50

const fetchProductsByPrice = async () => {
  try {
    const response = await fetch('https://clear-fashion-api.vercel.app/products');
    const body = await response.json();
    if (body.success !== true) {
      console.error(body);
      return [];
    }

    const filteredProducts = body.data.filter(product => product.price <= 50);
    if (filteredProducts.length === 0) {
      console.warn('No products found within the specified price range.');
      return [];
    }

    return filteredProducts;
  } catch (error) {
    console.error(error);
    return [];
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
  brands.forEach(brand => {
    if (!brandSelect.querySelector(`option[value="${brand}"]`)) {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      brandSelect.appendChild(option);
    }
  });
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
    allOption.text = 'All';
    brandSelect.insertBefore(allOption, brandSelect.firstChild);
  }
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

const render = (products, pagination) => {
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


const filterprice = document.querySelector('#filter-price');
filterprice.addEventListener('click', async () => {
  try {
    const products = await fetchProductsByPrice(currentPagination.currentPage, selectShow.value, selectBrand.value);
    renderProducts(products);
  } catch (error) {
    console.error(error);
  }
  setCurrentProducts(products);
  render(currentProducts);
});
