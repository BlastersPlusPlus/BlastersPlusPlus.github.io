let bgType = localStorage.getItem("bgType") ?? "random";
let bgAnimate = localStorage.getItem("bgAnimate") ?? true;

console.log(bgAnimate);

if(bgAnimate === 'true') {
    document.documentElement.classList.add("animatedBG");
    document.getElementById("animateBG").checked = true;
} else {
    document.getElementById("animateBG").checked = false;
}

if(bgType !== "random") {
    document.documentElement.classList.add("bg"+bgType);
    document.getElementById("background").value = bgType;
    console.log('set BG');
} else {
    document.getElementById("background").value = "random";
    bgType = Math.floor(Math.random() * 14);
    bgType = (bgType - (bgType >= 4 ? 1 : 0)) + (bgType == 3 ? 'a' : bgType == 4 ? 'b' : '');
    document.documentElement.classList.add("bg"+bgType);
    console.log('random BG');
}

console.log(bgType);