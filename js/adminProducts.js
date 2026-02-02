import { adminPicIfLoggedIn } from "./utils.js";

//------------------------------------------------------------
const url = "https://sukkergris.onrender.com/webshop/products?key=HQFLNY94";
const categoriesURL = "https://sukkergris.onrender.com/webshop/categories?key=HQFLNY94";

const productListContainer = document.getElementById("productListContainer");

const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const message = document.getElementById("message");

const productIdInput = document.getElementById("productId");
const nameInput = document.getElementById("name");
const headingInput = document.getElementById("heading");
const categoryIdInput = document.getElementById("category_id");
const descriptionInput = document.getElementById("description");
const priceInput = document.getElementById("price");
const discountInput = document.getElementById("discount");
const stockInput = document.getElementById("stock");
const imgFileInput = document.getElementById("img_file");
const expectedShipped = document.getElementById("expected_shipped");

const backBtn = document.getElementById("backBtn");

//------------------------------------------------------------
function getAdminToken() {
  return localStorage.getItem("adminToken");
}

//------------------------------------------------------------
function showMessage(text) {
  message.textContent = text;
}



//------------------------------------------------------------
function clearForm() {
  formTitle.textContent = "Add new product";
  saveBtn.textContent = "Save product";
  cancelEditBtn.style.display = "none";

  productIdInput.value = "";
  nameInput.value = "";
  headingInput.value = "";
  categoryIdInput.value = "";
  descriptionInput.value = "";
  priceInput.value = "";
  discountInput.value = "";
  stockInput.value = "";
  imgFileInput.value = "";
  expectedShipped.value = "";
}

//------------------------------------------------------------
function fillFormWithProduct(product) {
  formTitle.textContent = "Edit product";
  saveBtn.textContent = "Save changes";
  cancelEditBtn.style.display = "inline-block";

  productIdInput.value = product.id;
  nameInput.value = product.name || "";
  headingInput.value = product.heading || "";
  categoryIdInput.value = product.category_id || "";
  descriptionInput.value = product.description || "";
  priceInput.value = product.price || "";
  discountInput.value = product.discount || "";
  stockInput.value = product.stock || "";
  expectedShipped.value = product.expected_shipped || "";
}

//------------------------------------------------------------
function buildProductFormData(includeId) {
  const formData = new FormData();

  if (includeId) {
    formData.append("id", productIdInput.value);
  }

  formData.append("name", nameInput.value);
  formData.append("heading", headingInput.value);
  formData.append("category_id", categoryIdInput.value);
  formData.append("description", descriptionInput.value);
  formData.append("price", priceInput.value);
  formData.append("discount", discountInput.value);
  formData.append("stock", stockInput.value);
  formData.append("expected_shipped", expectedShipped.value);

  if (imgFileInput.files.length > 0) {
    formData.append("img_file", imgFileInput.files[0]);
  }

  return formData;
}

//------------------------------------------------------------
async function loadCategories() {
  const response = await fetch(categoriesURL);

  if (!response.ok) {
    showMessage("Could not load categories.");
    return;
  }

  const categories = await response.json();
  fillCategorySelect(categories);
}

//------------------------------------------------------------
function fillCategorySelect(categories) {
  categoryIdInput.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- choose category --";
  categoryIdInput.appendChild(defaultOption);

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category.id;       
    option.textContent = category.category_name; 
    categoryIdInput.appendChild(option);
  }
}

//------------------------------------------------------------
async function sendProductRequest(method, formData, successText, errorText) {
  const token = getAdminToken();
  if (!token) {
    showMessage("Not logged in.");
    return;
  }

  const response = await fetch(url, {
    method: method,
    headers: { authorization: token },
    body: formData
  });

  if (!response.ok) {
    showMessage(errorText);
    return;
  }

  showMessage(successText);
  clearForm();
  loadData();
}



//------------------------------------------------------------
function addProduct() {
  const formData = buildProductFormData(false);
  sendProductRequest("POST", formData, "Product added.", "Could not add product.");
}

//------------------------------------------------------------
function updateProduct() {
  const formData = buildProductFormData(true);
  sendProductRequest("PUT", formData, "Product updated.", "Could not update product.");
}


//------------------------------------------------------------
async function deleteProduct(id) {
  const token = getAdminToken();
  if (!token) {
    showMessage("Not logged in.");
    return;
  }

  const deleteUrl =
    `https://sukkergris.onrender.com/webshop/products?id=${id}&key=HQFLNY94`;

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: { authorization: token }
  });

  if (!response.ok) {
    showMessage("Could not delete product.");
    return;
  }

  showMessage("Product deleted.");
  loadData();
}

//------------------------------------------------------------
async function fetchProducts() {
  const response = await fetch(url);

  if (!response.ok) {
    showMessage("Could not load products."); 
    return null;
  }

  return response.json();
}


//------------------------------------------------------------
function filterDynamicProducts(data) {
  return data.filter(function (product) {
    return product.static === false;
  });
}

//------------------------------------------------------------
function createProductElement(product) {
  const div = document.createElement("div");

  div.innerHTML = `
    <h3>${product.name}</h3>
    <p>ID: ${product.id}</p>
    <p>Price: ${product.price} ,-</p>
    <button class="editBtn">Edit</button>
    <button class="deleteBtn">Delete</button>
    <hr>
  `;

  const editBtn = div.querySelector(".editBtn");
  const deleteBtn = div.querySelector(".deleteBtn");

  editBtn.addEventListener("click", function () {
    fillFormWithProduct(product);
  });

  deleteBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this product?")) {
    deleteProduct(product.id);
  }});

  return div;
}
//------------------------------------------------------------
function showProductList(list) {
  productListContainer.innerHTML = "";

  if (list.length === 0) {
    productListContainer.innerHTML = "<p>No products</p>";
    return;
  }

  for (const product of list) {
    const productElement = createProductElement(product);
    productListContainer.appendChild(productElement);
  }
}

//------------------------------------------------------------
async function loadData() {
  productListContainer.innerHTML = "Loading...";

  const data = await fetchProducts();
  if (!data) {
    productListContainer.innerHTML = "<p>Could not load products.</p>";
    return;
  }

  const list = filterDynamicProducts(data);
  showProductList(list);
}

//------------------------------------------------------------
function handleSaveClick() {
  const isEdit = (productIdInput.value || "").trim() !== "";
  if (isEdit) {
    updateProduct();
  } else {
    addProduct();
  }
}

//------------------------------------------------------------
function handleCancelEdit() {
  clearForm();
}

//------------------------------------------------------------
function handleBackClick() {
  location.href = "adminLogin.html";
}

//------------------------------------------------------------
function initPage() {
  adminPicIfLoggedIn();
  clearForm();
  loadCategories(); 
  loadData();

  saveBtn.addEventListener("click", handleSaveClick);
  cancelEditBtn.addEventListener("click", handleCancelEdit);
  backBtn.addEventListener("click", handleBackClick);
}

window.addEventListener("load", initPage);