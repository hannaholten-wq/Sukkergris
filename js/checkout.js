import { userPicIfLoggedIn } from "./utils.js";

//---------------------------------------------------------------------------------------------------
const homeBtn = document.getElementById('homeBtn');
const completeTheOrderButton = document.getElementById('completeTheOrderButton');
const shipping_id = document.getElementById('shipping_id');
const totalPrice = document.getElementById('totalPrice');
const zipcode = document.getElementById('zipcode');
const phone = document.getElementById('phone');
const message = document.getElementById('message');

const totalSumFromCart = Number(localStorage.getItem("totalSumInCart")) || 0;

//---------------------------------------------------------------------------------------------------
function showMessage(text) {
    message.textContent = text;
}

//----------------------------------------------------------------------------------------------------
function fillCustomerInfoFromUser() {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    if (!userData) return;

    if (userData.fullname) document.getElementById("customer_name").value = userData.fullname;
    if (userData.street) document.getElementById("street").value = userData.street;
    if (userData.city) document.getElementById("city").value = userData.city;
    if (userData.zipcode) document.getElementById("zipcode").value = userData.zipcode;
    if (userData.country) document.getElementById("country").value = userData.country;
    if (userData.username) document.getElementById("email").value = userData.username;
    if (userData.phone) document.getElementById("phone").value = userData.phone;
}

fillCustomerInfoFromUser();

//-----------------------------------------------------------------------------------------------------
zipcode.addEventListener('keypress', function (evt) {
    if (!/[0-9]/.test(evt.key)) {
        evt.preventDefault();
    }
});

//----------------------------------------------------------------------------------------------------
phone.addEventListener('keypress', function (evt) {
    if (!/[0-9+ ]/.test(evt.key)) {
        evt.preventDefault();
    }
});

//-------------------------------------------------------------------------------------------------------
function updateTotalPrice() {
    const selectedShipping = shipping_id.options[shipping_id.selectedIndex];
    const shippingPrice = Number(selectedShipping.getAttribute("data-price")) || 0;
    const totalWithShipping = totalSumFromCart + shippingPrice;

    totalPrice.textContent = `Total: ${totalWithShipping} ,-`;
}

updateTotalPrice();
shipping_id.addEventListener("change", updateTotalPrice);

//---------------------------------------------------------------------------------------------------------
function checkRequiredInputFields() {

    if (!document.getElementById("customer_name").value.trim()) {
        showMessage("Please fill out your full name.");
        return false;
    }

    if (!document.getElementById("street").value.trim()) {
        showMessage("Please fill out your street name.");
        return false;
    }

    if (!document.getElementById("city").value.trim()) {
        showMessage("Please fill out your city.");
        return false;
    }

    if (!document.getElementById("zipcode").value.trim()) {
        showMessage("Please fill out your zipcode.");
        return false;
    }

    if (!document.getElementById("country").value.trim()) {
        showMessage("Please fill out your country.");
        return false;
    }

    const email = document.getElementById("email").value.trim();
    if (!email) {
        showMessage("Please fill out your email.");
        return false;
    }

    if (!email.includes("@")) {
        showMessage("Your email must contain @");
        return false;
    }

    return true;
}

//------------------------------------------------------------------------------------------------------------
function getShoppingCart() {
    const cart = JSON.parse(localStorage.getItem("cartID") || "[]");

    if (!Array.isArray(cart) || cart.length === 0) {
        showMessage("Your shopping cart is empty.");
        return;
    }

    return cart;
}

//-------------------------------------------------------------------------------------------------------------
function createOrderBodyForServer(cart) {
    return {
        customer_name: document.getElementById('customer_name').value,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        zipcode: document.getElementById('zipcode').value,
        country: document.getElementById('country').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        shipping_id: Number(document.getElementById('shipping_id').value) || 3,
        content: JSON.stringify(cart)
    };
}

//------------------------------------------------------------------------------------------------------------- 
function createHeaderForServer() {
    const headers = { "content-type": "application/json" };

    const userToken = localStorage.getItem("userToken");
    if (userToken) {
        headers.authorization = userToken;
    }

    return headers;
}

//--------------------------------------------------------------------------------------------------------------
async function sendOrderToServer(body, headers) {
    const url = "https://sukkergris.onrender.com/webshop/orders?key=HQFLNY94";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            showMessage("Something went wrong while sending your order.");
            return;
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.log(error);
        showMessage("Something went wrong while sending your order.");
        return;
    }
}

//-------------------------------------------------------------------------------------------------------------- 
function handleSuccessfulOrder(data) {
    sessionStorage.setItem("orderConfirmation", JSON.stringify(data));
    localStorage.removeItem("cartID");
    localStorage.setItem("totalSumInCart", "0");
    location.href = "orderConfirmation.html";
}

//----------------------------------------------------------------------------------------------------------------

completeTheOrderButton.addEventListener('click', async function (evt) {
    evt.preventDefault();

    if (!checkRequiredInputFields()) return;

    const cart = getShoppingCart();
    if (!cart) return;

    const body = createOrderBodyForServer(cart);
    const headers = createHeaderForServer();

    const data = await sendOrderToServer(body, headers);
    if (!data) return;

    handleSuccessfulOrder(data);
});
//------------------------------------------------------------------------------------------------------------
homeBtn.addEventListener('click', function () {
    console.log("hjem");
    location.href = "homePage.html";
});
//-----------------------------------------------------------------------------------------------------------------------
userPicIfLoggedIn();
