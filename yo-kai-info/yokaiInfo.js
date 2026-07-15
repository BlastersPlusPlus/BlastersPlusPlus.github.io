let data, sortedData, yokaiCache = {}, yokaiHashes = {}, itemIcons, itemIds;
let descending = 1;

const tribeMedalNumbers = {
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
const tribeNumbers = {
    "Brave": 1,
    "Mysterious": 2,
    "Tough": 3,
    "Charming": 4,
    "Heartful": 5,
    "Shady": 6,
    "Eerie": 7,
    "Slippery": 8,
    "Wicked": 9,
    "Enma": 10
}
const rankNumbers = {
    "E": 0,
    "D": 1,
    "C": 2,
    "B": 3,
    "A": 4,
    "S": 5
}
const roleNumbers = {
    'Fighter': 1,
    'Tank': 2,
    'Healer': 3,
    'Ranger': 4
}
const speedNumbers = {
    'Fast': 2,
    'Normal': 1,
    'Slow': 0
}
const tierNumbers = {
    'F': 0,
    'E': 1,
    'D': 2,
    'C': 3,
    'B': 4,
    'A': 5,
    'S': 6,
    'S+': 7,
    'S++': 8
}
const sortFunctions = {
    'Medallium Number' : (a,b) => (0)*descending,
    'Name': (a,b) => ((a.searchName ?? a.name).localeCompare(b.searchName ?? b.name))*descending,
    'Rank': (a,b) => (rankNumbers[a.rank] - rankNumbers[b.rank])*descending,
    'Tribe': (a,b) => (tribeNumbers[a.tribe] - tribeNumbers[b.tribe])*descending,
    'Role': (a,b) => (roleNumbers[a.role] - roleNumbers[b.role])*descending,
    'HP': (a,b) => (a.hp - b.hp)*descending,
    'STR': (a,b) => (a.str - b.str)*descending,
    'SPR': (a,b) => (a.spr - b.spr)*descending,
    'DEF': (a,b) => (a.def - b.def)*descending,
    'SPD': (a,b) => (speedNumbers[a.spd] - speedNumbers[b.spd])*descending,
    'Stat total': (a,b) => ((a.hp + a.str + a.spr + a.def) - (b.hp + b.str + b.spr + b.def))*descending,
    'Tier': (a,b) => (tierNumbers[getTier(a.score)] - tierNumbers[getTier(b.score)])*descending
}

let itemIconsPromise, itemIDsPromise;



document.addEventListener('DOMContentLoaded', async () => {
    let minWaitTime = 500+(Math.random()**2)*2000;
    //console.log("Waiting for at least "+(minWaitTime/1000)+" seconds before data is loaded");
    let minWait = new Promise(resolve => setTimeout(resolve, minWaitTime));


    itemIconsPromise = fetch('/data-sources/item-icons.json').then(response => response.json()).then(value => itemIcons = value);
    itemIDsPromise = fetch('/data-sources/item-ids.json').then(response => response.json()).then(value => itemIds = value);
    data = await fetch('/data-sources/yo-kai-info.json').then(response => response.json());
    await minWait;

    let foundNames = new Map();
    let datalist = document.getElementById('search-options');
    data.forEach(item => {
        yokaiCache[item.id] = item;

        item.searchName =
            item.modelInfo === "y473010" ? item.name + ' (Blade)' :
            item.costumeName ? item.name + " (" + item.costumeName + ')' :
            item.isWhite ? 'White ' + item.name:
            item.name ?? item.id ?? 'Yo-kai '+item.number;

        let oldSearchName = item.searchName;

        if(foundNames.has(oldSearchName)) {
            if(!foundNames.has(oldSearchName + ' (' + item.role + ')')) item.searchName += ' (' + item.role + ')';
            else item.searchName += foundNames.get(oldSearchName);
        }

        foundNames.set(oldSearchName, (foundNames.get(oldSearchName) ?? 0) + 1);

        if(item.costumeName && !yokaiHashes[item.name?.replace(/\s/g, '')]) {
            yokaiHashes[item.searchName?.replace(/\s/g, '')] = item;
            item.searchName = item.name;
        }
        yokaiHashes[item.searchName?.replace(/\s/g, '')] = item;

        if(!item.hidden) {
            let option = document.createElement("option");
            option.value = item.searchName;
            datalist.appendChild(option);
        }
    })
    let AMovesSet = new Set(), AllMovesSet = new Set();

    let moveIcons = {};
    data.forEach(yokai => {
        moveIcons[yokai.moves[0]?.name] = yokai.moves[0]?.icon;
        AMovesSet.add(yokai.moves[0]?.name)

        for(let i=1; i<yokai.moves.length; i++) {
            moveIcons[yokai.moves[i]?.name] = yokai.moves[i]?.icon;
            AllMovesSet.add(yokai.moves[i]?.name)
        }
    })

    document.getElementById('AMoveFilter').addItems(AMovesSet.values().toArray().filter(moveName => moveName !== 'No Move').toSorted().map(moveName => {
        return {
            text: moveName,
            value: moveName,
            selected: true,
            html: (moveIcons[moveName] ? `<div class="inline-icon"><img src="/images/moveIcons/image${moveIcons[moveName]}.png"></div>` : '') + moveName
        }
    }));

    // Calculates the array several times. Otherwise, the object references would be the same and they'd break the selectors. This way they don't have to be cloned.
    for(let i=1; i<=4; i++) {
        document.getElementById('Move'+i+'Filter').addItems(AllMovesSet.values().toArray().filter(moveName => moveName !== 'No Move').toSorted().map(moveName => {
            return {
                text: moveName,
                value: moveName,
                selected: true,
                html: (moveIcons[moveName] ? `<div class="inline-icon"><img src="/images/moveIcons/image${moveIcons[moveName]}.png"></div>` : '') + moveName
            }
        }));
    }

    document.querySelectorAll("#search-options-container multi-select").forEach(element => element.addEventListener('change', generateGrid))

    //sortedData = data;
    document.getElementById('loadContainer').classList.add('closed');
    generateGrid()
    console.log(location.hash);
    let foundYokai;
    if(location.hash) foundYokai = document.getElementById(location.hash.replace('#',''))?.yokai ?? yokaiHashes[location.hash.replace('#','')];
    console.log(foundYokai);
    if(foundYokai) {
        openInfoPopup(foundYokai);
        let yokaiElement = document.getElementById(foundYokai.name);
        window.scrollBy(0,yokaiElement?.getBoundingClientRect()?.top ?? 0);
    }
})

function generateGrid() {
    let main = document.querySelector('main');

    let searchValue = normalizeString(document.getElementById('name-search')?.value?.toLowerCase());
    console.log(searchValue);
    let compareValue = document.getElementById('sort-options').value;

    let rankFilters = new Set(document.getElementById('rankFilter').selectedValues);
    let tribeFilters = new Set(document.getElementById('tribeFilter').selectedValues);
    let roleFilters = new Set(document.getElementById('roleFilter').selectedValues);
    let AMoveFilters = new Set(document.getElementById('AMoveFilter').selectedValues);
    let MovesFilters = [
        document.getElementById('Move1Filter').selectedValues,
        document.getElementById('Move2Filter').selectedValues,
        document.getElementById('Move3Filter').selectedValues,
        document.getElementById('Move4Filter').selectedValues]

    MovesFilters = MovesFilters.map(filter => new Set(filter));

    let showCostumes =
        searchValue !== ''
        || compareValue === 'Tribe'
        || compareValue === 'Role'
        || compareValue === 'Tier'
        || Array.from(document.querySelectorAll("#search-options-container multi-select")).reduce((acum,value) => acum || !value.areAllSelected(),false);

    // Filters Yo-kai who should be shown
    sortedData = data
        .filter(yokai =>
            normalizeString(yokai?.searchName?.toLowerCase())?.includes(searchValue) // Normalized search name includes normalized search string
            && !(compareValue === 'Tier' && yokai.score === undefined) // Doesn't show Yo-kai without a score when sorting by tier
            && rankFilters.has(yokai.rank) // Yo-kai abides by rank filter
            && tribeFilters.has(yokai.tribe) // Yo-kai abides by tribe filter
            && roleFilters.has(yokai.role) // Yo-kai abides by role filter
            && AMoveFilters.has(yokai.moves[0].name) // Yo-kai abides by A Move filter
            && MovesFilters.reduce((acum,filter) => { // Yo-kai abides by all move filters
                let newAcum = false;
                for(let j=1; j<=4; j++) newAcum |= filter.has(yokai.moves[j].name);
                return acum && newAcum;
            },true)
            && yokai.moves.slice(1,5).reduce((acum,move) => { // All of the Yo-kai's moves are in at least one move filter
                let newAcum = false;
                for(let j=0; j<4; j++) newAcum |= MovesFilters[j].has(move.name);
                return acum && newAcum;
            },true)
        )
        .toSorted(sortFunctions[compareValue] ?? sortFunctions["Medallium Number"]);
    if(compareValue === 'Medallium Number' && descending === -1) sortedData.reverse();

    while(main.hasChildNodes()) main.removeChild(main.firstChild);

    main.classList.toggle('tiers',compareValue === 'Tier');


    sortedData.forEach(element => {
        if(element.costumeName && element.hidden && !showCostumes) return;
        if(element.costumeName && compareValue === 'Tier' && element.sameMeta && searchValue === '') return;


        let gridItem = document.createElement('button');
        gridItem.classList.add("gridItem");

        let name = document.createElement('p');
        name.textContent = element.searchName ?? element.name;
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
            medalContainer.classList.add('gridItemIcon');
            medalContainer.classList.add('yokaiMedal')
            medalContainer.classList.add('custom-size')


            let medalFaceIcon = document.createElement('img');
            medalFaceIcon.classList.add('medalFaceIcon');
            medalFaceIcon.src = '/images/faceIcon/'+element.modelInfo+'.xi.00.png';
            medalFaceIcon.loading = 'lazy';

            let medalBorder = document.createElement('img');
            medalBorder.classList.add('medalBorder');
            medalBorder.src = "/images/medalParts/y_medal_"+ (element.isLegend?"lege":element.isRare?"rare":"nml") + "0" + tribeMedalNumbers[element.tribe] +".xi.00.png";
            medalBorder.alt = tribeMedalNumbers[element.tribe]+" Tribe "+(element.isLegend?"Legendary":element.isRare?"Rare":"Normal")+" medal border";

            medalFaceIcon.onload = function () {
                this.parentElement.classList.add("loaded");
            }


            medalContainer.appendChild(document.getElementById("yokaiInfoMedalBackground")?.cloneNode(true));
            medalContainer.appendChild(medalFaceIcon);
            medalContainer.appendChild(medalBorder);

            gridItem.appendChild(medalContainer);
        }

        gridItem.setAttribute('id',element.searchName.replace(/\s/g, ''));

        gridItem.classList.add(element.tribe);
        gridItem.classList.add(getTier(element.score).replaceAll(/\+/g,'p'));

        if(element.hidden && !element.costumeName) {
            console.log(element);
            console.log(localStorage);
        }
        if(element.hidden && !element.costumeName && (localStorage.getItem(element.id?.replace(/\s/g, '')) ?? "hidden") === "hidden")
            gridItem.classList.add('hidden');

        gridItem.yokai = element;

        main.appendChild(gridItem);


        gridItem.onclick = function(){openInfoPopup(this.yokai)};
    })
}

window.addEventListener('hashchange', () => {
    console.log(location.hash);
    let yokaiInfoContainer = document.getElementById('infoPopupContainer');
    if(!location.hash) {yokaiInfoContainer.className = 'closed'; return;}

    let yokai = yokaiHashes[location.hash.replace('#','')];
    if(yokai && (yokaiInfoContainer.yokaiId !== yokai.id || yokaiInfoContainer.className!=='open')) {openInfoPopup(yokai);}

})

document.addEventListener('keydown', function(e){
        let yokaiInfoContainer = document.getElementById('infoPopupContainer');
        if(e.code === 'Escape' && yokaiInfoContainer.classList.contains('open')){
            closeInfoPopup();
        }
})

async function openInfoPopup(yokai) {
    let yokaiHash = yokai.searchName?.replace(/\s/g, '') ?? yokai.id?.replace(/\s/g, '') ?? 'Yo-kai'+yokai.number;
    history.replaceState(null, null, '#'+yokaiHash);
    if(!yokai) return;
    console.log(yokai);

    await itemIDsPromise;
    await itemIconsPromise;

    if(yokai.hidden && !yokai.costumeName) {
        let DOMElement = document.getElementById(yokai.name?.replace(/\s/g, '')) ??
            document.getElementById(yokai.id?.replace(/\s/g, '')) ?? document.getElementById('Yo-kai'+yokai.number);

        DOMElement?.classList?.remove('hidden');

        localStorage.setItem(yokai.id?.replace(/\s/g, ''), "not-hidden");
    }

    document.getElementById('infoPopup').className = yokai.isLegend ? 'legend' : (yokai.isRare ? 'rare' : 'normal');
    document.getElementById('infoTitle').className = yokai.appearsInMedallium && yokai.number ? '' : 'noNumber';
    document.getElementById('infoNumber').innerText = '#'+yokai.number.toLocaleString(undefined, {minimumIntegerDigits: 3});
    document.getElementById('infoName').innerText = yokai.searchName ?? yokai.name;

    //let medal = document.getElementById("yokaiMedal");
    //medal.classList.add("loading");
    //medal.src = "/images/yokaiMedalsLarge/"+yokai.largeMedal+".png";
    //medal.alt = "Yo-kai "+yokai.name+"'s Medal";

    let faceIcon = document.getElementById('yokaiInfoMedalFaceIcon');
    faceIcon.classList.add('loading');
    faceIcon.src = "/images/faceIcon/"+yokai.modelInfo+".xi.00.png"
    faceIcon.alt = "Yo-kai "+yokai.name+"'s face icon";

    let medalBorder = document.getElementById('yokaiInfoMedalBorder');

    medalBorder.src = "/images/medalParts/y_medal_"+ (yokai.isLegend?"lege":yokai.isRare?"rare":"nml") + "0" + tribeMedalNumbers[yokai.tribe] +".xi.00.png";
    medalBorder.alt = tribeMedalNumbers[yokai.tribe]+" Tribe "+(yokai.isLegend?"Legendary":yokai.isRare?"Rare":"Normal")+" medal border";


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
    rankIcon.alt = yokai.rank+" Rank icon";

    document.getElementById('yokaiInfoRank').textContent = yokai.rank+" Rank";

    let roleIcon = document.getElementById("yokaiInfoRoleIcon");
    roleIcon.classList.add('loading');
    roleIcon.src = "/images/roleText/"+yokai.role+".png";
    roleIcon.alt = yokai.role+" Role icon";

    document.getElementById('yokaiInfoRole').textContent = yokai.role+" Role";

    let tribeIcon = document.getElementById('yokaiInfoTribeIcon');
    tribeIcon.classList.add('loading');
    tribeIcon.src = "/images/tribeIcons/"+yokai.tribe+".png";
    tribeIcon.alt = yokai.tribe+" Tribe icon";

    document.getElementById('yokaiInfoTribe').textContent = yokai.tribe+" Tribe";

    document.getElementById('yokaiHP').innerText = yokai.hp;
    document.getElementById('yokaiSTR').innerText = yokai.str;
    document.getElementById('yokaiSPR').innerText = yokai.spr;
    document.getElementById('yokaiDEF').innerText = yokai.def;
    document.getElementById('yokaiSPD').innerText = yokai.spd;

    let bio = document.getElementById("infoPopupDescription");
    bio.classList.toggle('noDesc',!(yokai.bio && yokai.bio.length))
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
        document.getElementById('move'+i+'Text').innerHTML = `<a href="/move-list#${yokai.moves[i]?.id}">${yokai.moves[i]?.name}</a>`;
    }

    document.getElementById('soultimateMoveName').innerHTML = `<a href="/move-list#${yokai.soultimate?.id}">${yokai.soultimate?.name}</a>`;
    //let soultDesc = document.getElementById('soultimateMoveDescription');
    //soultDesc.textContent = yokai.soultimate?.description;
    //if(yokai.soultimate.description === "") soultDesc.classList.add('empty');

    /*else soultDesc.classList.remove('empty');
    document.getElementById('soultimateMoveData').className = yokai.soultimate?.class;*/
    //document.getElementById('soultimateMovePower').textContent = yokai.soultimate?.power?.replaceAll(/\s*\+\s*/g,"/");
    /*document.getElementById('soultimateMoveClass').textContent = yokai.soultimate?.class;
    document.getElementById('soultimateMoveCharge').textContent = yokai.soultimate?.gauge;
    document.getElementById('soultimateMoveCritRate').textContent = yokai.soultimate?.critRate;*/
    //document.getElementById('soultimateMoveScaling').textContent = yokai.soultimate?.scaling?.replaceAll(/\s*\|\s*/g,"/");
    //document.getElementById('soultimateMoveAttribute').textContent = yokai.soultimate?.attribute?.replaceAll(/\s*\|\s*/g,"/");
    /*let soultInspirit = document.getElementById('soultimateInspirit');
    soultInspirit.textContent = yokai.soultimate?.inspiritEffects;
    soultInspirit.classList.toggle('empty',yokai.soultimate?.inspiritEffects === "");*/

    let tier = getTier(yokai.score)

    let tierHTML = (tier+" Tier").replace(/(\++)/,`<span class="bukotsu">$1</span>`);

    let tierElement = document.getElementById("tier");
    tierElement.innerHTML = tierHTML;
    tierElement.className = tier.replaceAll("+","p");
    document.getElementById("tierShadow").innerHTML = tierHTML;

    document.getElementById("tierContainer").classList.toggle('hidden',yokai.score === undefined);


    let fixedMetaDescription = yokai.metaDescription?.replaceAll(/#\[([^,]+?)]/g,"#[$1,$1]")?.replaceAll(/[*_](.+?)[*_]/g,`<i>$1</i>`)?.replaceAll(/yk#\[(.+?),(.+?)]/g,(match,group1,group2) => {
        let yokaiModelInfo = yokaiHashes[group2.replaceAll(/\s+/g,'')]?.modelInfo;
        return `<a href="#${group2.replaceAll(/\s+/g,'')}">${group1}</a>`+(yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${group1}'s face icon"></div>` : '')
    })?.replaceAll(/(eq|sl|item)#\[(.+?),(.+?)]/g,(match,group1,group2,group3) => {
        let itemIconInfo = itemIds && itemIcons ? itemIcons[itemIds[group3]] : null;
        let inlineIconHTML = (itemIconInfo ? ` <div class="inline-icon"><img src="/images/itemIcons/item_${itemIconInfo.sheet}_${itemIconInfo.iconRow}_${itemIconInfo.iconCol}.png" alt="${group2}'s icon"></div>` : '')
        if(group1 === 'eq') {
            return `<a href="/equipment#${group3.replaceAll(/\s+/g,'')}">${group3}</a>`+inlineIconHTML
        } else {
            return `${group2}${inlineIconHTML}`;
        }
    });
    let metaElement = document.getElementById("metaDescription");
    metaElement.innerHTML = fixedMetaDescription;
    metaElement.classList.toggle('hidden',!fixedMetaDescription);

    document.getElementById("tierData").classList.toggle('hidden',!yokai.score);
    metaElement.classList.toggle('hidden',!fixedMetaDescription);


    let obtentionSection = document.getElementById("obtentionSection");
    obtentionSection.classList.toggle('hidden',Object.keys(yokai.obtention).length === 0 && !yokai.costumeName);

    let obtentionMethods = document.getElementById("obtentionMethods");
    obtentionMethods.innerHTML = '';
    if(yokai.costumeName) {
        let costumeText = document.createElement('p')
        costumeText.innerHTML = 'Change costume in the basement (unlocks after beating Captain Thunder)'
        obtentionMethods.appendChild(costumeText);
    }

    yokai.obtention.evolution?.forEach((evolutionData) => {
        let evolutionText = document.createElement('p')

        let referenced = yokaiCache[evolutionData.yokaiId];
        if(!referenced) return;

        let yokaiModelInfo = referenced?.modelInfo;
        let yokaiSearchName = referenced?.searchName;

        let yokaiLink =  `<a href="#${yokaiSearchName.replaceAll(" ","")}">${yokaiSearchName}</a>`+(yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${yokaiSearchName}'s face icon"></div>` : '')

        evolutionText.innerHTML = `Evolves from ${yokaiLink} at level ${evolutionData.level}`
        obtentionMethods.appendChild(evolutionText);
    })
    yokai.obtention.fusion?.forEach((fusionData) => {
        let fusionText = document.createElement('p')

        let part1, part2;

        if(yokaiCache[fusionData.part1]) {
            let referenced = yokaiCache[fusionData.part1];
            if(!referenced) return;

            let yokaiModelInfo = referenced?.modelInfo;
            let yokaiSearchName = referenced?.searchName;

            part1 =  `<a href="#${yokaiSearchName.replaceAll(" ","")}">${yokaiSearchName}</a>`+(yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${yokaiSearchName}'s face icon"></div>` : '')
        } else {
            let referenced = itemIcons[fusionData.part1];
            if(!referenced) return;

            part1 = `the ${referenced.name} <div class="inline-icon"><img src="/images/itemIcons/item_${referenced.sheet}_${referenced.iconRow}_${referenced.iconCol}.png" alt="${referenced.name}'s icon"></div>`;
        }

        if(yokaiCache[fusionData.part2]) {
            let referenced = yokaiCache[fusionData.part2];
            if(!referenced) return;

            let yokaiModelInfo = referenced?.modelInfo;
            let yokaiSearchName = referenced?.searchName;

            part2 =  `<a href="#${yokaiSearchName.replaceAll(" ","")}">${yokaiSearchName}</a>`+(yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${yokaiSearchName}'s face icon"></div>` : '')
        } else {
            let referenced = itemIcons[fusionData.part2];
            if(!referenced) return;

            part2 = `the ${referenced.name} <div class="inline-icon"><img src="/images/itemIcons/item_${referenced.sheet}_${referenced.iconRow}_${referenced.iconCol}.png" alt="${referenced.name}'s icon"></div>`;
        }

        fusionText.innerHTML = `Fuse ${part1} with ${part2}`
        obtentionMethods.appendChild(fusionText);
    })
    new Set(yokai.obtention.patrol)?.forEach((patrolText) => {
        let patrolElement = document.createElement('p');
        patrolElement.innerText = patrolText;
        obtentionMethods.appendChild(patrolElement);
    })
    new Set(yokai.obtention.missionReward)?.forEach((rewardText) => {
        let rewardElement = document.createElement('p');
        rewardElement.innerText = rewardText;
        obtentionMethods.appendChild(rewardElement);
    })
    yokai.obtention.crank?.forEach((crankData) => {
        let crankElement = document.createElement('p');

        let isRegularCrank = crankData.crank === 'Crank-a-kai';
        let crankName = isRegularCrank ? '' : crankData.crank;

        let coinName = '';
        if(crankData.coin === '0A 00 00 00') coinName = "Play Coins"
        else {
            let coinRef = itemIcons[crankData.coin];
            if(coinRef) {
                coinName = `${coinRef.name} <div class="inline-icon"><img src="/images/itemIcons/item_${coinRef.sheet}_${coinRef.iconRow}_${coinRef.iconCol}.png" alt="${coinRef.name}'s icon"></div>`
            }
        }

        crankElement.innerHTML = isRegularCrank ? `${coinName} ${crankData.prize.toLowerCase()} prize` : `${crankName} ${crankData.prize.toLowerCase()} prize`
        obtentionMethods.appendChild(crankElement);
    })
    yokai.obtention.circleReward?.forEach((circleData) => {
        let circleElement = document.createElement('p');

        circleElement.innerHTML = `${circleData.name} Yo-kai Circle (`
        circleData.yokai.forEach(yokai => {
            let referenced = yokaiCache[yokai];
            if(!referenced) return;

            let yokaiModelInfo = referenced?.modelInfo;
            let yokaiSearchName = referenced?.searchName;

            let yokaiLink =  `<nobr><a href="#${yokaiSearchName.replaceAll(" ","")}">${yokaiSearchName}</a>`+(yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${yokaiSearchName}'s face icon"></div>` : '')

            circleElement.innerHTML += yokaiLink+`,</nobr> `;
        })

        circleElement.innerHTML = circleElement.innerHTML.replace(/,<\/nobr>\s?$/,")")

        obtentionMethods.appendChild(circleElement);
    })
    yokai.obtention.legendSeal?.forEach((legendData) => {
        let legendElement = document.createElement('p');

        legendElement.innerHTML = `Legendary Seal (`
        legendData.forEach(yokai => {
            let referenced = yokaiCache[yokai];
            if(!referenced) return;

            let yokaiModelInfo = referenced?.modelInfo;
            let yokaiSearchName = referenced?.searchName;

            let yokaiLink =  `<nobr><a href="#${yokaiSearchName.replaceAll(" ","")}">${yokaiSearchName}</a>`+(yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${yokaiSearchName}'s face icon"></div>` : '')

            legendElement.innerHTML += yokaiLink+`,</nobr> `;
        })

        legendElement.innerHTML = legendElement.innerHTML.replace(/,<\/nobr>\s?$/,")")

        obtentionMethods.appendChild(legendElement);
    })

    let evolutions = document.getElementById('evolutions');
    evolutions.classList.toggle('hidden',!yokai.evolution && yokai.fusion.length == 0);
    evolutions.innerHTML = '';
    if(yokai.evolution) ifBlock: {
        let evolutionText = document.createElement('p')

        let referenced = yokaiCache[yokai.evolution.yokaiID];
        if(!referenced) break ifBlock;

        let yokaiModelInfo = referenced?.modelInfo;
        let yokaiSearchName = referenced?.searchName;

        let yokaiLink =  `<a href="#${yokaiSearchName.replaceAll(" ","")}">${yokaiSearchName}</a>`+(yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${yokaiSearchName}'s face icon"></div>` : '')

        evolutionText.innerHTML = `Evolves into ${yokaiLink} at level ${yokai.evolution.level}`
        evolutions.appendChild(evolutionText);
    }
    yokai.fusion?.forEach(fusionData => {
        let fusionText = document.createElement('p')

        let result = yokaiCache[fusionData.result];
        if(!result) return;
        let resultModelInfo = result?.modelInfo;
        let resultSearchName = result?.searchName;
        let resultLink =  `<a href="#${resultSearchName.replaceAll(" ","")}">${resultSearchName}</a>`+(resultModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${resultModelInfo}.xi.00.png" alt="${resultSearchName}'s face icon"></div>` : '')

        let other;
        if(yokaiCache[fusionData.other]) {
            let referenced = yokaiCache[fusionData.other];
            if(!referenced) return;
            let yokaiModelInfo = referenced?.modelInfo;
            let yokaiSearchName = referenced?.searchName;
            other =  `<a href="#${yokaiSearchName.replaceAll(" ","")}">${yokaiSearchName}</a>`+(yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${yokaiSearchName}'s face icon"></div>` : '')
        } else {
            let referenced = itemIcons[fusionData.other];
            if(!referenced) return;

            other = `the ${referenced.name} <div class="inline-icon"><img src="/images/itemIcons/item_${referenced.sheet}_${referenced.iconRow}_${referenced.iconCol}.png" alt="${referenced.name}'s icon"></div>`;
        }

        fusionText.innerHTML = `Evolves into ${resultLink} when fused with ${other}`
        evolutions.appendChild(fusionText);
    })




    /*let screenCover = document.getElementById("screenCover");
    screenCover.yokaiId = yokai.id;
    screenCover.scrollTop = 0;
    screenCover.className = 'open';
    screenCover.focus();*/

    let yokaiInfoContainer = document.getElementById('infoPopupContainer');
    yokaiInfoContainer.yokaiId = yokai.id;
    yokaiInfoContainer.scrollTop = 0;
    yokaiInfoContainer.showModal();

    let yokaiInfoElement = document.getElementById('infoPopup');
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
    let yokaiInfoContainer = document.getElementById('infoPopupContainer');
    yokaiInfoContainer.addEventListener('transitionend', function () {
        this.close();
    },{once:true});
    yokaiInfoContainer.classList.remove('open');
    history.pushState(null,null,location.pathname+location.search);
}

function getTier(score) {
    return score >= 95 ? "S++": score >= 90 ? "S+":
            score >= 80 ? "S": score >= 70 ? "A": score >= 60 ? "B":
            score >= 45 ? "C": score >= 30 ? "D": score >= 10 ? "E": "F";
}

function normalizeString(str) {
    return str?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "");
}


/*let pusi = [];

let rankValues = {'E': 0, 'D':1, 'C':2, 'B':3, 'A':4, 'S':5}

function sortNumber(yokai1, yokai2, direction = 1) {return ((yokai1.number > yokai2.number ? 1 : -1) + (yokai1.fileIndex > yokai2.fileIndex ? 0.5 : -0.5))*direction}
function sortName(yokai1, yokai2, direction = 1) {return yokai1.name.localeCompare(yokai2) * direction;}
function sortHP(yokai1, yokai2, direction = 1) {return (yokai1.hp - yokai2.hp)*direction;}
function sortSTR(yokai1, yokai2, direction = 1) {return (yokai1.str - yokai2.str)*direction;}
function sortSPR(yokai1, yokai2, direction = 1) {return (yokai1.spr - yokai2.spr)*direction;}
function sortDEF(yokai1, yokai2, direction = 1) {return (yokai1.def - yokai2.def)*direction;}*/

