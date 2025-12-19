let data, yokaiCache = {}, yokaiHashes = {};
let tribeNumbers = {
    "Brave": 1,
    "Mysterious": 2,
    "Tough": 3,
    "Charming": 4,
    "Heartful": 5,
    "Shady": 6,
    "Eerie": 7,
    "Slippery": 8,
    "Wicked": 9,
    "Enma": 9
}

document.addEventListener('DOMContentLoaded', async () => {
    let data = await fetch('/data-sources/yo-kai-info/yo-kai-info.json').then(response => response.json());
    let main = document.querySelector('main');
    data.forEach(element => {
        yokaiCache[element.id] = element;

        let yokaiHash = element.costumeName ? element.name?.replace(/\s/g, '') + "(" + element.costumeName.replace(/\s/g, '') + ')' :
            element.name?.replace(/\s/g, '') ?? element.id?.replace(/\s/g, '') ?? 'Yo-kai'+element.number;

        if(element.costumeName && !yokaiHashes[element.name?.replace(/\s/g, '')]) {
            yokaiHashes[yokaiHash] = element;
            yokaiHash = element.name?.replace(/\s/g, '');
        }
        yokaiHashes[yokaiHash] = element;

        if(element.costumeName && element.hidden) return;

        let gridItem = document.createElement('button');
        gridItem.classList.add("gridItem");

        let name = document.createElement('p');
        if(element.costumeName && yokaiHashes[element.name?.replace(/\s/g, '')] != element) {
            name.innerHTML = element.name + " ("+element.costumeName+")";
        } else {
            name.innerHTML = element.name ?? '';
        }
        name.classList.add('name');
        gridItem.appendChild(name);

        if(element.appearsInMedallium && element.number) {
            let number = document.createElement('div');
            number.innerText = '#'+element.number.toLocaleString(undefined, {minimumIntegerDigits: 3});
            number.classList.add('number');
            gridItem.appendChild(number);
        }

        if(element.modelInfo) {
            let medalContainer = document.createElement('div');
            medalContainer.classList.add('yokaiMedal');


            let medalFaceIcon = document.createElement('img');
            medalFaceIcon.classList.add('medalFaceIcon');
            medalFaceIcon.src = '/images/faceIcon/'+element.modelInfo+'.xi.00.png';
            medalFaceIcon.loading = 'lazy';

            let medalBorder = document.createElement('img');
            medalBorder.classList.add('medalBorder');
            medalBorder.src = "/images/medalParts/y_medal_"+ (element.isLegend?"lege":element.isRare?"rare":"nml") + "0" + tribeNumbers[element.tribe] +".xi.00.png";
            medalBorder.alt = tribeNumbers[element.tribe]+" Tribe "+(element.isLegend?"Legendary":element.isRare?"Rare":"Normal")+" medal border";

            medalFaceIcon.onload = function () {
                this.parentElement.classList.add("loaded");
            }


            medalContainer.appendChild(document.getElementById("yokaiInfoMedalBackground")?.cloneNode(true));
            medalContainer.appendChild(medalFaceIcon);
            medalContainer.appendChild(medalBorder);

            gridItem.appendChild(medalContainer);
        }

        gridItem.setAttribute('id',yokaiHash);

        gridItem.classList.add(element.tribe);

        if(element.hidden) {
            console.log(element);
            console.log(localStorage);
        }
        if(element.hidden && (localStorage.getItem(element.id?.replace(/\s/g, '')) ?? "hidden") === "hidden")
            gridItem.classList.add('hidden');

        gridItem.yokai = element;

        main.appendChild(gridItem);


        gridItem.onclick = function(){openInfoPopup(this.yokai)};
    })
    console.log(yokaiHashes)

    console.log(location.hash);
    let foundYokai;
    if(location.hash) foundYokai = document.getElementById(location.hash.replace('#',''))?.yokai ?? yokaiHashes[location.hash.replace('#','')];
    console.log(foundYokai);
    if(foundYokai) openInfoPopup(foundYokai);
})

window.addEventListener('hashchange', () => {
    console.log(location.hash);
    let yokaiInfoContainer = document.getElementById('yokaiInfoPopupContainer');
    if(!location.hash) {yokaiInfoContainer.className = 'closed'; return;}

    let yokai = document.getElementById(location.hash.replace('#',''))?.yokai ?? yokaiHashes[location.hash.replace('#','')];
    if(yokai && (yokaiInfoContainer.yokaiId !== yokai.id || yokaiInfoContainer.className!=='open')) {openInfoPopup(yokai);}

})

document.addEventListener('keydown', function(e){
        let yokaiInfoContainer = document.getElementById('yokaiInfoPopupContainer');
        if(e.code === 'Escape' && yokaiInfoContainer.classList.contains('open')){
            closeInfoPopup();
        }
})

function openInfoPopup(yokai) {
    let yokaiHash = yokai.costumeName ? yokai.name?.replace(/\s/g, '') + "(" + yokai.costumeName.replace(/\s/g, '') + ')' :
        yokai.name?.replace(/\s/g, '') ?? yokai.id?.replace(/\s/g, '') ?? 'Yo-kai'+yokai.number;
    if(yokai.costumeName && yokaiHashes[yokaiHash] == yokaiHashes[yokai.name?.replace(/\s/g, '')]) {
        yokaiHash = yokai.name?.replace(/\s/g, '');
    }
    history.replaceState(null, null, '#'+yokaiHash);
    if(!yokai) return;
    console.log(yokai);

    if(yokai.hidden && !yokai.costumeName) {
        let DOMElement = document.getElementById(yokai.name?.replace(/\s/g, '')) ??
            document.getElementById(yokai.id?.replace(/\s/g, '')) ?? document.getElementById('Yo-kai'+yokai.number);

        DOMElement?.classList?.remove('hidden');

        localStorage.setItem(yokai.id?.replace(/\s/g, ''), "not-hidden");
    }

    document.getElementById('yokaiInfo').className = yokai.isLegend ? 'legend' : (yokai.isRare ? 'rare' : 'normal');
    document.getElementById('yokaiInfoTitle').className = yokai.appearsInMedallium && yokai.number ? '' : 'noNumber';
    document.getElementById('yokaiNumber').innerText = '#'+yokai.number.toLocaleString(undefined, {minimumIntegerDigits: 3});
    document.getElementById('yokaiInfoName').innerText = yokai.name;

    //let medal = document.getElementById("yokaiMedal");
    //medal.classList.add("loading");
    //medal.src = "/images/yokaiMedalsLarge/"+yokai.largeMedal+".png";
    //medal.alt = "Yo-kai "+yokai.name+"'s Medal";

    let faceIcon = document.getElementById('yokaiInfoMedalFaceIcon');
    faceIcon.classList.add('loading');
    faceIcon.src = "/images/faceIcon/"+yokai.modelInfo+".xi.00.png"
    faceIcon.alt = "Yo-kai "+yokai.name+"'s face icon";

    let medalBorder = document.getElementById('yokaiInfoMedalBorder');

    medalBorder.src = "/images/medalParts/y_medal_"+ (yokai.isLegend?"lege":yokai.isRare?"rare":"nml") + "0" + tribeNumbers[yokai.tribe] +".xi.00.png";
    medalBorder.alt = tribeNumbers[yokai.tribe]+" Tribe "+(yokai.isLegend?"Legendary":yokai.isRare?"Rare":"Normal")+" medal border";


    let costumeSelector = document.getElementById('costumeSelection');
    costumeSelector.classList.toggle('noCostumes',!yokai.costumes?.length);
    while(costumeSelector.hasChildNodes()) costumeSelector.removeChild(costumeSelector.firstChild);
    for(let i=0; i<yokai.costumes?.length; i++){
        let option = document.createElement("option");
        option.innerText = yokai.costumes[i].name;
        option.value = yokai.costumes[i].charaParamId;
        option.selected = yokai.costumes[i].charaParamId === yokai.id;
        costumeSelector.appendChild(option);
    }


    let rankIcon = document.getElementById("yokaiInfoRankIcon");
    rankIcon.classList.add('loading');
    rankIcon.src = "/images/rankIcons/all_text_rank01_"+yokai.rank.toLowerCase()+".png";
    rankIcon.alt = yokai.rank+" Rank";

    document.getElementById('yokaiInfoRank').textContent = yokai.rank+" Rank";

    let roleIcon = document.getElementById("yokaiInfoRoleIcon");
    roleIcon.classList.add('loading');
    roleIcon.src = "/images/roleText/"+yokai.role+".png";
    roleIcon.alt = yokai.role+" Role";

    document.getElementById('yokaiInfoRole').textContent = yokai.role;

    let tribeIcon = document.getElementById('yokaiInfoTribeIcon');
    tribeIcon.classList.add('loading');
    tribeIcon.src = "/images/tribeIcons/"+yokai.tribe+".png";
    tribeIcon.alt = yokai.tribe+" Tribe";

    document.getElementById('yokaiInfoTribe').textContent = yokai.tribe;

    document.getElementById('yokaiHP').innerText = yokai.hp;
    document.getElementById('yokaiSTR').innerText = yokai.str;
    document.getElementById('yokaiSPR').innerText = yokai.spr;
    document.getElementById('yokaiDEF').innerText = yokai.def;
    document.getElementById('yokaiSPD').innerText = yokai.spd;

    let bio = document.getElementById("medalliumBio");
    bio.classList.toggle('noBio',!(yokai.bio && yokai.bio.length))
    bio.innerText = yokai.bio;

    let strongAtt = document.getElementById('strongElement')
    strongAtt.classList.add('loading');
    strongAtt.src = "/images/attributeIcons/attribute"+yokai.strongTo+".png"
    strongAtt.alt = yokai.strongTo+" Attribute";
    strongAtt.title = yokai.strongTo+" Attribute";

    let weakAtt = document.getElementById('weakElement')
    weakAtt.classList.add('loading');
    weakAtt.src = "/images/attributeIcons/attribute"+yokai.weakTo+".png"
    weakAtt.alt = yokai.weakTo+" Attribute";
    weakAtt.title = yokai.weakTo+" Attribute";

    document.getElementById('skillName').innerText = yokai.skill?.name ?? '';
    document.getElementById('skillDescription').innerText = yokai.skill?.effect ?? '';

    for(let i=0; i<5; i++) {
        if (!yokai.moves || !yokai.moves[i] || yokai.moves[i]?.name === 'No Move') {
            document.getElementById('move'+i).classList.add('noMove');
            document.getElementById('move'+i+'Text').innerText = '';
            continue;
        }
        document.getElementById('move'+i).classList.remove('noMove');
        document.getElementById('move'+i+'Icon').src = "/images/moveIcons/image"+yokai.moves[i]?.icon+".png"
        document.getElementById('move'+i+'Text').innerText = yokai.moves[i]?.name;
    }

    document.getElementById('soultimateMoveName').textContent = yokai.soultimate?.name;
    let soultDesc = document.getElementById('soultimateMoveDescription')
    soultDesc.textContent = yokai.soultimate?.description;
    if(yokai.soultimate.description === "") soultDesc.classList.add('empty')
    else soultDesc.classList.remove('empty');
    document.getElementById('soultimateMoveData').className = yokai.soultimate?.class;
    document.getElementById('soultimateMovePower').textContent = yokai.soultimate?.power?.replaceAll(/\s*\+\s*/g,"/");
    document.getElementById('soultimateMoveClass').textContent = yokai.soultimate?.class;
    document.getElementById('soultimateMoveCharge').textContent = yokai.soultimate?.gauge;
    document.getElementById('soultimateMoveCritRate').textContent = yokai.soultimate?.critRate;
    document.getElementById('soultimateMoveScaling').textContent = yokai.soultimate?.scaling?.replaceAll(/\s*\|\s*/g,"/");
    document.getElementById('soultimateMoveAttribute').textContent = yokai.soultimate?.attribute?.replaceAll(/\s*\|\s*/g,"/");
    let soultInspirit = document.getElementById('soultimateInspirit');
    soultInspirit.textContent = yokai.soultimate?.inspiritEffects;
    if(yokai.soultimate?.inspiritEffects === "") soultInspirit.classList.add('empty')
    else soultInspirit.classList.remove('empty');


    /*let screenCover = document.getElementById("screenCover");
    screenCover.yokaiId = yokai.id;
    screenCover.scrollTop = 0;
    screenCover.className = 'open';
    screenCover.focus();*/

    let yokaiInfoContainer = document.getElementById('yokaiInfoPopupContainer');
    yokaiInfoContainer.yokaiId = yokai.id;
    if(yokaiInfoContainer.className!=='open') yokaiInfoContainer.scrollTop = 0;
    yokaiInfoContainer.showModal();

    let yokaiInfoElement = document.getElementById('yokaiInfo');
    //yokaiInfoElement.classList.remove('hasDetails');
    yokaiInfoContainer.classList.add('open');

}

async function showYokaiDetails(id) {
    console.log(yokaiCache[id]);
    let yokai;
    if(!yokaiCache[id]) {
        yokai = await fetch('/data-sources/yo-kai-info/'+id.replace(/\s*/g,'')+'.json').then(response => response.json());
        yokaiCache[yokai.id] = yokai;
    }
    else yokai = yokaiCache[id];
    console.log(yokai);


}

function closeInfoPopup() {
    let yokaiInfoContainer = document.getElementById('yokaiInfoPopupContainer');
    yokaiInfoContainer.addEventListener('transitionend', function () {
        this.close();
    },{once:true});
    yokaiInfoContainer.classList.remove('open');
    history.replaceState(null,null,location.pathname+location.search);
}

/*let pusi = [];

let rankValues = {'E': 0, 'D':1, 'C':2, 'B':3, 'A':4, 'S':5}

function sortNumber(yokai1, yokai2, direction = 1) {return ((yokai1.number > yokai2.number ? 1 : -1) + (yokai1.fileIndex > yokai2.fileIndex ? 0.5 : -0.5))*direction}
function sortName(yokai1, yokai2, direction = 1) {return yokai1.name.localeCompare(yokai2) * direction;}
function sortHP(yokai1, yokai2, direction = 1) {return (yokai1.hp - yokai2.hp)*direction;}
function sortSTR(yokai1, yokai2, direction = 1) {return (yokai1.str - yokai2.str)*direction;}
function sortSPR(yokai1, yokai2, direction = 1) {return (yokai1.spr - yokai2.spr)*direction;}
function sortDEF(yokai1, yokai2, direction = 1) {return (yokai1.def - yokai2.def)*direction;}*/

