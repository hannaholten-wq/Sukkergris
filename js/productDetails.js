import { userPicIfLoggedIn } from "./utils.js"; 

//------------------------------------------------------------------------------------------------------------
const productID = localStorage.getItem("productID"); 
const productIdNumber = Number(productID);

const url = `https://sukkergris.onrender.com/webshop/products?id=${productID}&key=HQFLNY94`;

//-----------------------------------------------------------------------------------------------------------
const putInShoppingCartBtn = document.getElementById('putInShoppingCartBtn');
const goToShoppingCartBtn = document.getElementById('goToShoppingCartBtn');
const homeBtn = document.getElementById('homeBtn');
const imageContainer = document.getElementById('imageContainer');
const productName = document.getElementById('productName');
const productCategoryName = document.getElementById('productCategoryName');
const productDescription = document.getElementById('productDescription');
const productDiscount = document.getElementById('productDiscount');
const productPrice = document.getElementById('productPrice');
const productsInStock = document.getElementById('productsInStock');
const productExpectedShipped = document.getElementById('productExpectedShipped');
const productRating = document.getElementById('productRating');
const textInputFeltComment = document.getElementById('textInputFeltComment'); 
const rateThisProduct = document.getElementById('rateThisProduct'); 
const addCommentBtn = document.getElementById('addCommentBtn');
const messageAfterYouComment = document.getElementById('messageAfterYouComment'); 
const viewCommentsAndRatingsBtn = document.getElementById('viewCommentsAndRatingsBtn'); 
const message = document.getElementById("message");
const commentsSection = document.getElementById('commentsSection'); 
const commentsContainer = document.getElementById('commentsContainer'); 

//-------------------------------------------------------------------------------------------------
function showMessage(text) {
    message.textContent = text;
}

//-------------------------------------------------------------------------------------------------
function createFetchOptionsWithToken() {
    const token = localStorage.getItem("userToken");
    let fetchOptions = {};

    if (token) {
        fetchOptions = {
            headers: { authorization: token }
        };
    }

    return fetchOptions;
}

//-------------------------------------------------------------------------------------------------
function showProductInfo(products) {

    productName.innerText = products.name;
    productCategoryName.innerText = "Category: " + products.category_name;
    productDescription.innerText = products.description;

//----------------------------------------------------------------------------------------
    if (products.discount === "0") { 
        productDiscount.innerText = "";
    } else { 
        productDiscount.innerText = "Discount: " + products.discount + "%";
    }

//---------------------------------------------------------------------------------------
    productPrice.innerText = "Price: kr " + products.price + ",-";

//----------------------------------------------------------------------------------------
    if (products.stock === 0) { 
        const date = new Date(products.expected_shipped);
        const readableDate = date.toLocaleDateString('en-US', { year: "numeric", month: "long", day: "numeric" });
        productExpectedShipped.innerText = "Products is expected shipped: " + readableDate;
    } else {
        productsInStock.innerText = "Products in stock: " + products.stock;
    }
    
//-------------------------------------------------------------------------------------------
    if (products.rating === null) { 
        productRating.innerText = "";
    } else {
        productRating.innerText = "Rating: " + Math.floor(products.rating) + " stars"; 
    }

//-------------------------------------------------------------------------------------------
    const img = document.createElement("img");

    let imgUrl = "";

    if (products.static) {
        imgUrl = `https://sukkergris.onrender.com/images/GFTPOE21/large/${products.image}`;
    } else {  
        imgUrl = `https://sukkergris.onrender.com/images/HQFLNY94/large/${products.image}`;
    }

    img.src = imgUrl;
    imageContainer.prepend(img);
}

//-------------------------------------------------------------------------------------------------
function setupAddToCart(products) {

    putInShoppingCartBtn.addEventListener('click', function () {

        let cart = JSON.parse(localStorage.getItem("cartID") || "[]");

        let foundItem = false; 
        for (let item of cart) { 
            if (item.id === products.id) { 
                item.quantity = (item.quantity || 0) + 1;
                foundItem = true; 
            }
        }

        if (!foundItem) { 
            cart.push({ id: products.id, quantity: 1 });

        }

        localStorage.setItem("cartID", JSON.stringify(cart)); 

        showMessage("Product added to shoppingcart!");
    });
}

//----------------------------------------------------------------------------------------------
async function loadData() { 

    if (!productID) {
        showMessage("Product not found.");
        return;
    }

    try {
        const fetchOptions = createFetchOptionsWithToken();

        const response = await fetch(url, fetchOptions); 

        if (!response.ok) {
            showMessage("Could not load product details.");
            return;
        }

        const data = await response.json(); 

        if (!Array.isArray(data) || data.length === 0) {
            showMessage("Could not find this product.");
            return;
        }

        const products = data[0]; 

        showProductInfo(products);
        setupAddToCart(products);

    } catch (error) {
        showMessage("Could not load product details.");
    }
}

//------------------------------------------------------------------------------------------------------------------------
homeBtn.addEventListener('click', function () {
    location.href = "homePage.html";
});

//---------------------------------------------------------------------------------------------------------------------------
goToShoppingCartBtn.addEventListener('click', function () {
    location.href = "shoppingCart.html";
});

//----------------------------------------------------------------------------------------------------------------------------
textInputFeltComment.addEventListener('keydown', function (evt) {
    if (evt.key === "Enter") addCommentBtn.click(); 
});

//------------------------------------------------------------------------------------------------------------------------------
addCommentBtn.addEventListener('click', async function () { 
    const userToken = localStorage.getItem("userToken"); 

    if (!userToken) { 
        messageAfterYouComment.innerText = "You must be logged in to add a comment or a rating";
        return; 
    }

    const commentedText = (textInputFeltComment.value || "").trim() || "I have rated this product"; 

    const rating = Number(rateThisProduct.value) || 5; 

    const body = { 
        comment_text: commentedText, 
        product_id: productIdNumber, 
        rating: rating 
    };

    const urlComment = "https://sukkergris.onrender.com/webshop/comments?key=HQFLNY94"; 

    const headers = {
        "content-type": "application/json", 
        authorization: userToken 
    };

    try {
        const response = await fetch(urlComment, { 
            method: "POST", 
            headers: headers, 
            body: JSON.stringify(body) 
        });

        if (!response.ok) {
            messageAfterYouComment.innerText = "Could not save your comment. Please try again later";
            return;
        }

        await response.json(); 
        messageAfterYouComment.innerText = "Thank you for your rating and/or comment!"; 
        textInputFeltComment.value = ""; 

        if (commentsSection.style.display !== "none") {
            loadComments();
        }

    } catch (error) {
        messageAfterYouComment.innerText = "Something went wrong. Please try again later";
    }
});
//---------------------------------------------------------------------------------------------------------
function ratingStars(rating) { 
    const ratingNumber = Number(rating) || 0; 
    return "★".repeat(ratingNumber); 
}
//--------------------------------------------------------------------------------------------------------
async function loadComments() { 
    commentsContainer.innerHTML = "<p>Loading comments and rating...</p>"; 

    try {
        const url = `https://sukkergris.onrender.com/webshop/comments?product_id=${productID}&key=HQFLNY94`; 
        const response = await fetch(url); 

        if (!response.ok) {
            commentsContainer.innerHTML = "<p>Could not load comments and rating right now. Please try again later</p>";
            return;
        }

        const data = await response.json(); 

        if (!Array.isArray(data) || data.length === 0) { 
            commentsContainer.innerHTML = "<p>No comments or rating for this product yet</p>";
            return; 
        }

        commentsContainer.innerHTML = ""; 

        for (let comment of data) { 
            const eachCommentDiv = document.createElement("div"); 

            const commentContent = comment.comment_text || "No comment text"; 

            const ratingAsStars = ratingStars(comment.rating); 

            let whoCommented;
            if (comment.username) { 
                whoCommented = ` by ${comment.username}`; 
            } else {
                whoCommented = "";
            }

            let dateText;
            if (comment.created_at) { 
                dateText = ` on ${new Date(comment.created_at).toLocaleDateString("en-US")}`; 
            } else {
                dateText = "";
            }

            eachCommentDiv.innerHTML = `
                <p><strong>${ratingAsStars}</strong>${whoCommented}${dateText}</p>
                <p>${commentContent}</p>
                <hr>
            `; 

            commentsContainer.appendChild(eachCommentDiv); 
        }

    } catch (error) {
        commentsContainer.innerHTML = "<p>Could not load comments and rating right now. Please try again later</p>";
    }
}
//---------------------------------------------------------------------------------------------------------------------
viewCommentsAndRatingsBtn.addEventListener('click', function () { 
    if (commentsSection.style.display === "none") { 
        commentsSection.style.display = "block"; 
        viewCommentsAndRatingsBtn.innerText = "Hide comments and rating"; 
        loadComments(); 
    } else { 
        commentsSection.style.display = "none"; 
        viewCommentsAndRatingsBtn.innerText = "View comments and rating"; 
    }
});
//-------------------------------------------------------------------------------------
loadData(); 
userPicIfLoggedIn();

