
import { userPicIfLoggedIn } from "./utils.js";
userPicIfLoggedIn();

//----------------------------------------------------------------

const baseUserUrl = "https://sukkergris.onrender.com/users";
const groupKey = "HQFLNY94";
const message = document.getElementById("message");

//----------------------------------------------------------------

async function loadUserInfo() {
    const token = localStorage.getItem("userToken");
    if (!token) {
        redirectToHome();
        return;
    }

    const myID = localStorage.getItem("userID");

    try {
        const user = await fetchUserFromServer(myID, token);
        handleUserLoadResponse(user);
    } catch (error) {

        showMsg("Could not load user info", true);
    }
}

//----------------------------------------------------------------

async function fetchUserFromServer(myID, token) {
    let url = `${baseUserUrl}?key=${groupKey}`;

    const response = await fetch(url, {
        headers: { authorization: token }
    });

    const data = await response.json();

    if (!response.ok) {
        handleUserFetchError(response, data);
        return;
    }

    let user = null;

    if (Array.isArray(data)) {

        if (myID) {
            user = data.find(function (person) {
                return String(person.id) === String(myID);
            });
        }

        if (!user) {
            const myUsername = localStorage.getItem("username");
            if (myUsername) {
                user = data.find(function (person) {
                    return person.username === myUsername;
                });
            }
        }
    }

    if (!user) {
        showMsg("Could not find your user data on the server", true);
        return;
    }

    return user;
}

//----------------------------------------------------------------

function handleUserFetchError(response, data) {
    if (response.status === 401 || response.status === 403) {
        showMsg("Session expired. Logging you out...", true);
        setTimeout(logout, 1500);
        return;
    }

    let msgText = "Could not load user info";

    if (data) {
        if (data.msg) {
            msgText = data.msg;
        } else if (data.message) {
            msgText = data.message;
        }
    }

    showMsg(msgText, true);
}

//----------------------------------------------------------------

function handleUserLoadResponse(user) {
    if (!user) {
        return;
    }

    fillUserFields(user);
    updateUserDataInStorage(user);
}

//----------------------------------------------------------------

function getFullNameFromUser(user) {
    if (user.full_name) return user.full_name;
    if (user.fullname) return user.fullname;
    return "";
}

//----------------------------------------------------------------

function fillUserFields(user) {
    document.getElementById("fullname").value = getFullNameFromUser(user);
    document.getElementById("street").value = user.street || "";
    document.getElementById("city").value = user.city || "";
    document.getElementById("zipcode").value = user.zipcode || "";
    document.getElementById("country").value = user.country || "";
}

//----------------------------------------------------------------

function updateUserDataInStorage(user) {
    const userData = {
        fullname: getFullNameFromUser(user),
        street: user.street || "",
        city: user.city || "",
        zipcode: user.zipcode || "",
        country: user.country || ""
    };

    localStorage.setItem("userData", JSON.stringify(userData));
}

//----------------------------------------------------------------

function showMsg(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "red" : "green";
}

//----------------------------------------------------------------

function redirectToHome() {
    location.href = "homePage.html";
}

//----------------------------------------------------------------

function getUserFormData() {
    const formData = new FormData();
    formData.append("fullname", document.getElementById("fullname").value);
    formData.append("street", document.getElementById("street").value);
    formData.append("city", document.getElementById("city").value);
    formData.append("zipcode", document.getElementById("zipcode").value);
    formData.append("country", document.getElementById("country").value);

    const fileInput = document.getElementById("img_file");
    const file = fileInput.files[0];

    return { formData, file };
}

//----------------------------------------------------------------

function validatePasswordLength(password) {
    if (!password) {
        return { ok: true, msg: "" };
    }

    if (password.length < 8) {
        return {
            ok: false,
            msg: "Password must be at least 8 characters"
        };
    }

    return { ok: true, msg: "" };
}

//----------------------------------------------------------------

function getPasswordFromForm() {
    return document.getElementById("password").value;
}

//----------------------------------------------------------------

function validatePasswordOrShowError(password) {
    const pwValidation = validatePasswordLength(password);
    if (!pwValidation.ok) {
        showMsg(pwValidation.msg, true);
        return false;
    }
    return true;
}

//----------------------------------------------------------------

function appendPasswordIfPresent(formData, password) {
    if (password) {
        formData.append("password", password);
    }
}

//----------------------------------------------------------------

function validateImageOrShowError(file) {
    const validation = validateImageFile(file);
    if (!validation.ok) {
        showMsg(validation.msg, true);
        return false;
    }
    return true;
}

//----------------------------------------------------------------

function appendImageIfPresent(formData, file) {
    if (file) {
        formData.append("img_file", file);
    }
}

//----------------------------------------------------------------

function validateImageFile(file) {
    if (!file) {
        return { ok: true, msg: "" };
    }

    const maxFileSize = 1024 * 1024; // 1 MB
    if (file.size > maxFileSize) {
        return {
            ok: false,
            msg: "The file is too large. Maximum size is 1 MB."
        };
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
        return {
            ok: false,
            msg: "Only JPG or PNG images are allowed."
        };
    }

    return { ok: true, msg: "" };
}

//----------------------------------------------------------------

function handleSaveErrorResponse(response, data) {
    if (response.status === 413) {
        showMsg("The file is too large. Maximum size is 1 MB.", true);
        return;
    }

    let msgText = `HTTP ${response.status}`;

    if (data) {
        if (data.msg) {
            msgText = data.msg;
        } else if (data.message) {
            msgText = data.message;
        }
    }

    showMsg("Could not save changes: " + msgText, true);
}

//----------------------------------------------------------------

function updateThumbIfPresent(user) {
    if (!user || !user.thumb) {
        return;
    }

    localStorage.setItem("userThumb", user.thumb);

    const img = document.getElementById("smallPic");
    if (!img) {
        return;
    }

    img.src = `https://sukkergris.onrender.com/images/${groupKey}/users/${user.thumb}`;
    img.alt = "My profile picture";
    img.hidden = false;
}

//----------------------------------------------------------------

document.getElementById("btnSave").addEventListener("click", saveUserSettings);

//----------------------------------------------------------------

async function saveUserSettings() {
    const token = localStorage.getItem("userToken");
    if (!token) {
        return;
    }

    const password = document.getElementById("password").value;

    const pwValidation = validatePasswordLength(password);
    if (!pwValidation.ok) {
        showMsg(pwValidation.msg, true);
        return;
    }
    
    const { formData, file } = getUserFormData();

    appendPasswordIfPresent(formData, password);

    const isImageOk = validateImageOrShowError(file);
    if (!isImageOk) {
        return;
    }

    appendImageIfPresent(formData, file);

    await sendSaveRequest(formData, token);
}


//----------------------------------------------------------------

async function sendSaveRequest(formData, token) {
    try {
        const response = await fetch(
            `${baseUserUrl}?key=${groupKey}`,
            {
                method: "PUT",
                headers: { authorization: token },
                body: formData
            }
        );

        const data = await tryParseJson(response);


        if (!response.ok) {
            handleSaveErrorResponse(response, data);
            return;
        }

        const user = data && (data.record || data);
        updateThumbIfPresent(user);

        if (user) {
            updateUserDataInStorage(user);
        }

        showMsg("Changes saved!", false);
        await loadUserInfo();
    } catch (error) {

        showMsg("Error saving changes.", true);
    }
}

//----------------------------------------------------------------

async function tryParseJson(response) {
    try {
        return await response.json();
    } catch (error) {
        return null;
    }
}


//----------------------------------------------------------------

document.getElementById("btnDelete").addEventListener("click", async function () {
    const token = localStorage.getItem("userToken");
    if (!token) {
        return;
    }

    const confirmed = confirm("Are you sure you want to delete your account?");
    if (!confirmed) {
        return;
    }

    try {
        await fetch(
            `${baseUserUrl}?key=${groupKey}`,
            {
                method: "DELETE",
                headers: { authorization: token }
            }
        );

        logout();
    } catch (error) {

        showMsg("Could not delete user", true);
    }
});

//----------------------------------------------------------------

document.getElementById("btnLogout").addEventListener("click", logout);

function logout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userThumb");
    localStorage.removeItem("userID");
    localStorage.removeItem("userData");

    redirectToHome();
}

//----------------------------------------------------------------

document.getElementById("btnHome").addEventListener("click", function () {
    redirectToHome();
});

//----------------------------------------------------------------

loadUserInfo();
