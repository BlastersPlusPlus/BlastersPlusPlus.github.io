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

        let image = document.createElement('img');
        let imageNumber = element.iconRow*16 + element.iconCol + 1;
        image.src = '/images/itemIcons/item_1'+imageNumber.toLocaleString(undefined,{minimumIntegerDigits:3})+'.xi.00.png';
        gridItem.appendChild(image);
        image.loading = 'lazy';

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
    /*history.replaceState(null, null, '#'+equipment.name.replace(/\s/g, ''));
    console.log(document.getElementById(location.hash.replace('#','')).getBoundingClientRect().top);

    document.getElementById('equipmentInfo').className = equipment.isLegend ? 'legend' : (equipment.isRare ? 'rare' : 'normal');

    document.getElementById('equipmentInfoTitle').className = equipment.number === '-' ? 'noNumber' : '';
    document.getElementById('equipmentNumber').innerText = '#'+equipment.number.toLocaleString(undefined, {minimumIntegerDigits: 3});
    document.getElementById('equipmentInfoName').innerText = equipment.name;

    let medal = document.getElementById("equipmentMedal");
    medal.classList.add("loading");
    medal.src = "/images/equipmentMedalsLarge/"+equipment.largeMedal+".png";
    medal.alt = "Yo-kai "+equipment.name+"'s Medal";

    let rankIcon = document.getElementById("equipmentInfoRankIcon");
    rankIcon.classList.add('loading');
    rankIcon.src = "/images/rankIcons/all_text_rank01_"+equipment.rank.toLowerCase()+".png";
    rankIcon.alt = equipment.rank+" Rank";

    document.getElementById('equipmentInfoRank').textContent = equipment.rank+" Rank";

    let roleIcon = document.getElementById("equipmentInfoRoleIcon");
    roleIcon.classList.add('loading');
    roleIcon.src = "/images/roleText/"+equipment.role+".png";
    roleIcon.alt = equipment.role+" Role";

    document.getElementById('equipmentInfoRole').textContent = equipment.role;

    let tribeIcon = document.getElementById('equipmentInfoTribeIcon');
    tribeIcon.classList.add('loading');
    tribeIcon.src = "/images/tribeIcons/"+equipment.tribe+".png";
    tribeIcon.alt = equipment.tribe+" Tribe";

    document.getElementById('equipmentInfoTribe').textContent = equipment.tribe;

    let bio = document.getElementById("medalliumBio");
    bio.className = equipment.bio === "" ? 'noBio' : '';
    bio.innerText = equipment.bio;

    let strongAtt = document.getElementById('strongElement')
    strongAtt.classList.add('loading');
    strongAtt.src = "/images/attributeIcons/attribute"+equipment.strongTo+".png"
    strongAtt.alt = equipment.strongTo+" Attribute";
    strongAtt.title = equipment.strongTo+" Attribute";

    let weakAtt = document.getElementById('weakElement')
    weakAtt.classList.add('loading');
    weakAtt.src = "/images/attributeIcons/attribute"+equipment.weakTo+".png"
    weakAtt.alt = equipment.weakTo+" Attribute";
    weakAtt.title = equipment.weakTo+" Attribute";

    document.getElementById('equipmentHP').innerText = equipment.hp;
    document.getElementById('equipmentSTR').innerText = equipment.str;
    document.getElementById('equipmentSPR').innerText = equipment.spr;
    document.getElementById('equipmentDEF').innerText = equipment.def;
    document.getElementById('equipmentSPD').innerText = equipment.spd;
    document.getElementById('skillName').innerText = equipment.skill.name;
    document.getElementById('skillDescription').innerText = equipment.skill.effect;

    document.getElementById('AMoveIcon').src = "/images/moveIcons/image"+equipment.moves[0].icon+".png"
    document.getElementById('AMoveText').innerText = equipment.moves[0].name;
    document.getElementById('XMoveIcon').src = "/images/moveIcons/image"+equipment.moves[1].icon+".png"
    document.getElementById('XMoveText').innerText = equipment.moves[1].name;
    document.getElementById('YMoveIcon').src = "/images/moveIcons/image"+equipment.moves[2].icon+".png"
    document.getElementById('YMoveText').innerText = equipment.moves[2].name;
    document.getElementById('LearnMove1Icon').src = "/images/moveIcons/image"+equipment.moves[3].icon+".png"
    document.getElementById('LearnMove1Text').innerText = equipment.moves[3].name;
    if (equipment.moves[4].name === 'No Move') document.getElementById('move4').classList.add('noMove')
    else document.getElementById('move4').classList.remove('noMove');
    document.getElementById('LearnMove2Icon').src = "/images/moveIcons/image"+equipment.moves[4].icon+".png"
    document.getElementById('LearnMove2Text').innerText = equipment.moves[4].name;

    document.getElementById('soultimateMoveName').textContent = equipment.soultimate.name;
    let soultDesc = document.getElementById('soultimateMoveDescription')
    soultDesc.textContent = equipment.soultimate.description;
    if(equipment.soultimate.description === "") soultDesc.classList.add('empty')
    else soultDesc.classList.remove('empty');
    document.getElementById('soultimateMoveData').className = equipment.soultimate.class;*/
    //document.getElementById('soultimateMovePower').textContent = equipment.soultimate.power.replaceAll(/\s*\+\s*/g,"/");
    //document.getElementById('soultimateMoveClass').textContent = equipment.soultimate.class;
    //document.getElementById('soultimateMoveCharge').textContent = equipment.soultimate.gauge;
    //document.getElementById('soultimateMoveCritRate').textContent = equipment.soultimate.critRate;
    //document.getElementById('soultimateMoveScaling').textContent = equipment.soultimate.scaling.replaceAll(/\s*\|\s*/g,"/");
    //document.getElementById('soultimateMoveAttribute').textContent = equipment.soultimate.attribute.replaceAll(/\s*\|\s*/g,"/");


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