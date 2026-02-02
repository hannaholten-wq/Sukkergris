import { adminPicIfLoggedIn } from "./utils.js";

//------------------------------------------------------------
const btnLogin = document.getElementById("btnLogin");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const loginContainer = document.getElementById("loginContainer");
const adminMenu = document.getElementById("adminMenu");

const btnUsers = document.getElementById("btnUsers");
const btnProducts = document.getElementById("btnProducts");
const btnMessageBoard = document.getElementById("btnMessageBoard");
const btnOrders = document.getElementById("btnOrders");
const btnCommentAndRating = document.getElementById("btnCommentAndRating");
const btnLogout = document.getElementById("btnLogout");

const adminLoginURL =
  "https://sukkergris.onrender.com/users/adminlogin?key=HQFLNY94";

//------------------------------------------------------------
function showMessage(text) {
  message.textContent = text;
}

//------------------------------------------------------------
function createBasicAuthString(username, password) {
  return "basic " + btoa(username + ":" + password);
}

//------------------------------------------------------------
function getLoginCredentials() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showMessage("Please enter both username and password.");
    return null;
  }

  return { username, password };
}

//------------------------------------------------------------
function toggleLoginView(isLoggedIn) {
  if (isLoggedIn) {
    loginContainer.style.display = "none";
    adminMenu.style.display = "block";
    adminPicIfLoggedIn();
  } else {
    loginContainer.style.display = "block";
    adminMenu.style.display = "none";
  }
}

//------------------------------------------------------------
function storeAdminToken(token) {
  localStorage.setItem("adminToken", token);
}

//------------------------------------------------------------
function storeAdminThumb(logindata) {
  if (logindata && logindata.thumb) {
    localStorage.setItem("adminThumb", logindata.thumb);
  }
}

//------------------------------------------------------------
function clearAdminData() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminThumb");

  const smallPic = document.getElementById("smallPic");
  if (smallPic) {
    smallPic.hidden = true;
    smallPic.src = "";
  }
}

//------------------------------------------------------------
async function loginAdmin(username, password) {
  const response = await fetch(adminLoginURL, {
    method: "POST",
    headers: { authorization: createBasicAuthString(username, password) }
  });

  if (!response.ok) {
    showMessage("Login failed.");
    return null;
  }

  return response.json();
}

//------------------------------------------------------------
function handleSuccessfulLogin(data) {
  if (!data || !data.logindata) {
    showMessage("Login failed (no login data).");
    return;
  }

  const token = data.logindata.token;

  if (!token) {
    showMessage("Login failed (token missing).");
    return;
  }

  storeAdminToken(token);
  storeAdminThumb(data.logindata);
  toggleLoginView(true);
  showMessage("Login successful!");
}

//------------------------------------------------------------
async function handleLoginClick() {
  showMessage(""); 
  const credentials = getLoginCredentials();
  if (!credentials) return;

  try {
    const data = await loginAdmin(credentials.username, credentials.password);
    if (!data) return;
    handleSuccessfulLogin(data);
  } catch (error) {
    showMessage("Could not log in right now.");
  }
}

//------------------------------------------------------------
function handleLogoutClick() {
  clearAdminData();
  toggleLoginView(false);
  showMessage("You have been logged out.");
}

//------------------------------------------------------------
function handleKeyDown(evt) {
  if (evt.key === "Enter") {
    evt.preventDefault();
    handleLoginClick();
  }
}

//------------------------------------------------------------
function goToAdminProducts() {
  location.href = "adminProducts.html";
}

function goToAdminUsers() {
  location.href = "adminUsers.html";
}

function goToAdminOrders() {
  location.href = "adminOrders.html";
}

function goToCommentAndRating() {
  location.href = "commentAndRating.html";
}

function goToMessageBoard() {
  location.href = "messageBoard.html";
}

//------------------------------------------------------------
function initializeLoginView() {
  const token = localStorage.getItem("adminToken");

  if (token) {
    toggleLoginView(true);
  } else {
    toggleLoginView(false);
  }
}

//------------------------------------------------------------
function setupEventListeners() {
  btnLogin.addEventListener("click", handleLoginClick);
  btnLogout.addEventListener("click", handleLogoutClick);
  document.addEventListener("keydown", handleKeyDown);

  btnProducts.addEventListener("click", goToAdminProducts);
  btnUsers.addEventListener("click", goToAdminUsers);
  btnOrders.addEventListener("click", goToAdminOrders);
  btnCommentAndRating.addEventListener("click", goToCommentAndRating);
  btnMessageBoard.addEventListener("click", goToMessageBoard);
}

//------------------------------------------------------------
window.addEventListener("load", function () {
  initializeLoginView();
  setupEventListeners();
});
