import { userPicIfLoggedIn } from "./utils.js";

//-------------------------------------------------------------------------------------------------
const homeBtn = document.getElementById('homeBtn');
const checkOutBtn = document.getElementById('checkOutBtn');
const container = document.getElementById('container');
const emptyShoppingCart = document.getElementById('emptyShoppingCart');
const message = document.getElementById('message');

//-------------------------------------------------------------------------------------------------
function showMessage(text) {
    message.textContent = text;
}

//-------------------------------------------------------------------------------------------------
function getShoppingCartFromStorage() {
    let cart = [];

    try {
        const cartFromStorage = JSON.parse(localStorage.getItem("cartID") || "[]");
        if (Array.isArray(cartFromStorage)) {
            cart = cartFromStorage;
        }
    } catch (error) {
        cart = [];
    }

    return cart;
}

//-------------------------------------------------------------------------------------------------
function saveCartToStorage(cart, totalSumInCart) {
    localStorage.setItem("cartID", JSON.stringify(cart));
    localStorage.setItem("totalSumInCart", String(totalSumInCart));
}

//-------------------------------------------------------------------------------------------------
function createProductDiv(products, item, totalPriceProduct) {
    const eachProductDiv = document.createElement("div");

    eachProductDiv.innerHTML = `
        <h2>${products.name}</h2>
        <h3 class="noWrap">Product number: ${products.product_num}</h3>
        <p>Price: ${products.price},-</p>
        <p>
            Quantity: ${item.quantity}
            <button class="decreaseQuantity" data-id="${item.id}">-</button>
            <button class="increaseQuantity" data-id="${item.id}">+</button>
        </p>
        <p>Total price for this product: ${totalPriceProduct},-</p>
    `;

    if (products.stock === 0) {
        const date = new Date(products.expected_shipped);
        const readableDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        eachProductDiv.innerHTML += `
            <p>Products is expected shipped: ${readableDate}</p>
        `;
    }

    eachProductDiv.innerHTML += `
        <button class="deleteFromCart" data-id="${item.id}">Delete product from cart</button>
        <hr>
    `;

    return eachProductDiv;
}

//-------------------------------------------------------------------------------------------------
async function fetchProductDataForCartItem(item) {
    const url = `https://sukkergris.onrender.com/webshop/products?id=${item.id}&key=HQFLNY94`;

    const response = await fetch(url);

    if (!response.ok) {
        showMessage("Something went wrong while loading your shopping cart.");
        return;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
        showMessage("Could not find one of the products in your cart.");
        return;
    }

    return data[0];
}

//-------------------------------------------------------------------------------------------------
async function loadData() {
    container.innerHTML = "";
    showMessage("");
    emptyShoppingCart.style.display = "block";

    const cart = getShoppingCartFromStorage();

    if (!Array.isArray(cart) || cart.length === 0) {
        container.innerHTML = `<h2>Your shoppingcart is empty</h2>`;
        emptyShoppingCart.style.display = "none";
        saveCartToStorage([], 0);
        return;
    }

    let totalSumInCart = 0;

    for (let item of cart) {
        const products = await fetchProductDataForCartItem(item);

        if (products) {
            const totalPriceProduct = (item.quantity || 0) * Number(products.price || 0);
            totalSumInCart += totalPriceProduct;

            const eachProductDiv = createProductDiv(products, item, totalPriceProduct);
            container.appendChild(eachProductDiv);
        }
    }

    const totalSumDiv = document.createElement("div");
    totalSumDiv.innerHTML = `<h2>Total sum to pay: ${totalSumInCart},-</h2>`;
    container.appendChild(totalSumDiv);

    saveCartToStorage(cart, totalSumInCart);

    setupButtonsForItems();
}

//-------------------------------------------------------------------------------------------------
function setupButtonsForItems() {
    const allDeleteButtons = document.querySelectorAll(".deleteFromCart");
    for (let btn of allDeleteButtons) {
        btn.addEventListener("click", function (evt) {
            const productID = evt.target.getAttribute("data-id");
            const confirmDelete = confirm("Are you sure you want to delete this product?");
            if (confirmDelete) {
                deleteFromCart(productID);
            }
        });
    }

    const decreaseButtons = document.querySelectorAll(".decreaseQuantity");
    for (let btn of decreaseButtons) {
        btn.addEventListener("click", function (evt) {
            const productID = evt.target.getAttribute("data-id");
            decreaseQuantity(productID);
        });
    }

    const increaseButtons = document.querySelectorAll(".increaseQuantity");
    for (let btn of increaseButtons) {
        btn.addEventListener("click", function (evt) {
            const productID = evt.target.getAttribute("data-id");
            increaseQuantity(productID);
        });
    }
}

//-------------------------------------------------------------------------------------------------
homeBtn.addEventListener("click", function () {
    location.href = "homePage.html";
});

//-------------------------------------------------------------------------------------------------
checkOutBtn.addEventListener("click", function () {
    const cart = getShoppingCartFromStorage();

    if (!Array.isArray(cart) || cart.length === 0) {
        showMessage("Your shopping cart is empty. Add products before proceeding to checkout.");
        return;
    }

    location.href = "checkout.html";
});

//-------------------------------------------------------------------------------------------------
emptyShoppingCart.addEventListener("click", function () {
    const confirmEmpty = confirm("Are you sure you want to empty your shoppingcart?");
    if (confirmEmpty) {
        localStorage.removeItem("cartID");
        localStorage.setItem("totalSumInCart", "0");
        loadData();
    }
});

//-------------------------------------------------------------------------------------------------
function deleteFromCart(productID) {
    let cart = getShoppingCartFromStorage();
    const newCart = [];

    for (let item of cart) {
        if (String(item.id) !== String(productID)) {
            newCart[newCart.length] = item;
        }
    }

    saveCartToStorage(newCart, 0);
    loadData();
}

//-------------------------------------------------------------------------------------------------
function increaseQuantity(productID) {
    let cart = getShoppingCartFromStorage();

    for (let item of cart) {
        if (String(item.id) === String(productID)) {
            item.quantity = (item.quantity || 1) + 1;
            break;
        }
    }

    saveCartToStorage(cart, 0);
    loadData();
}

//-------------------------------------------------------------------------------------------------
function decreaseQuantity(productID) {
    let cart = getShoppingCartFromStorage();

    for (let item of cart) {
        if (String(item.id) === String(productID)) {

            if ((item.quantity || 1) <= 1) {
                showMessage("Quantity cannot be lower than 1. Delete the product if you want to remove it.");
                return;
            }

            item.quantity = (item.quantity || 1) - 1;
            break;
        }
    }

    saveCartToStorage(cart, 0);
    loadData();
}

//-------------------------------------------------------------------------------------------------
loadData();
userPicIfLoggedIn();


