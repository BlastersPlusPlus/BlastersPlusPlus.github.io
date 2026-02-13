let lastScrollTop = 0;
let delta = 5;
let header = document.querySelector('header');
let navbarHeight = header.getBoundingClientRect().height;

window.onscroll = hasScrolled;

function hasScrolled() {
    const st = this.scrollY;

    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;

    if(st < Math.min(navbarHeight, window.innerHeight*0.25)) {
        header.classList.remove('stuck')
    } else {
        header.classList.add('stuck')
    }

    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight || st < Math.min(navbarHeight, window.innerHeight*0.25)){
        // Scroll Down
        header.classList.remove('nav-down');
        header.classList.add('nav-up');
    } else {
        // Scroll Up
        if(st + window.innerHeight < parseInt(getComputedStyle(document.body).height)) {
            header.classList.remove('nav-up');
            header.classList.add('nav-down');
        }
    }

    lastScrollTop = st;
}


