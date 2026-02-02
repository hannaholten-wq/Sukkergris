const goToShoppingCartBtn = document.getElementById('goToShoppingCartBtn');
const homeBtn = document.getElementById('homeBtn');
const container = document.getElementById('container');

const txtSearch = document.getElementById('txtSearch');
const btnSearch = document.getElementById('btnSearch');

const url = `https://sukkergris.onrender.com/webshop/products?search=&key=HQFLNY94`; 

//--------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------
function getFetchOptions() {
    const token = localStorage.getItem('userToken');

    if (!token) {
        return {};
    }

    return {
        headers: { authorization: token }
    };
}

//---------------------------------------------------------------------------------
async function fetchProducts() {
    const response = await fetch(url, getFetchOptions());

    if (!response.ok) {
        throw new Error("Could not fetch products, status: " + response.status);
    }

    return response.json();
}

//---------------------------------------------------------------------------------
function filterProducts(data, searchItem, categoryID) {
    let list = data;

    if (searchItem) {
        const searchWord = searchItem.toLowerCase();

        list = list.filter(function (product) {
            return (product.name || '').toLowerCase().includes(searchWord) ||
                   (product.description || '').toLowerCase().includes(searchWord);
        });
    }

    if (categoryID) {
        list = list.filter(function (product) {
            return String(product.category_id) === String(categoryID);
        });
    }

    return list;
}

//---------------------------------------------------------------------------------
function createProductElement(product) {
    const eachProductDiv = document.createElement("div");

    let imgSrc = "default_product.webp";

    if (product.static === true && product.thumb) {
        imgSrc = `https://sukkergris.onrender.com/images/GFTPOE21/small/${product.thumb}`;
    } else if (product.static === false && product.thumb) {
        imgSrc = `https://sukkergris.onrender.com/images/HQFLNY94/small/${product.thumb}`;
    }


    eachProductDiv.innerHTML = `
        <img src="${imgSrc}">
        <h3>${product.name}</h3>
        <h3> Price: ${product.price} ,-</h3>
        <hr>
    `;

    eachProductDiv.addEventListener('click', function () {
        localStorage.setItem("productID", product.id);
        location.href = "productDetails.html";
    });

    return eachProductDiv;
}

//---------------------------------------------------------------------------------
function renderProductList(list) {
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = `<p>No products match your search</p>`;
        return;
    }

    for (let product of list) {
        const element = createProductElement(product);
        container.appendChild(element);
    }
}


//---------------------------------------------------------------------------------
async function loadData() {
    try {
        const data = await fetchProducts();

        const filterState = getFilterState();
        const filteredList = filterProducts(
            data,
            filterState.searchItem,
            filterState.categoryID
        );

        renderProductList(filteredList); 

    } catch (error) {
        container.innerHTML = '<p>Could not load products right now...</p>';
    }
}

//-------------------------------------------------------------------

function setInitialSearchValue() {
    const searchWord = localStorage.getItem('searchItem') || '';
    txtSearch.value = searchWord; 
}

//-------------------------------------------------------------------

function applySearchFromThisPage() {
    const searchWord = (txtSearch.value || '').trim();
    localStorage.setItem('searchItem', searchWord);
    localStorage.removeItem('categoryID'); 
    loadData(); 
}

//-------------------------------------------------------------------

function wireSearchOnProductList() {
    btnSearch.addEventListener('click', applySearchFromThisPage);
    txtSearch.addEventListener('keydown', function (evt) {
        if (evt.key === 'Enter') applySearchFromThisPage(); 
    });
}

//-------------------------------------------------------------------
goToShoppingCartBtn.addEventListener('click', function () {
    location.href = "shoppingCart.html";
});

//-------------------------------------------------------------------
homeBtn.addEventListener('click', function () {
    location.href = 'homePage.html';
});

//-----------------------------------------------------------------------
function getFilterState() {
    const searchItem = (localStorage.getItem('searchItem') || '').trim();
    const categoryID = localStorage.getItem('categoryID') || '';
    return { searchItem, categoryID };
}
//-------------------------------------------------------------------------------------

setInitialSearchValue(); 
wireSearchOnProductList(); 
loadData(); 



