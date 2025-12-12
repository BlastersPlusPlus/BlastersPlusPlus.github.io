let data, equipmentCache = {};

document.addEventListener('DOMContentLoaded', async () => {
    data = await fetch('/data-sources/equipment/equipment.json').then(response => response.json());
    let main = document.querySelector('main');
    data.forEach(element => {
        let gridItem = document.createElement('button');
        gridItem.classList.add("gridItem");
        let name = document.createElement('p');
        name.innerHTML = element.name ?? ''; //.replace(/(.+?)(\s|$)/g, '<nobr>$1</nobr>$2');
        name.classList.add('name');
        gridItem.appendChild(name);
        gridItem.classList.add('rank'+element.rank);

        if(element.hidden) gridItem.classList.add('hidden');

        let imageContainer = document.createElement('div');
        imageContainer.classList.add('equipmentIconContainer');
        if(element.rank === 6) imageContainer.classList.add('glade3');

        let image = document.createElement('img');
        let imageNumber = element.iconRow*16 + element.iconCol + 1;
        image.src = '/images/itemIcons/item_1_'+ element.iconRow + '_' + element.iconCol +'.png';
        image.loading = 'lazy';

        imageContainer.appendChild(image);

        gridItem.appendChild(imageContainer);

        if(element.name) gridItem.setAttribute('id',element.name.replace(/\s/g, ''));

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
    history.replaceState(null, null, '#'+(equipment.name ? equipment.name.replace(/\s/g, '') : equipment.id.replace(/\s/g, '')));

    document.getElementById('equipmentInfo').className = 'rank'+equipment.rank;
    document.getElementById('equipmentName').innerText = equipment.name ?? '';

    let icon = document.getElementById("equipmentIcon");
    icon.classList.add("loading");
    let imageNumber = equipment.iconRow*16 + equipment.iconCol + 1;
    icon.src = '/images/itemIcons/item_1_'+equipment.iconRow + '_' + equipment.iconCol +'.png';
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

    let equipmentInfoContainer = document.getElementById('equipmentInfoPopupContainer');
    equipmentInfoContainer.equipmentId = equipment.id;
    equipmentInfoContainer.scrollTop = 0;
    equipmentInfoContainer.showModal();
    equipmentInfoContainer.classList.remove('hasDetails')
    equipmentInfoContainer.classList.add('open');

    showEquipmentDetails(equipment.id).then(function(){equipmentInfoContainer.classList.add('hasDetails')});
}

async function showEquipmentDetails(id) {
    console.log(equipmentCache[id]);
    let equipment;
    if(!equipmentCache[id]) {
        equipment = await fetch('/data-sources/equipment/'+id.replace(/\s*/g,'')+'.json').then(response => response.json());
        equipmentCache[equipment.id] = equipment;
    }
    else equipment = equipmentCache[id];
    console.log(equipment);

    document.getElementById('skillDescription').innerText = equipment.skill ?? '';

    let createSection = document.getElementById('createSection');
    if(equipment.createData?.length) {
        createSection.classList.remove('noContent')
        createSection.innerHTML = "<h2>Create</h2>"

        equipment.createData.forEach((data) => {
            let materialData = document.createElement("div");
            materialData.classList.add('materialData');
            createSection.appendChild(materialData);

            data.materials.forEach((material) => {materialData.appendChild(generateMaterialElement(material));});

            let oniOrbs = document.createElement('p');
            oniOrbs.classList.add('oniOrbs');
            oniOrbs.textContent = 'Oni Orbs x'+data.oniOrbs;
            createSection.appendChild(oniOrbs);
        })

    } else(createSection.classList.add('noContent'))

    let strengthenSection = document.getElementById('strengthenSection');
    if(equipment.upgradeData?.length) {
        strengthenSection.classList.remove('noContent')
        strengthenSection.innerHTML = "<h2>Strengthen</h2>"

        equipment.upgradeData.forEach((data) => {
            let baseItem = document.createElement("div");
            baseItem.classList.add('baseItem');
            let anchor = document.createElement("a");
            anchor.href = '#'+data.baseItem?.name.replace(/\s/g, '');
            anchor.innerText = data.baseItem?.name;
            baseItem.appendChild(anchor);
            let iconContainer = document.createElement("div");
            iconContainer.classList.add('iconContainer');
            if(data.baseItem.rank === 6) iconContainer.classList.add('glade3');
            anchor.appendChild(iconContainer);
            let image = document.createElement("img");
            let imageNumber = data.baseItem.iconRow*16 + data.baseItem.iconCol + 1;
            image.src = '/images/itemIcons/item_1_'+ data.baseItem?.iconRow + '_' + data.baseItem?.iconCol +'.png';
            iconContainer.appendChild(image);

            strengthenSection.appendChild(baseItem);



            let materialData = document.createElement("div");
            materialData.classList.add('materialData');
            strengthenSection.appendChild(materialData);

            data.materials.forEach((material) => {materialData.appendChild(generateMaterialElement(material));});


            let oniOrbs = document.createElement('p');
            oniOrbs.classList.add('oniOrbs');
            oniOrbs.textContent = 'Oni Orbs x'+data.oniOrbs;
            strengthenSection.appendChild(oniOrbs);
        })
    } else(strengthenSection.classList.add('noContent'))

    let upgradesElement = document.getElementById('upgrades');
    if(equipment.upgradesInto?.length) {
        upgradesElement.classList.remove('noContent')
        upgradesElement.innerHTML = "<h2>Upgrades</h2>"

        equipment.upgradesInto.forEach((data) => {
            let item = document.createElement("div");
            item.classList.add('baseItem');
            let anchor = document.createElement("a");
            anchor.href = '#'+data.name?.replace(/\s/g, '');
            anchor.innerText = data.name;
            item.appendChild(anchor);
            let iconContainer = document.createElement("div");
            iconContainer.classList.add('iconContainer');
            if(data.rank === 6) iconContainer.classList.add('glade3');
            anchor.appendChild(iconContainer);
            let image = document.createElement("img");
            let imageNumber = data.iconRow*16 + data.iconCol + 1;
            image.src = '/images/itemIcons/item_1_'+ data.iconRow + '_' + data.iconCol +'.png';
            iconContainer.appendChild(image);

            upgradesElement.appendChild(item);
        })
    } else(upgradesElement.classList.add('noContent'))
}

function closeInfoPopup() {
    let equipmentInfoContainer = document.getElementById('equipmentInfoPopupContainer');
    equipmentInfoContainer.addEventListener('transitionend', function () {
        this.close();
    },{once:true});
    equipmentInfoContainer.classList.remove('open');
    history.replaceState(null,null,location.pathname+location.search);
}

function generateMaterialElement(material) {
    /*<div class="material">
        <div class="hexagonImageContainer">
            <div class="hexagonBorder"></div>
            <div class="hexagonBackground"></div>
            <div class="iconContainer glade1">
                <img class="materialIcon" loading="lazy" id="AMoveIcon"
                     alt="Attack"
                     src="../images/itemIcons/item_1048.xi.00.png" aria-label="hidden"
                     onload="this.classList.remove('loading')"
                     onerror="this.classList.remove('loading')">
            </div>
        </div>
        <div class="materialNameContainer">
            <div class="materialName" id="material1Text"><p>Sexy time <span class="materialQuantity">x10</span></p></div>
        </div>
    </div>*/

    let materialElement = document.createElement('div');
    materialElement.classList.add('material');

    let hexagonImageContainer = document.createElement('div');
    hexagonImageContainer.classList.add('hexagonImageContainer');
    materialElement.appendChild(hexagonImageContainer);

    let hexagonBorder = document.createElement('div')
    hexagonBorder.classList.add('hexagonBorder');
    hexagonImageContainer.appendChild(hexagonBorder);

    let hexagonBackground = document.createElement('div')
    hexagonBackground.classList.add('hexagonBackground');
    hexagonImageContainer.appendChild(hexagonBackground);

    let iconContainer = document.createElement('div');
    iconContainer.classList.add('iconContainer');
    if(material.glade) iconContainer.classList.add('glade'+material.glade);
    hexagonImageContainer.appendChild(iconContainer);

    let materialIcon = document.createElement('img');
    materialIcon.classList.add('materialIcon');
    materialIcon.alt = material.name;

    let imageNumber = material.iconRow*16 + material.iconCol + 1;
    materialIcon.src = '/images/itemIcons/item_'+(material.type === 10 || material.type === 20 || material.type ===60 ? '0' : '1')+'_'+ material.iconRow + '_' + material.iconCol +'.png';
    iconContainer.appendChild(materialIcon);


    let materialNameContainer = document.createElement('div');
    materialNameContainer.classList.add('materialNameContainer');
    materialElement.appendChild(materialNameContainer);

    let materialName = document.createElement('div');
    materialName.classList.add('materialName');
    materialNameContainer.appendChild(materialName);
    let materialNameElement = document.createElement('p');
    materialNameElement.innerText = material.name+' ';

    let span = document.createElement('span');
    span.classList.add('materialQuantity');
    span.innerText = 'x'+material.quantity;
    materialNameElement.appendChild(span);

    materialName.appendChild(materialNameElement);

    return materialElement;
}