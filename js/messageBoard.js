import { adminPicIfLoggedIn, userPicIfLoggedIn } from "./utils.js";

//------------------------------------------------------------
const groupKey = "HQFLNY94";

const msgURL = "https://sukkergris.onrender.com/msgboard/messages";
const usersURL = "https://sukkergris.onrender.com/users";
const beenzURL = "https://sukkergris.onrender.com/users/beenz";

let allUsers = [];

//------------------------------------------------------------
const msgHeading = document.getElementById("msgHeading");
const msgText = document.getElementById("msgText");
const btnPost = document.getElementById("btnPost");
const msgError = document.getElementById("msgError");
const messagesContainer = document.getElementById("messagesContainer");

const userSelect = document.getElementById("userSelect");
const beenzSelect = document.getElementById("beenzSelect");
const btnRate = document.getElementById("btnRate");
const btnClearRatings = document.getElementById("btnClearRatings");
const ratingMessage = document.getElementById("ratingMessage");
const userRatingsContainer = document.getElementById("userRatingsContainer");

const backBtn = document.getElementById("backBtn");
const btnHomePage = document.getElementById("btnHomePage");

//------------------------------------------------------------
function showMessage(element, text) {
  element.textContent = text;
}

//------------------------------------------------------------
function getActiveToken() {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");
  return adminToken || userToken || null;
}

//------------------------------------------------------------
function getPostToken() {
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");

  if (userToken) return userToken;
  if (adminToken) return adminToken;
  return null;
}

//------------------------------------------------------------
function getCurrentUserIdFromData(userData) {
  if (userData && userData.id) {
    return userData.id;
  }

  const currentUserName =
    (userData && userData.username) || localStorage.getItem("username");

  if (!currentUserName || allUsers.length === 0) {
    return null;
  }

  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    if (user.username === currentUserName) {
      return user.id;
    }
  }

  return null;
}

//------------------------------------------------------------
function getLoginDetails() {
  const userToken = localStorage.getItem("userToken");
  const adminToken = localStorage.getItem("adminToken");
  const userData = JSON.parse(localStorage.getItem("userData") || "null");

  const isAdminLoggedIn = !!adminToken;
  const currentUserId = getCurrentUserIdFromData(userData);
  const token = adminToken || userToken || "";

  return {
    isAdminLoggedIn,
    currentUserId,
    token
  };
}

//------------------------------------------------------------
function findUsernameById(userId) {
  for (let i = 0; i < allUsers.length; i++) {
    const oneUser = allUsers[i];
    if (Number(oneUser.id) === Number(userId)) {
      return oneUser.username || "Unknown user";
    }
  }
  return "Unknown user";
}

//------------------------------------------------------------
async function loadUsers() {
  const token = getActiveToken();

  if (!token) {
    userSelect.innerHTML = "<option>Login required</option>";
    userRatingsContainer.innerHTML = "<p>Login required to see ratings.</p>";
    return;
  }

  const url = `${usersURL}?key=${groupKey}`;

  try {
    const response = await fetch(url, {
      headers: { authorization: token }
    });

    if (!response.ok) {
      showMessage(ratingMessage, "Could not load users.");
      return;
    }

    const users = await response.json();
    allUsers = users;

    showUsersInSelect(users);
    showUserRatings(users);
    loadMessages();
  } catch {
    showMessage(ratingMessage, "Error loading.");
  }
}

//------------------------------------------------------------
function showUsersInSelect(users) {
  userSelect.innerHTML = '<option value="">-- select user --</option>';

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const optionElement = document.createElement("option");

    optionElement.value = user.id;
    optionElement.textContent = user.username;

    userSelect.appendChild(optionElement);
  }
}

//------------------------------------------------------------
function showUserRatings(users) {
  userRatingsContainer.innerHTML = "";

  const ulTag = document.createElement("ul");

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const liTag = document.createElement("li");

    let beenz;
    if (user.beenz == null) {
      beenz = "no rating";
    } else {
      beenz = user.beenz + " / 5";
    }

    liTag.textContent = user.username + ": " + beenz;
    ulTag.appendChild(liTag);
  }

  userRatingsContainer.appendChild(ulTag);
}

//------------------------------------------------------------
async function fetchMessages(token) {
  const url = `${msgURL}?all=true&asc=true&key=${groupKey}`;

  const response = await fetch(url, {
    headers: { authorization: token }
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

//------------------------------------------------------------
async function loadMessages() {
  messagesContainer.innerHTML = "Loading...";

  const token = getActiveToken();
  if (!token) {
    messagesContainer.innerHTML =
      "<p>You must be logged in to see messages.</p>";
    return;
  }

  try {
    const list = await fetchMessages(token);

    if (!list) {
      messagesContainer.innerHTML = "<p>Could not load messages.</p>";
      return;
    }

    showMessages(list);
  } catch {
    messagesContainer.innerHTML = "<p>Error loading messages.</p>";
  }
}

//------------------------------------------------------------
function createMessageElement(messageData, loginInfo) {
  const div = document.createElement("div");
  let username = findUsernameById(messageData.user_id);

  if (username === "Unknown user") {
    username = "Admin";
  }

  let deleteButtonHtml = "";
  const isAdmin = loginInfo.isAdminLoggedIn;
  const currentUserId = loginInfo.currentUserId;

  if (
    isAdmin ||
    (currentUserId &&
      Number(messageData.user_id) === Number(currentUserId))
  ) {
    deleteButtonHtml =
      '<button class="deleteBtn" data-id="' +
      messageData.id +
      '">Delete message</button>';
  }

  div.innerHTML =
    "<h3>" +
    (messageData.heading || "") +
    "</h3>" +
    "<p>" +
    (messageData.message || messageData.message_text || "") +
    "</p>" +
    "<p><small>By: " +
    username +
    "</small></p>" +
    deleteButtonHtml +
    "<hr>";

  return div;
}

//------------------------------------------------------------
function showMessages(list) {
  messagesContainer.innerHTML = "";

  if (!list || list.length === 0) {
    messagesContainer.innerHTML = "<p>No comments yet.</p>";
    return;
  }

  const loginInfo = getLoginDetails();

  for (let i = 0; i < list.length; i++) {
    const oneMessage = list[i];
    const element = createMessageElement(oneMessage, loginInfo);
    messagesContainer.appendChild(element);
  }

  addDeleteButtonListeners();
}

//------------------------------------------------------------
function addDeleteButtonListeners() {
  const buttons = document.querySelectorAll(".deleteBtn");

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];

    btn.addEventListener("click", function () {
      const id = Number(btn.getAttribute("data-id"));
      if (!id) return;

      if (!confirm("Are you sure you want to delete this message?")) return;

      deleteMessage(id);
    });
  }
}

//------------------------------------------------------------
async function deleteMessage(messageId) {
  const token = getActiveToken();
  if (!token) {
    showMessage(msgError, "You must be logged in to delete messages");
    return;
  }

  const url = `${msgURL}?key=${groupKey}&message_id=${messageId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { authorization: token }
    });

    if (!response.ok) {
      showMessage(msgError, "Could not delete message");
      return;
    }

    loadMessages();
  } catch {
    showMessage(msgError, "Error deleting message");
  }
}

//------------------------------------------------------------
function getPostTextsOrShowError() {
  const headingText = msgHeading.value.trim();
  const text = msgText.value.trim();

  if (!headingText || !text) {
    showMessage(msgError, "Both heading and message text required.");
    return null;
  }

  return { headingText, text };
}

//------------------------------------------------------------
async function sendPostRequest(token, body) {
  const url = `${msgURL}?key=${groupKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: token,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    showMessage(msgError, "Could not post.");
    return;
  }

  msgHeading.value = "";
  msgText.value = "";
  showMessage(msgError, "Posted!");
  loadMessages();
}

//------------------------------------------------------------
async function handlePostClick() {
  showMessage(msgError, "");

  const token = getPostToken();
  if (!token) {
    showMessage(msgError, "You must be logged in to post.");
    return;
  }

  const texts = getPostTextsOrShowError();
  if (!texts) return;

  const body = {
    heading: texts.headingText,
    message_text: texts.text
  };

  try {
    await sendPostRequest(token, body);
  } catch {
    showMessage(msgError, "Error posting.");
  }
}

//------------------------------------------------------------
function handleMsgTextKeyDown(evt) {
  if (evt.key === "Enter" && !evt.shiftKey) {
    evt.preventDefault();
    handlePostClick();
  }
}


//------------------------------------------------------------
function getRateInputOrShowError() {
  const userid = userSelect.value;
  const beenz = Number(beenzSelect.value);

  if (!userid) {
    showMessage(ratingMessage, "Select user first.");
    return null;
  }

  return { userid: Number(userid), beenz };
}

//------------------------------------------------------------
function validateRatePermissions(userid, loginInfo) {
  const currentUserId = loginInfo.currentUserId;
  const isAdminLoggedIn = loginInfo.isAdminLoggedIn;

  if (isAdminLoggedIn) {
    showMessage(ratingMessage, "Admin can not rate users");
    return false;
  }

  if (Number(userid) === Number(currentUserId)) {
    showMessage(ratingMessage, "You can not rate yourself");
    return false;
  }

  return true;
}

//------------------------------------------------------------
async function sendRateRequest(token, body) {
  const url = `${beenzURL}?key=${groupKey}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      authorization: token,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    showMessage(ratingMessage, "Could not save");
    return;
  }

  showMessage(ratingMessage, "Rating saved!");
  loadUsers();
}

//------------------------------------------------------------
async function handleRateClick() {
  showMessage(ratingMessage, "");

  const token = getActiveToken();
  if (!token) {
    showMessage(ratingMessage, "You must be logged in to rate");
    return;
  }

  const input = getRateInputOrShowError();
  if (!input) return;

  const loginInfo = getLoginDetails();
  const ok = validateRatePermissions(input.userid, loginInfo);
  if (!ok) return;

  try {
    await sendRateRequest(token, input);
  } catch {
    showMessage(ratingMessage, "Error saving rating.");
  }
}

//------------------------------------------------------------
async function handleClearRatingsClick() {
  showMessage(ratingMessage, "");

  const token = getActiveToken();
  if (!token) {
    showMessage(ratingMessage, "Login required.");
    return;
  }

  const url = `${beenzURL}?key=${groupKey}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { authorization: token }
    });

    if (!response.ok) {
      showMessage(ratingMessage, "Could not delete ratings.");
      return;
    }

    showMessage(ratingMessage, "Ratings deleted.");
    loadUsers();
  } catch {
    showMessage(ratingMessage, "Error deleting ratings.");
  }
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
function handleBackClick() {
  location.href = "adminLogin.html";
}

//------------------------------------------------------------
function setupEventListeners() {
  btnPost.addEventListener("click", handlePostClick);
  msgText.addEventListener("keydown", handleMsgTextKeyDown);

  btnRate.addEventListener("click", handleRateClick);
  btnClearRatings.addEventListener("click", handleClearRatingsClick);

  backBtn.addEventListener("click", handleBackClick);

}

//------------------------------------------------------------
function initPage() {
  showProfilePic();

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

  setupEventListeners();
  loadUsers();
}
document.addEventListener("DOMContentLoaded", initPage);
