document.addEventListener('DOMContentLoaded', async () => {
    let data = await fetch('/dataSources/Equipment.json').then(response => response.json());
    let main = document.querySelector('main');
    data.forEach(element => {
        let gridItem = document.createElement('button');
        gridItem.classList.add("gridItem");
        let name = document.createElement('p');
        name.innerHTML = element.name //.replace(/(.+?)(\s|$)/g, '<nobr>$1</nobr>$2');
        name.classList.add('name');
        gridItem.appendChild(name);
        gridItem.classList.add('rank'+element.rank);

        let imageContainer = document.createElement('div');
        imageContainer.classList.add('equipmentIconContainer');
        if(element.rank === 6) imageContainer.classList.add('glade3');

        let image = document.createElement('img');
        let imageNumber = element.iconRow*16 + element.iconCol + 1;
        image.src = '/images/itemIcons/item_1'+imageNumber.toLocaleString(undefined,{minimumIntegerDigits:3})+'.xi.00.png';
        image.loading = 'lazy';

        imageContainer.appendChild(image);

        gridItem.appendChild(imageContainer);

        gridItem.setAttribute('id',element.name.replace(/\s/g, ''));

        main.appendChild(gridItem);
        gridItem.equipment = element;

        gridItem.onclick = function(){openInfoPopup(this.equipment)};
    })

    console.log(location.hash);
    let equipment;
    if(location.hash) equipment = document.getElementById(location.hash.replace('#',''))?.equipment;
    console.log(equipment);
    if(equipment) openInfoPopup(equipment);
})

window.addEventListener('hashchange', () => {
    console.log(location.hash);
    let equipmentInfoContainer = document.getElementById('equipmentInfoPopupContainer');
    if(!location.hash) {equipmentInfoContainer.className = 'closed'; return;}

    let equipment = document.getElementById(location.hash.replace('#',''))?.equipment;
    if(equipment && (equipmentInfoContainer.equipmentId !== equipment.id || equipmentInfoContainer.className!=='open')) {openInfoPopup(equipment);}

})

document.addEventListener('keydown', function(e){
        let equipmentInfoContainer = document.getElementById('equipmentInfoPopupContainer');
        if(e.code === 'Escape' && equipmentInfoContainer.classList.contains('open')){
            closeInfoPopup();
        }
})

function openInfoPopup(equipment) {
    history.replaceState(null, null, '#'+equipment.name.replace(/\s/g, ''));

    document.getElementById('equipmentInfo').className = 'rank'+equipment.rank;

    document.getElementById('equipmentName').innerText = equipment.name;

    let icon = document.getElementById("equipmentIcon");
    icon.classList.add("loading");
    let imageNumber = equipment.iconRow*16 + equipment.iconCol + 1;
    icon.src = '/images/itemIcons/item_1'+imageNumber.toLocaleString(undefined,{minimumIntegerDigits:3})+'.xi.00.png';
    icon.alt = equipment.name+"'s Icon";
    icon.parentElement.className = equipment.rank === 6 ? 'glade3' : '';

    let rank = document.getElementById('rank');
    rank.textContent = 'Rank '+equipment.rank;
    rank.className = 'rank'+equipment.rank;

    let bio = document.getElementById("equipmentDescription");
    bio.innerText = equipment.description;

    let hpElement = document.getElementById('equipmentHP');
    hpElement.innerText = equipment.hp; hpElement.parentElement.style.display = equipment.hp !== 0 ? '' : 'none';

    let strElement = document.getElementById('equipmentSTR');
    strElement.innerText = equipment.str; strElement.parentElement.style.display = equipment.str !== 0 ? '' : 'none';

    let sprElement = document.getElementById('equipmentSPR');
    sprElement.innerText = equipment.spr; sprElement.parentElement.style.display = equipment.spr !== 0 ? '' : 'none';

    let defElement = document.getElementById('equipmentDEF');
    defElement.innerText = equipment.def; defElement.parentElement.style.display = equipment.def !== 0 ? '' : 'none';

    document.getElementById('skillDescription').innerText = equipment.skill;


    /*let screenCover = document.getElementById("screenCover");
    screenCover.equipmentId = equipment.id;
    screenCover.scrollTop = 0;
    screenCover.className = 'open';
    screenCover.focus();*/

    let equipmentInfoContainer = document.getElementById('equipmentInfoPopupContainer');
    equipmentInfoContainer.equipmentId = equipment.id;
    equipmentInfoContainer.scrollTop = 0;
    equipmentInfoContainer.showModal();
    equipmentInfoContainer.classList.add('open');
}

function closeInfoPopup() {
    let equipmentInfoContainer = document.getElementById('equipmentInfoPopupContainer');
    equipmentInfoContainer.addEventListener('transitionend', function () {
        this.close();
    },{once:true});
    equipmentInfoContainer.classList.remove('open');
    history.replaceState(null, null, '#');
}