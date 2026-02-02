
import { userPicIfLoggedIn } from "./utils.js";


//---------------------------------------------------------------------------------

const kategoriDiv = document.getElementById('categories'); 
const txtSearch = document.getElementById('txtSearch'); 
const btnSearch = document.getElementById('btnSearch'); 
const goToShoppingCartBtn = document.getElementById('goToShoppingCartBtn'); 
const btnMessageBoard = document.getElementById('btnMessageBoard'); 
const btnMyOrders = document.getElementById('btnMyOrders'); 
const btnCommentAndRating = document.getElementById('btnCommentAndRating'); 

const btnCreateAccount = document.getElementById('btnCreate');
const btnLogin = document.getElementById('btnLogin'); 
const profilePic = document.getElementById('smallPic'); 


const kategoriURL = "https://sukkergris.onrender.com/webshop/categories?key=HQFLNY94";


const userToken = localStorage.getItem("userToken");

//---------------------------------------------------------------------------------
if (userToken) {
    btnCreateAccount.textContent = "User settings";
    btnCreateAccount.addEventListener('click', function () {
        location.href = "userSettings.html";
    });
} else {

    btnCreateAccount.textContent = "Create account";
    btnCreateAccount.addEventListener('click', function () {
        location.href = "createAccount.html";
    });
}

//---------------------------------------------------------------------------------
if (userToken) {

    btnLogin.textContent = "Logged in";
    btnLogin.disabled = true; 
    btnLogin.style.opacity = "0.6"; 
} else {
    btnLogin.addEventListener('click', function () {
        location.href = "logIn.html";
    });
}

//---------------------------------------------------------------------------------

if (profilePic) {
    profilePic.addEventListener('click', function () {
        if (userToken) {
            location.href = "userSettings.html";
        }

    });
}


//---------------------------------------------------------------------------------
if (!userToken) {
    btnMessageBoard.style.display = "none"; 
} else {
    btnMessageBoard.addEventListener('click', function () {
        location.href = "messageBoard.html";
    });
}

//---------------------------------------------------------------------------------
if (!userToken) {
    btnMyOrders.style.display = "none";
} else {
    btnMyOrders.addEventListener('click', function () {
        location.href = "adminOrders.html";
    });
}

//---------------------------------------------------------------------------------
if (!userToken) {
    btnCommentAndRating.style.display = "none";
} else {
    btnCommentAndRating.addEventListener('click', function () {
        location.href = "commentAndRating.html";
    });
}

//---------------------------------------------------------------------------------
async function fetchCategories() {
    const response = await fetch(kategoriURL);

    if (!response.ok) {
        throw new Error("Could not fetch categories, status: " + response.status);
    }

    return response.json();
}

//---------------------------------------------------------------------------------
function createCategoryElement(category) {
    const div = document.createElement("div");

    div.innerHTML = `
        <h3>${category.category_name}</h3>
        <p>${category.description || ""}</p>
        <hr>
    `;

    div.addEventListener("click", function () {
        localStorage.setItem("categoryID", category.id);
        localStorage.removeItem("searchItem");
        location.href = "productList.html";
    });

    return div;
}

//---------------------------------------------------------------------------------
function renderCategoryList(categories) {
    kategoriDiv.innerHTML = "";

    categories.forEach(category => {
        const element = createCategoryElement(category);
        kategoriDiv.appendChild(element);
    });
}

//---------------------------------------------------------------------------------
async function loadData() {
    try {
        const data = await fetchCategories();
        renderCategoryList(data);
    } catch (error) {
        kategoriDiv.innerHTML = "<p>Could not load categories right now...</p>";
    }
}

//---------------------------------------------------------------------------------
btnSearch.addEventListener('click', function () {
    let searchWord = (txtSearch.value || "").trim(); 

    if (!searchWord) {
        searchWord = "*";
    }

    localStorage.setItem("searchItem", searchWord); 
    localStorage.removeItem("categoryID"); 
    location.href = "productList.html"; 
});

//---------------------------------------------------------------------------------
txtSearch.addEventListener('keydown', function (evt) {
    if (evt.key === "Enter") {
        btnSearch.click();
    }
});

//---------------------------------------------------------------------------------
goToShoppingCartBtn.addEventListener('click', function () {
    location.href = "shoppingCart.html";
});

//---------------------------------------------------------------------------------

userPicIfLoggedIn();
loadData();
