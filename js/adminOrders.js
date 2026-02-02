
import { adminPicIfLoggedIn, userPicIfLoggedIn } from "./utils.js";

//------------------------------------------------------------
const orderURL = "https://sukkergris.onrender.com/webshop/orders?key=HQFLNY94";
const productsURL = "https://sukkergris.onrender.com/webshop/products?key=HQFLNY94";

const orderListContainer = document.getElementById("orderListContainer");
const message = document.getElementById("message");
const backBtn = document.getElementById("backBtn");

//------------------------------------------------------------
function showMessage(text) {
  message.textContent = text;
}

//------------------------------------------------------------
const shippingPrices = {
  1: 0,
  2: 30,
  3: 45,
  4: 100
};

//------------------------------------------------------------
function getActiveToken() {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  if (adminToken) return adminToken;
  if (userToken) return userToken;
  return null;
}

//------------------------------------------------------------
async function fetchOrders(token) {
  const response = await fetch(orderURL, {
    headers: { authorization: token }
  });

  if (!response.ok) {
      showMessage("Could not load orders."); 
    return null;  
  }

  return response.json();
}

//------------------------------------------------------------
async function fetchPriceMap() {
  const response = await fetch(productsURL);
  const priceMap = {};

  if (!response.ok) {
    showMessage("Could not load product prices.");
    return priceMap; 
  }

  const products = await response.json();

  for (const product of products) {
    priceMap[product.id] = Number(product.price) || 0;
  }

  return priceMap;
}

//------------------------------------------------------------
function getProductsSum(orderContent, priceMap) {
  let productsInOrder = [];

  try {
    productsInOrder = JSON.parse(orderContent || "[]");
  } catch {
    productsInOrder = [];
  }

  let sumProducts = 0;

  for (const item of productsInOrder) {
    const price = priceMap[item.id] || 0;
    const quantity = Number(item.quantity) || 0;
    sumProducts += price * quantity;
  }

  return sumProducts;
}

//------------------------------------------------------------
function createOrderElement(order, priceMap, isAdmin) {
  const sumProducts = getProductsSum(order.content, priceMap);
  const shippingPrice = shippingPrices[order.shipping_id] || 0;
  const totalSum = sumProducts + shippingPrice;

  const div = document.createElement("div");

  let deleteButtonHtml = "";
  if (isAdmin) {
    deleteButtonHtml = `<button class="deleteBtn">Delete order</button>`;
  }

  div.innerHTML = `
    <h3>Order #${order.id}</h3>
    <p><strong>Customer:</strong> ${order.customer_name}</p>
    <p><strong>Email:</strong> ${order.email}</p>
    <p><strong>Phone:</strong> ${order.phone}</p>
    <p><strong>Street:</strong> ${order.street}</p>
    <p><strong>Total sum:</strong> ${totalSum} ,-</p>
    ${deleteButtonHtml}
    <hr>
  `;

  if (isAdmin) {
    const deleteButton = div.querySelector(".deleteBtn");
    if (deleteButton) {
      deleteButton.addEventListener("click", function () {
        if (!confirm("Are you sure you want to delete this order?")) return;
        deleteOrder(order.id);
      });
    }
  }

  return div;
}

//------------------------------------------------------------
function showOrderList(list, priceMap, isAdmin) {
  orderListContainer.innerHTML = "";

  if (!list || list.length === 0) {
    orderListContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  for (const order of list) {
    const orderElement = createOrderElement(order, priceMap, isAdmin);
    orderListContainer.appendChild(orderElement);
  }
}

//------------------------------------------------------------
async function loadData() {
  orderListContainer.innerHTML = "Loading...";

  const token = getActiveToken();
  const isAdmin = !!localStorage.getItem("adminToken");

  if (!token) {
    showMessage("Not logged in."); 
    return;
  }

  const orders = await fetchOrders(token);
  const priceMap = await fetchPriceMap();

  if (!orders) {
    orderListContainer.innerHTML = "<p>Could not load orders.</p>";
    return;
  }

  showOrderList(orders, priceMap, isAdmin);
}

//------------------------------------------------------------
async function deleteOrder(id) {
  const token = getActiveToken();

  if (!token) {
     showMessage("Not logged in."); 
    return;
  }

  const deleteUrl =
    `https://sukkergris.onrender.com/webshop/orders?id=${id}&key=HQFLNY94`;

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: { authorization: token }
  });

  if (!response.ok) {
     showMessage("Could not delete order."); 
    return;
  }

  showMessage("Order deleted.");
  loadData();

}

//------------------------------------------------------------
function handleBackClick() {
  location.href = "adminLogin.html";
}

//------------------------------------------------------------
function showProfilePic() {
  const adminToken = localStorage.getItem("adminToken");

  if (adminToken) {
    adminPicIfLoggedIn();
  } else {
    userPicIfLoggedIn();
  }
}

//------------------------------------------------------------
function initPage() {
  

  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  if (adminToken) {

    backBtn.hidden = false;
    btnHomePage.hidden = true;
  } else if (userToken) {

    backBtn.hidden = true;
    btnHomePage.hidden = false;

    btnHomePage.addEventListener("click", () => {
      location.href = "homePage.html";
    });
  }};
  showProfilePic();
  loadData();
  backBtn.addEventListener("click", handleBackClick);


document.addEventListener("DOMContentLoaded", initPage);