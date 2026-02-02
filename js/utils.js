//----------------------------------------------------------------------------------
export function userPicIfLoggedIn() {
    const img = document.getElementById('smallPic');
    if (!img) return;

    const token = localStorage.getItem('userToken') || '';
    const thumb = 
        localStorage.getItem('userThumb') || 
        localStorage.getItem("smallPic") ||
        "";

    if (!token) {
        img.hidden = true;
        return;
    }

    let src = '';

    if (!thumb) {
        src = 'default_profile.jpeg';
    } else { 
        src = `https://sukkergris.onrender.com/images/HQFLNY94/users/${thumb}`;
    }

    img.src = src;
    img.alt = "My profile picture";
    img.hidden = false;

    img.addEventListener('click', () => {
        location.href = 'userSettings.html';
    });
}

//-----------------------------------------------------------------------------------------
export function adminPicIfLoggedIn() {
    const img = document.getElementById("smallPic");
    if (!img) return;

    const token = localStorage.getItem("adminToken");
    const thumb = localStorage.getItem("adminThumb");

    if (!token || !thumb) {
        img.hidden = true;
        return;
    }

    img.src = thumb;       
    img.alt = "Admin picture";
    img.hidden = false;
}
