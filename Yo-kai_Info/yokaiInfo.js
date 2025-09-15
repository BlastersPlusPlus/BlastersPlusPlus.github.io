let data;

document.addEventListener('DOMContentLoaded', async () => {
    let data = await fetch('/dataSources/Yo-kaiInfo.json').then(response => response.json());
    let main = document.querySelector('main');
    data.forEach(element => {
        let gridItem = document.createElement('button');
        gridItem.classList.add("gridItem");
        let name = document.createElement('p');
        name.innerHTML = element.name //.replace(/(.+?)(\s|$)/g, '<nobr>$1</nobr>$2');
        name.classList.add('name');
        gridItem.appendChild(name);

        if(element.number !== "-") {
            let number = document.createElement('div');
            number.innerText = '#'+element.number.toLocaleString(undefined, {minimumIntegerDigits: 3});
            number.classList.add('number');
            gridItem.appendChild(number);
        }

        let image = document.createElement('img');
        image.src = '/images/yokaiMedalsSmall/image'+element.smallMedal+'.png';
        gridItem.appendChild(image);
        image.loading = 'lazy';

        gridItem.setAttribute('id',element.name.replace(/\s/g, ''));
        gridItem.classList.add(element.tribe);

        main.appendChild(gridItem);
        gridItem.yokai = element;

        gridItem.onclick = function(){openInfoPopup(this.yokai)};
    })

    console.log(location.hash);
    let yokai;
    if(location.hash) yokai = document.getElementById(location.hash.replace('#',''))?.yokai;
    console.log(yokai);
    if(yokai) openInfoPopup(yokai);
})

window.addEventListener('hashchange', () => {
    console.log(location.hash);
    let yokaiInfoContainer = document.getElementById('yokaiInfoPopupContainer');
    if(!location.hash) {yokaiInfoContainer.className = 'closed'; return;}

    let yokai = document.getElementById(location.hash.replace('#',''))?.yokai;
    if(yokai && (yokaiInfoContainer.yokaiId !== yokai.id || yokaiInfoContainer.className!=='open')) {openInfoPopup(yokai);}

})

document.addEventListener('keydown', function(e){
        let yokaiInfoContainer = document.getElementById('yokaiInfoPopupContainer');
        if(e.code === 'Escape' && yokaiInfoContainer.classList.contains('open')){
            closeInfoPopup();
        }
})

function openInfoPopup(yokai) {
    history.replaceState(null, null, '#'+yokai.name.replace(/\s/g, ''));
    console.log(document.getElementById(location.hash.replace('#','')).getBoundingClientRect().top);

    document.getElementById('yokaiInfo').className = yokai.isLegend ? 'legend' : (yokai.isRare ? 'rare' : 'normal');

    document.getElementById('yokaiInfoTitle').className = yokai.number === '-' ? 'noNumber' : '';
    document.getElementById('yokaiNumber').innerText = '#'+yokai.number.toLocaleString(undefined, {minimumIntegerDigits: 3});
    document.getElementById('yokaiInfoName').innerText = yokai.name;

    let medal = document.getElementById("yokaiMedal");
    medal.classList.add("loading");
    medal.src = "/images/yokaiMedalsLarge/"+yokai.largeMedal+".png";
    medal.alt = "Yo-kai "+yokai.name+"'s Medal";

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

    let bio = document.getElementById("medalliumBio");
    bio.className = yokai.bio === "" ? 'noBio' : '';
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
    weakAtt.title = yokai.weakTo+" Attribute";;

    document.getElementById('yokaiHP').innerText = yokai.hp;
    document.getElementById('yokaiSTR').innerText = yokai.str;
    document.getElementById('yokaiSPR').innerText = yokai.spr;
    document.getElementById('yokaiDEF').innerText = yokai.def;
    document.getElementById('yokaiSPD').innerText = yokai.spd;
    document.getElementById('skillName').innerText = yokai.skill.name;
    document.getElementById('skillDescription').innerText = yokai.skill.effect;

    document.getElementById('AMoveIcon').src = "/images/moveIcons/image"+yokai.moves[0].icon+".png"
    document.getElementById('AMoveText').innerText = yokai.moves[0].name;
    document.getElementById('XMoveIcon').src = "/images/moveIcons/image"+yokai.moves[1].icon+".png"
    document.getElementById('XMoveText').innerText = yokai.moves[1].name;
    document.getElementById('YMoveIcon').src = "/images/moveIcons/image"+yokai.moves[2].icon+".png"
    document.getElementById('YMoveText').innerText = yokai.moves[2].name;
    document.getElementById('LearnMove1Icon').src = "/images/moveIcons/image"+yokai.moves[3].icon+".png"
    document.getElementById('LearnMove1Text').innerText = yokai.moves[3].name;
    if (yokai.moves[4].name === 'No Move') document.getElementById('move4').classList.add('noMove')
    else document.getElementById('move4').classList.remove('noMove');
    document.getElementById('LearnMove2Icon').src = "/images/moveIcons/image"+yokai.moves[4].icon+".png"
    document.getElementById('LearnMove2Text').innerText = yokai.moves[4].name;

    document.getElementById('soultimateMoveName').textContent = yokai.soultimate.name;
    let soultDesc = document.getElementById('soultimateMoveDescription')
    soultDesc.textContent = yokai.soultimate.description;
    if(yokai.soultimate.description === "") soultDesc.classList.add('empty')
    else soultDesc.classList.remove('empty');
    document.getElementById('soultimateMoveData').className = yokai.soultimate.class;
    document.getElementById('soultimateMovePower').textContent = yokai.soultimate.power.replaceAll(/\s*\+\s*/g,"/");
    document.getElementById('soultimateMoveClass').textContent = yokai.soultimate.class;
    document.getElementById('soultimateMoveCharge').textContent = yokai.soultimate.gauge;
    document.getElementById('soultimateMoveCritRate').textContent = yokai.soultimate.critRate;
    document.getElementById('soultimateMoveScaling').textContent = yokai.soultimate.scaling.replaceAll(/\s*\|\s*/g,"/");
    document.getElementById('soultimateMoveAttribute').textContent = yokai.soultimate.attribute.replaceAll(/\s*\|\s*/g,"/");
    let soultInspirit = document.getElementById('soultimateInspirit');
    soultInspirit.textContent = yokai.soultimate.inspiritEffects;
    if(yokai.soultimate.inspiritEffects === "") soultInspirit.classList.add('empty')
    else soultInspirit.classList.remove('empty');


    /*let screenCover = document.getElementById("screenCover");
    screenCover.yokaiId = yokai.id;
    screenCover.scrollTop = 0;
    screenCover.className = 'open';
    screenCover.focus();*/

    let yokaiInfoContainer = document.getElementById('yokaiInfoPopupContainer');
    yokaiInfoContainer.yokaiId = yokai.id;
    yokaiInfoContainer.scrollTop = 0;
    yokaiInfoContainer.showModal();
    yokaiInfoContainer.classList.add('open');
}

function closeInfoPopup() {
    let yokaiInfoContainer = document.getElementById('yokaiInfoPopupContainer');
    yokaiInfoContainer.addEventListener('transitionend', function () {
        this.close();
    },{once:true});
    yokaiInfoContainer.classList.remove('open');
    history.replaceState(null, null, '#');
}

/*let pusi = [];

let rankValues = {'E': 0, 'D':1, 'C':2, 'B':3, 'A':4, 'S':5}

function sortNumber(yokai1, yokai2, direction = 1) {return ((yokai1.number > yokai2.number ? 1 : -1) + (yokai1.fileIndex > yokai2.fileIndex ? 0.5 : -0.5))*direction}
function sortName(yokai1, yokai2, direction = 1) {return yokai1.name.localeCompare(yokai2) * direction;}
function sortHP(yokai1, yokai2, direction = 1) {return (yokai1.hp - yokai2.hp)*direction;}
function sortSTR(yokai1, yokai2, direction = 1) {return (yokai1.str - yokai2.str)*direction;}
function sortSPR(yokai1, yokai2, direction = 1) {return (yokai1.spr - yokai2.spr)*direction;}
function sortDEF(yokai1, yokai2, direction = 1) {return (yokai1.def - yokai2.def)*direction;}*/

