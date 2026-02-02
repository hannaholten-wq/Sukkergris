import { adminPicIfLoggedIn, userPicIfLoggedIn } from "./utils.js";

//------------------------------------------------------------
const backBtn = document.getElementById("backBtn");
const btnHomePage = document.getElementById("btnHomePage");
const commentsContainer = document.getElementById("commentsContainer");
const message = document.getElementById("message");

const usersURL = "https://sukkergris.onrender.com/users?key=HQFLNY94";
const commentsURL = "https://sukkergris.onrender.com/webshop/comments?key=HQFLNY94";

let allUsers = [];

//------------------------------------------------------------
function getActiveToken() {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");
  return adminToken || userToken || null;
}

//------------------------------------------------------------
function showMessage(text) {
  message.textContent = text;
}
//------------------------------------------------------------
async function loadAllUsers() {
  const token = getActiveToken();

  if (!token) {
    showMessage("Not logged in.");
    return null;
  }

  try {
    const response = await fetch(usersURL, {
      method: "GET",
      headers: { authorization: token }
    });

    if (!response.ok) {
      showMessage("Could not load users.");
      return null;
    }

    const users = await response.json();
    return users;

  } catch {
    showMessage("Error loading users.");
    return null;
  }
}


//------------------------------------------------------------
function findUsernameById(userId) {
  for (const oneUser of allUsers) {
    if (oneUser.id === userId) {
      return oneUser.username || "Unknown user";
    }
  }

  return "Unknown user";
}

//------------------------------------------------------------
async function deleteComment(commentId) {
  const token = getActiveToken();

  if (!token) {
    showMessage("You must be logged in to delete comments.");
    return;
  }

  const url =
    `https://sukkergris.onrender.com/webshop/comments?key=HQFLNY94&comment_id=${commentId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { authorization: token }
    });

    if (!response.ok) {
      showMessage("Could not delete comment.");
      return;
    }

    showMessage("Comment deleted.");
    loadAllComments();
  } catch {
    showMessage("Error deleting comment.");
  }
}


//------------------------------------------------------------
function addDeleteListeners() {
  document.querySelectorAll(".deleteCommentBtn").forEach(function (btn) {

    const id = Number(btn.dataset.id);
    if (!id) return;

    btn.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment(id);
    }});
  });
}


//------------------------------------------------------------
function sortComments(list) {
  list.sort(function (firstComment, secondComment) {
    if (firstComment.product_id !== secondComment.product_id) {
      return firstComment.product_id - secondComment.product_id;
    }
    return new Date(firstComment.date) - new Date(secondComment.date);
  });
}

//------------------------------------------------------------
function createCommentElement(comment) {
  const div = document.createElement("div");
  div.className = "admin-comment-box";

  const usernameText = findUsernameById(comment.user_id);

  let readableDate = "Unknown date";
  if (comment.date) {
    readableDate = new Date(comment.date).toLocaleString();
  }

  let deleteBtnHTML = "";
  if (getActiveToken()) {
    deleteBtnHTML =
      `<button class="deleteCommentBtn" data-id="${comment.id}">Delete</button>`;
  }

  div.innerHTML = `
    <h3>Product ID: ${comment.product_id}</h3>
    <p><strong>Username:</strong> ${usernameText}</p>
    <p><strong>Rating:</strong> ${comment.rating ?? "No rating"}</p>
    <p><strong>Comment:</strong> ${comment.comment_text}</p>
    <p><strong>Date:</strong> ${readableDate}</p>
    ${deleteBtnHTML}
    <hr>
  `;

  return div;
}

//------------------------------------------------------------
function renderComments(list) {
  commentsContainer.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    commentsContainer.innerHTML = "<p>No comments or ratings yet</p>";
    return;
  }

  sortComments(list);

  for (const comment of list) {
    const element = createCommentElement(comment);
    commentsContainer.appendChild(element);
  }

  addDeleteListeners();
}

//------------------------------------------------------------
async function loadAllComments() {
  const activeToken = getActiveToken();

  if (!activeToken) {
    commentsContainer.innerHTML =
      "<p>You must be logged in to see comments and ratings</p>";
    return;
  }

  try {
    const response = await fetch(commentsURL, {
      method: "GET",
      headers: { authorization: activeToken }
    });

    if (!response.ok) {
      commentsContainer.innerHTML =
        "<p>Could not load comments or ratings</p>";
      return;
    }

    const data = await response.json();
    renderComments(data);
  } catch (error) {
    commentsContainer.innerHTML = "<p>Error loading comments</p>";
  }
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

  backBtn.addEventListener("click", handleBackClick);

  loadAllUsers().then(loadAllComments);
}

document.addEventListener("DOMContentLoaded", initPage);
