
const message = document.getElementById('message');


const formLogin = document.getElementById('formLogin');


const btnHome = document.getElementById('btnHome');


const urlLogIn = `https://sukkergris.onrender.com/users/login?key=HQFLNY94`;


//-----------------------------------------------------------------------------

function showMsg(text, isError = false) { 
    message.hidden = false;
    message.textContent = text;

    if (isError) {
        message.style.color = "red";
    } else {
        message.style.color = "green"; 
    }
}


//-----------------------------------------------------------------------------

function createBasicAuthString(username, password){
    const combinedString = username + ":" + password; 
    const b64Str = btoa(combinedString);
    return "basic " + b64Str;
}

//-----------------------------------------------------------------------------

function getFormData(){ 
    return {
        username: (document.getElementById('username').value || '').trim(), 
        password: (document.getElementById('password').value || '').trim()
    };
}


//-----------------------------------------------------------------------------

function checkForm(data){
    if (!data.username) {
        document.getElementById('username').focus();
        return "skriv inn e-post.";
    }

    if (!data.username.includes('@')) {
        document.getElementById('username').focus();
        return "Ugyldig e-postadresse.";
    }

    if (!data.password) {
        document.getElementById('password').focus();
        return "skriv inn passord.";
    }

    return ""; 
}


//-----------------------------------------------------------------------------

async function loginOnServer(username, password) {

    const response = await fetch(urlLogIn, {
        method: "POST",
        headers: {
            authorization: createBasicAuthString(username, password)
        }
    });

    if (!response.ok) {
        return null;
    }

    const loginJSON = await response.json();
    return loginJSON.logindata || {}; 
}


//-----------------------------------------------------------------------------
function saveLoginData(loginInfo, fallbackUsername) {

    const token = loginInfo.token;

    if (!token) { 
        showMsg("Login did not return a token from the server", true);
        return false;
    }


    if (loginInfo.id !== undefined && loginInfo.id !== null) {
        localStorage.setItem("userID", String(loginInfo.id));
    } else {
        localStorage.removeItem("userID");
    }

   
    const userData = {
        fullname: loginInfo.full_name,
        street: loginInfo.street,
        city: loginInfo.city,
        zipcode: loginInfo.zipcode,
        country: loginInfo.country,
        username: loginInfo.username,
        phone: loginInfo.phone
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("userToken", token);
    localStorage.setItem("userThumb", loginInfo.thumb || "");
    localStorage.setItem("username", loginInfo.username || fallbackUsername);

    return true;
}


//-----------------------------------------------------------------------------

formLogin.addEventListener('submit', async function(evt) {
    evt.preventDefault(); 

    const data = getFormData();
    const error = checkForm(data);

    if (error) {
        showMsg(error, true); 
        return;
    }

    try {
        const loginInfo = await loginOnServer(data.username, data.password);

        if (!loginInfo) {
            showMsg("Wrong username and/or password.", true);
            return;
        }

        const savedOk = saveLoginData(loginInfo, data.username);
        if (!savedOk) return;

        showMsg("Innloggingen vellykket! Sender deg til forsiden...", false);

        setTimeout(() => {
            location.href = "homePage.html";
        }, 1500);

    } catch (error) {
        showMsg("Teknisk feil - prøv igjen senere.", true);
    }
});


//-----------------------------------------------------------------------------

btnHome.addEventListener('click', function (){
    location.href = 'homePage.html';
});
