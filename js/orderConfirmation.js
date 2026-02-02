import { userPicIfLoggedIn } from "./utils.js";

//-------------------------------------------------------------------------------------------------
const homeBtn = document.getElementById('homeBtn');
const container = document.getElementById('container');
const message = document.getElementById('message');

//-------------------------------------------------------------------------------------------------
function showMessage(text) {
  message.textContent = text;
}

//-------------------------------------------------------------------------------------------------
function displayOrderInfo(record) {
  container.innerHTML = `
        <p><strong>Ordernumber:</strong> ${record.ordernumber}</p>
        <p><strong>Customer's name:</strong> ${record.customer_name}</p>
        <p><strong>Customer's email:</strong> ${record.email}</p>
        <p><strong>Customer's phonenumber:</strong> ${record.phone}</p>
        <p><strong>Customer's address:</strong> ${record.street}</p>
        <h3><strong>Ordered products:</strong></h3>
    `;
}

//-------------------------------------------------------------------------------------------------
function getProductsListFromOrder(record) {
  let productsList = [];

  try {
    productsList = JSON.parse(record.content || "[]");
  } catch (error) {
    showMessage("Could not read product information from this order.");
    productsList = [];
  }

  return productsList;
}

//-------------------------------------------------------------------------------------------------
async function fetchProductData(productId) {
  const url = `https://sukkergris.onrender.com/webshop/products?id=${productId}&key=HQFLNY94`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      showMessage("Something went wrong while loading products.");
      return;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const product = data[0];
      return product;
    }else {
      showMessage("Product data was missing for one of the items in your order.");
    }

  } catch (error) {
    showMessage("Something went wrong while loading products.");
  }
}

//-------------------------------------------------------------------------------------------------
function createProductListItem(product, quantity) {
  let name = "Unknown product name";
  if (product.name) {
    name = product.name;
  }

  const productNumber = product.product_num;
  const price = Number(product.price) || 0;
  const sumProducts = price * quantity;

  const li = document.createElement("li");
  li.textContent =
    `Product name: ${name} || Product number: ${productNumber} || Price: ${price},- ` +
    `|| Quantity: ${quantity} || Total: ${sumProducts},-`;

  return {
    listItem: li,
    sumProducts: sumProducts
  };
}

//-------------------------------------------------------------------------------------------------
async function buildProductList(productsList) {
  const list = document.createElement("ul");
  let totalPrice = 0;

  for (let item of productsList) {
    const quantity = item.quantity || 1;

    const product = await fetchProductData(item.id);

    if (product) {
      const result = createProductListItem(product, quantity);
      totalPrice += result.sumProducts;
      list.appendChild(result.listItem);
    }
  }

  container.appendChild(list);
  return totalPrice;
}

//-------------------------------------------------------------------------------------------------
function showShippingAndTotal(record, totalPrice) {

  const shippingId = Number(record.shipping_id);
  let shippingText = "";
  let shippingPrice = 0;
  let shippingDays = 0;

  if (shippingId === 1) {
    shippingText = "Pickup in store (0,-)";
    shippingPrice = 0;
    shippingDays = 0;
  } else if (shippingId === 2) {
    shippingText = "Pickup-box (30,-)";
    shippingPrice = 30;
    shippingDays = 3;
  } else if (shippingId === 3) {
    shippingText = "Mail (45,-)";
    shippingPrice = 45;
    shippingDays = 5;
  } else if (shippingId === 4) {
    shippingText = "Express mail (100,-)";
    shippingPrice = 100;
    shippingDays = 1;
  } else {
    shippingText = "Unknown shipping method";
  }

  const today = new Date();
  today.setDate(today.getDate() + shippingDays);
  const expectedDelivery = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const totalPriceWithShipping = totalPrice + shippingPrice;

  const totalSumText = document.createElement("p");
  totalSumText.innerHTML = `
        <strong>Shipping method:</strong> ${shippingText}<br>
        <strong>Expected delivery:</strong> ${expectedDelivery}<br><hr>
        <h1><strong>Total sum:</strong> ${totalPriceWithShipping},-</h1>
    `;

  container.appendChild(totalSumText);
}

//-------------------------------------------------------------------------------------------------
async function showProductDetails(productsList, record) {

  if (!Array.isArray(productsList) || productsList.length === 0) {
    showMessage("No products found in this order.");
    return;
  }

  try {
    const totalPrice = await buildProductList(productsList);
    showShippingAndTotal(record, totalPrice);
  } catch (error) {
    showMessage("Something went wrong while loading product details.");
  }
}

//-------------------------------------------------------------------------------------------------
const orderConfirmationData = JSON.parse(sessionStorage.getItem("orderConfirmation") || "{}");

//-------------------------------------------------------------------------------------------------
if (orderConfirmationData.record) {

  const record = orderConfirmationData.record;

  displayOrderInfo(record);

  const productsList = getProductsListFromOrder(record);

  showProductDetails(productsList, record);

} else {
  showMessage("No order data found.");
}

//-------------------------------------------------------------------------------------------------
homeBtn.addEventListener('click', function () {
  location.href = "homePage.html";
});

//-------------------------------------------------------------------------------------------------
userPicIfLoggedIn();
