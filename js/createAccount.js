
const message = document.getElementById('message');
const formCreateUser = document.getElementById('formCreateUser'); 
const btnHome = document.getElementById('btnHome'); 

const urlCreateUser = "https://sukkergris.onrender.com/users?key=HQFLNY94";


//-------------------------------------------------------------------

function showMsg(text, isError = false) { 
    message.hidden = false; 
    message.textContent = text; 

    if (isError) { 
        message.style.color = "red";
    } else {
        message.style.color = "green"; 
    }
}
//-------------------------------------------------------------------

function getFormData() {
    return {
        fullname: (document.getElementById('fullname').value || '').trim(),
        username: (document.getElementById('username').value || '').trim(),
        password: (document.getElementById('password').value || '').trim(),
        street: (document.getElementById('street').value || '').trim(),  
        city: (document.getElementById('city').value || '').trim(),
        zipcode: (document.getElementById('zipcode').value || '').trim(),
        country: (document.getElementById('country').value || '').trim(),
        img_file: (document.getElementById('img_file').files[0] || null) 
    };
}
//------------------------------------------------------------------------------

function checkForm(data) { 

    if (!data.fullname) { 
        document.getElementById("fullname").focus(); 
        return "Type in fullname"; 
    }

    if (!data.username) { 
        document.getElementById("username").focus(); 
        return "Type in e-mail"; 
    }

    if (!data.username.includes("@")) { 
        document.getElementById("username").focus(); 
        return "Invalid e-mail address"; 
    }

    if (!data.password) { 
        document.getElementById("password").focus(); 
        return "Type in password"; 
    }

    if (data.password.length < 8) { 
        document.getElementById("password").focus(); 
        return "The password must contain at least 8 characters"; 
    }

    if (!data.street) { 
        document.getElementById("street").focus(); 
        return "Type in street"; 
    }

    if (!data.city) { 
        document.getElementById("city").focus(); 
        return "Type in city"; 
    }

    if (!data.zipcode) { 
        document.getElementById("zipcode").focus(); 
        return "Type in zipcode"; 
    }

    if (isNaN(Number(data.zipcode))) {
    document.getElementById("zipcode").focus();
    return "Zipcode must contain only numbers.";
    }

    if (data.zipcode.length < 4 || data.zipcode.length > 10) {
    document.getElementById("zipcode").focus();
    return "Zipcode length is not valid.";
    }


    if (!data.country) {
        document.getElementById("country").focus(); 
        return "Type in country";
    }

    return ""; 

}
//-------------------------------------------------------------------
formCreateUser.addEventListener('submit', async function (evt) {
    evt.preventDefault(); 

    const data = getFormData();

    const error = checkForm(data); 
    if (error) { 
        showMsg(error, true); 
        return; 
    }

    //-------------------------------------------------------------------
    const maxFileSize = 1024 * 1024; // 1 MB

    if (data.img_file && data.img_file.size > maxFileSize) {
        showMsg("The file is too large. Maximum size is 1 MB.", true);
        return;
    }

    if (data.img_file && !data.img_file.type.startsWith("image/")) {
    showMsg("Only image files are allowed (jpg, png, webp...).", true);
    return;
    }

    //--------------------------------------------------------------------------

    try {
        const formData = new FormData(); 
        formData.append('fullname', data.fullname);
        formData.append('username', data.username);
        formData.append('password', data.password);
        formData.append('street', data.street);
        formData.append('city', data.city);
        formData.append('zipcode', data.zipcode);
        formData.append('country', data.country);

        if (data.img_file) {
            formData.append('img_file', data.img_file);
        }
        //-------------------------------------------------------------------
        const response = await fetch(urlCreateUser, { 
            method: 'POST', 
            body: formData 
        });

        //-------------------------------------------------------------------
        const text = await response.text();

        if (!response.ok) {
    try {
        const errorObj = JSON.parse(text);
        const msgText = errorObj.message || `HTTP ${response.status}`;

        let finalMsg = msgText;

        if (response.status === 400) { //bug i innlevert fil, bytta error messages.
            finalMsg = "An account with this e-mail already exists.";
        } else if (response.status === 409) {
            finalMsg = "The server did not accept some of the fields. Check your input.";
        }

        showMsg(`Could not create user: ${finalMsg}`, true);

        } catch {
            showMsg(
                `Could not create account right now. 
        The server returned an unexpected response (HTTP ${response.status}). 
        Please try again later.`,
                true
            );
        }
        return;
    }

        showMsg('User created! You can now log in.');
        setTimeout(function () {
            location.href = 'logIn.html';
        }, 1500);


    } catch (error) { 
        console.error(error);
        showMsg('Technical error - try again later.', true); 
    }

});
//-------------------------------------------------------------------
btnHome.addEventListener('click', function () {
    location.href = 'homePage.html';
});
