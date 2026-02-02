
import { adminPicIfLoggedIn } from "./utils.js";


//------------------------------------------------------------
const usersURL = "https://sukkergris.onrender.com/users?key=HQFLNY94";

const userListContainer = document.getElementById("userListContainer");
const message = document.getElementById("message");
const backBtn = document.getElementById("backBtn");

//------------------------------------------------------------
function showMessage(text) {
  message.textContent = text;
}

//------------------------------------------------------------
function getAdminToken() {
  return localStorage.getItem("adminToken");
}

//------------------------------------------------------------
async function loadData() {
  userListContainer.innerHTML = "Loading users...";

  const token = getAdminToken();
  if (!token) {
    showMessage("Not logged in.");
    return;
  }

  try {
    const response = await fetch(usersURL, {
      headers: { authorization: token }
    });

    if (!response.ok) {
      showMessage("Could not load users.");
      userListContainer.innerHTML = "";
      return;
    }

    const data = await response.json();
    showUserList(data);
  } catch {
    showMessage("Error loading users.");
    userListContainer.innerHTML = "";
  }
}

//------------------------------------------------------------
function showUserList(list) {
  userListContainer.innerHTML = "";

  if (!list || list.length === 0) {
    userListContainer.innerHTML = "<p>No users found.</p>";
    return;
  }

  for (const user of list) {
    const div = document.createElement("div");

    div.innerHTML = `
      <h3>User #${user.id}</h3>
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Full name:</strong> ${user.fullname || ""}</p>
      <p><strong>Email:</strong> ${user.email || ""}</p>
      <button class="deleteBtn">Delete user</button>
      <hr>
    `;

    const deleteBtn = div.querySelector(".deleteBtn");
    deleteBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(user.id);
    }});

    userListContainer.appendChild(div);
  }
}

//------------------------------------------------------------
async function deleteUser(id) {
  const token = getAdminToken();
  if (!token) {
    showMessage("Not logged in.");
    return;
  }

  const deleteUrl =
    `https://sukkergris.onrender.com/users?id=${id}&key=HQFLNY94`;

  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: { authorization: token }
    });

    if (!response.ok) {
      showMessage("Could not delete user.");
      return;
    }

    showMessage("User deleted.");
    loadData();
  } catch {
    showMessage("Error deleting user.");
  }
}

//------------------------------------------------------------
function handleBackClick() {
  location.href = "adminLogin.html";
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
  }

  loadData();
  backBtn.addEventListener("click", handleBackClick);
}

window.addEventListener("load", initPage);
  adminPicIfLoggedIn();
  loadData();
  backBtn.addEventListener("click", handleBackClick);


window.addEventListener("load", initPage);
