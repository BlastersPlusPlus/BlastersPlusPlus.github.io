let orge_technic_info = fetch('/data-sources/orge_technic_info.json').then(response => response.json()),
    orge_technic_cmd_data = fetch('/data-sources/orge_technic_cmd_data.json').then(response => response.json()),
    moveList = [], moveHashes = {}, repeatCMDs = {};

let yokaiDictionary = fetch('/data-sources/yokai-dictionary.json').then(response => response.json());

let descending = 1;

const BLITZ_FINISHER = "6F A6 6C 66";
const NUMBER_FORMAT = Intl.NumberFormat("en-US",{maximumFractionDigits:2});


const sortFunctions = {
    'Name': (a,b) => ((a.name).localeCompare(b.name))*descending,
    'Power': (a,b) =>  ((Math.max(a.cmd?.chargedCMD?.totalPower ?? -Infinity, a.cmd?.totalPower ?? 0) ?? 0) - (Math.max(b.cmd?.chargedCMD?.totalPower ?? -Infinity, b.cmd?.totalPower ?? 0) ?? 0))*descending + ((a.name).localeCompare(b.name)*0.5),
    'Number of Yo-kai': (a,b) => ((a['yo-kai']?.length ?? 0) - (b['yo-kai']?.length ?? 0))*descending + ((a.name).localeCompare(b.name)*0.5)
};




HTMLElement.prototype.toggleOpen = function() {
    this.classList.toggle('open');
};



document.addEventListener('DOMContentLoaded', async () => {
    let minWaitTime = 500+(Math.random()**2)*2000;
    //console.log("Waiting for at least "+(minWaitTime/1000)+" seconds before data is loaded");
    let minWait = new Promise(resolve => setTimeout(resolve, minWaitTime));


    orge_technic_info = await orge_technic_info;
    orge_technic_cmd_data = await orge_technic_cmd_data;
    yokaiDictionary = await yokaiDictionary;
    await minWait;


    for(const key in orge_technic_cmd_data) {
        let cmdParam = orge_technic_cmd_data[key];
        cmdParam.ID = key;

        if(cmdParam.charged && orge_technic_cmd_data[cmdParam.charged]) cmdParam.chargedCMD = orge_technic_cmd_data[cmdParam.charged];

        let totalPower = 0;

        let otherMoveIDs = [];
        cmdParam.link?.forEach((element) => otherMoveIDs.push(element.move_ID));
        cmdParam.random?.forEach((element) => otherMoveIDs.push(element.id));
        cmdParam.chain?.forEach((element) => otherMoveIDs.push(element));
        if(cmdParam.is_blitz_chain) otherMoveIDs.push(BLITZ_FINISHER);
        if(cmdParam.type === 'param') otherMoveIDs.unshift(key);


        otherMoveIDs.forEach(id => {
            let otherMoveCMD = orge_technic_cmd_data[id];
            if(!otherMoveCMD.effect) return;
            totalPower += otherMoveCMD.effect?.base_power;
        });

        if(cmdParam.type === "random") {
            totalPower = 0;
            cmdParam.random?.forEach(element => {
                let randomMoveCMD = orge_technic_cmd_data[element.id];
                if(randomMoveCMD.effect?.base_power) totalPower += randomMoveCMD.effect.base_power * element.odds/100;
            });
        }


        cmdParam.totalPower = totalPower;
    }

    let datalist = document.getElementById('search-options');

    let repeatNames = {};
    for(const key in orge_technic_info) {
        let move = orge_technic_info[key];
        move["id"] = key;
        moveList.push(move);

        let cmd = orge_technic_cmd_data[move.cmdID];

        if(!cmd) continue;

        move.cmd = cmd;

        let repeatNameData = repeatNames[move.name] ?? {'scalings': new Set(), 'count': 0};
        if(cmd.effect?.scaling && cmd.effect?.scaling !== 'None') repeatNameData.scalings.add(cmd.effect?.scaling);
        repeatNameData.count++;
        repeatNames[move.name] = repeatNameData;

        if(repeatCMDs[move.cmdID] instanceof Array) repeatCMDs[move.cmdID].push(move);
        else repeatCMDs[move.cmdID] = [move];
    }
    let foundNames = {};
    for(const key in orge_technic_info) {
        let move = orge_technic_info[key];

        let foundName = move.name;
        let repeatNameData = repeatNames[move.name];

        foundNames[foundName] = (foundNames[foundName] ?? 0) + 1;

        if(repeatNameData?.count > 1) {
            if(repeatNameData?.count === repeatNameData?.scalings?.size) move.name += ' ('+(move.cmd?.effect?.scaling)+')';
            else move.name += ' ('+(foundNames[move.name])+')';
        }

        moveHashes[move.name] = move;
        let option = document.createElement("option");
        option.value = move.name;
        datalist.appendChild(option);

    }

    for(const key in repeatCMDs) repeatCMDs[key].sort(sortFunctions.Name);

    document.querySelectorAll("#search-options-container .search-options-input").forEach(element => element.addEventListener('change', generateGrid));

    //sortedData = data;
    document.getElementById('loadContainer').classList.add('closed');
    generateGrid();




    let hash = decodeURIComponent(location.hash.replace('#',''));

    let move = moveHashes[hash] ?? orge_technic_info[hash];
    if(move && move.id === hash) location.hash = move.name;
    if(move) {
        openInfoPopup(move);
        let moveElement = document.getElementById(move.name);
        window.scrollBy(0,moveElement?.getBoundingClientRect()?.top ?? 0);
    }
});

function generateGrid() {
    let main = document.querySelector('main');

    let searchValue = normalizeString(document.getElementById('name-search')?.value?.toLowerCase());
    console.log("Searching: "+searchValue);
    let compareValue = document.getElementById('sort-options').value;




    let typeFilter = new Set(document.getElementById('typeFilter').selectedValues);
    let moveTypes = ['A Move','Selectable Move','Soultimate Move'];

    let classFilter = new Set(document.getElementById('classFilter').selectedValues);

    // Filters moves that should be shown
    sortedData = moveList
        .filter(move =>
            normalizeString(move?.name?.toLowerCase())?.includes(searchValue) &&// Normalized search name includes normalized search string
            typeFilter.has(moveTypes[move.type]) &&
            getAllMoveClasses(move.cmd)?.split('/')
                ?.reduce((previous, current) => previous || classFilter.has(current),false)

        )
        .toSorted(sortFunctions[compareValue] ?? sortFunctions["Medallium Number"]);

    while(main.hasChildNodes()) main.removeChild(main.firstChild);


    let hideDuplicates = document.getElementById('hideDuplicates').checked;
    let shownCMDIDs = new Set();

    sortedData.forEach(element => {
        if(hideDuplicates && shownCMDIDs.has(element.cmdID)) return;

        let cmd = element.cmd ?? orge_technic_cmd_data[element.cmdID];

        if(!cmd) return;

        shownCMDIDs.add(element.cmdID);

        let gridItem = document.createElement('button');
        gridItem.classList.add("gridItem");

        gridItem.classList.add(cmd?.menu?.color);

        let name = document.createElement('p');
        name.textContent = element.name;
        name.classList.add('name');
        gridItem.appendChild(name);

        let imageContainer = document.createElement('div');
        imageContainer.classList.add('gridItemIcon');
        let image = document.createElement('img');
        image.src = element.type === 2 ? '/images/moveIcons/soultimateWisp.png' : '/images/moveIcons/image'+element.icon+'.png';
        image.loading = 'lazy';

        imageContainer.appendChild(image);
        gridItem.appendChild(imageContainer);

        gridItem.setAttribute('id',element.name);

        gridItem.move = element;

        main.appendChild(gridItem);

        gridItem.onclick = function(){openInfoPopup(this.move);};
    });
}

window.addEventListener('hashchange', () => {
    console.log(location.hash);
    let infoContainer = document.getElementById('infoPopupContainer');
    if(!location.hash) {infoContainer.className = 'closed'; return;}

    let hash = decodeURIComponent(location.hash.replace('#',''));

    let move = moveHashes[hash] ?? orge_technic_info[hash];
    if(move.id === hash) location.hash = move.name;
    if(move && (infoContainer.itemId !== move.id || infoContainer.className !=='open')) {openInfoPopup(move);}

});

document.addEventListener('keydown', function(e){
        let infoContainer = document.getElementById('infoPopupContainer');
        if(e.code === 'Escape' && infoContainer.classList.contains('open')){
            closeInfoPopup();
        }
});

async function openInfoPopup(move) {
    let moveHash = move.name ?? move.id;
    history.replaceState(null, null, '#'+moveHash);
    if(!move) return;

    console.log(move);

    switchTab(document.getElementsByClassName('tabButton')[0]);


    let cmd = orge_technic_cmd_data[move.cmdID];
    if(!cmd) {
        alert('Could not find move data.');
        return;
    }

    // Gets charged CMD before making the switch to the link if it exists
    let chargedCMD = cmd.chargedCMD ?? orge_technic_cmd_data[cmd.charged];

    // Gets the cooldown of the original move
    let previousCooldown = cmd.timing?.cooldown;
    let previousChargeNeeded = cmd.soulMeter?.chargeNeeded;
    let previousChargeTime = cmd.timing?.charge_time ?? 0;

    let newLinkArray = cmd.link?.filter(linkData => !hasNoEffect(orge_technic_cmd_data[linkData.move_ID]));
    if(hasNoEffect(cmd) && newLinkArray?.length === 1) cmd = orge_technic_cmd_data[newLinkArray[0].move_ID];
    if(!cmd) {
        alert('Could not find move data.');
        return;
    }

    let isParam = cmd.type === 'param';
    let isSimpleMove =
        isParam &&
        (!cmd.link ||
            cmd.link.reduce((prev, curr) =>
                    prev && hasNoEffect(orge_technic_cmd_data[curr.move_ID])
                ,true));


    document.getElementById("infoPopup").className = 'moveList ' + move?.cmd?.menu?.color;

    document.getElementById('moveIcon').src = '/images/moveIcons/' + (move.icon ? 'image'+move.icon : 'soultimateWisp') + '.png';
    document.getElementById('infoName').textContent = move.name;
    document.getElementById('infoPopupDescription').textContent = move.description;


    let moveStats = document.getElementById('moveStats-main');
    moveStats.className = 'moveStats';
    moveStats.classList.add(['a-move','selectable','soultimate'][move.type]);
    moveStats.classList.add(cmd.type);


    let infoContainer = document.getElementById('infoPopupContainer');
    infoContainer.itemId = move.id;
    infoContainer.scrollTop = 0;
    infoContainer.showModal();

    
    let showHitboxText = isSimpleMove && cmd.hitbox && cmd.hitbox.hitbox_time > 0 && cmd.hitbox.time_between_hits > 0 && cmd.hitbox.hitbox_time > cmd.hitbox.time_between_hits;
    document.getElementById('hitboxText').classList.toggle('hidden', !showHitboxText);
    document.getElementById('hitboxTime').innerText = NUMBER_FORMAT.format(cmd.hitbox?.hitbox_time)+'s';
    document.getElementById('timeBetweenHits').innerText = NUMBER_FORMAT.format(cmd.hitbox?.time_between_hits)+'s';
    
    document.getElementById('drainText').classList.toggle('hidden',!(cmd.effect?.move_type === 'Drain'));


    document.getElementById('moveClass').innerText = getAllMoveClasses(cmd) ?? '---';


    let menuPower = cmd?.menu?.power ?? 0;
    let noPower = false;
    if(isParam && !cmd.link && cmd?.effect?.base_power > 0) {
        let numberHits = cmd?.effect?.number_of_hits || 1;

        if(numberHits !== 1) document.getElementById('movePower').innerText = `${NUMBER_FORMAT.format(cmd?.effect?.base_power/numberHits)}x${numberHits}`;
        else document.getElementById('movePower').innerText = cmd?.effect?.base_power;
    }
    else if(menuPower !== 0 ) {
        let numberHits = cmd?.menu?.number_of_hits || 1;

        if(numberHits !== 1) document.getElementById('movePower').innerText = `${NUMBER_FORMAT.format(menuPower/numberHits)}x${numberHits}`;
        else document.getElementById('movePower').innerText = menuPower;
    }
    else {
        noPower = true;
        document.getElementById('movePower').innerText = '---';
    }


    let moveTarget = document.getElementById('moveTarget');
    moveTarget.innerText = cmd.hitbox?.target && cmd.hitbox?.target !== 'Unknown' ? cmd.hitbox?.target.replaceAll('_',' ') : '---';
    moveTarget.classList.toggle('noValue',!(cmd.hitbox?.target) || cmd.hitbox.target === 'Unknown');

    let moveCooldown =
        cmd.type === 'chain' ? // For chain moves, its cooldown should only appear if it's the same for all elements of the chain
            cmd?.chain
                // maps IDs to their cooldown if it exists, 0 otherwise
                ?.map(id => orge_technic_cmd_data[id]?.timing?.cooldown ?? 0)
                // If first element, return first element. Otherwise, return 0 if element is different than previous. This means that a different element sets cooldown to 0
                ?.reduce((previous,current) => previous === null ? current : (previous === current ? current : 0),null)
                ?? 0 // If anything fails, returns 0
            :
        cmd.type === 'random' ? // Does the same for random moves. Only changes the mapping due to data structure
            cmd?.random
                // maps IDs to their cooldown if it exists, 0 otherwise
                ?.map(element => orge_technic_cmd_data[element.id]?.timing?.cooldown ?? 0)
                // If first element, return first element. Otherwise, return 0 if element is different than previous. This means that a different element sets cooldown to 0
                ?.reduce((previous,current) => previous === null ? current : (previous === current ? current : 0),null)
            ?? 0 // If anything fails, returns 0
            :
        cmd?.gauge?.meter_recharge ? Math.ceil((1000/cmd.gauge.meter_recharge)*30)/30 :
        cmd?.gauge?.meter_recharge === 0 ? 0 :
            previousCooldown ?? cmd.timing?.cooldown ?? 0;
    document.getElementById('moveCooldown').innerText = moveCooldown !== 0 ? NUMBER_FORMAT.format(moveCooldown)+'s' : '---';
    document.getElementById('moveCritRate').innerText = !noPower && cmd.effect?.crit_rate && isSimpleMove ? cmd.effect.crit_rate+'%' : '---';

    let numHits = cmd?.effect?.number_of_hits || 1;
    document.getElementById('moveSoulGain').innerText =
        cmd.soulMeter?.meterCharge && isSimpleMove ?
            cmd.soulMeter.meterCharge + (numHits > 1 ? 'x'+numHits : '') :
            '---';
    document.getElementById('soultimateGauge').innerText = previousChargeNeeded ?? cmd.soulMeter?.chargeNeeded ?? '---';

    let moveScaling = document.getElementById('moveScaling');
    moveScaling.innerText =
        cmd.type === 'chain' || cmd.type === 'random' ?
        Array.from(new Set(
            cmd.type === 'chain' ? cmd?.chain ?.map(id => orge_technic_cmd_data[id]?.effect?.scaling ?? 'None') :
                cmd?.random?.map(element => orge_technic_cmd_data[element.id]?.effect?.scaling ?? 'None')
        )
            .add(cmd.type === 'chain' && cmd.is_blitz_chain ? 'STR' : 'None'))
            .filter(e => e !== 'None').join('/').replace(/^$/,"---") :
        cmd.effect?.scaling && cmd.effect?.scaling !== 'None' && isSimpleMove ? cmd.effect?.scaling : '---';
    moveScaling.classList.toggle('noValue',moveScaling.innerText === '---');

    let moveAttribute = document.getElementById('moveAttribute');
    moveAttribute.innerText = cmd.effect?.attribute && cmd.effect?.attribute !== 'None' && isSimpleMove ? cmd.effect?.attribute : '---';
    moveAttribute.classList.toggle('noValue',!(cmd.effect?.attribute && cmd.effect?.attribute !== 'None' && isSimpleMove));


    let moveInspirits = document.getElementById('moveInspirits');
    moveInspirits.classList.toggle('hidden',!isSimpleMove || ((!cmd.inspirits || cmd.inspirits.length === 0) && !(cmd.effect?.stun > 0)));

    let newInspArray = cmd.inspirits?.split('\n') ?? [];
    if(cmd.effect?.stun > 0) newInspArray.push('Stuns small foes for a while.');
    moveInspirits.innerText = newInspArray.join('\n').replaceAll(/^\n*|\n*$/g,"");


    document.getElementById('learnedBySection').classList.toggle('hidden',!move['yo-kai'] || move['yo-kai']?.length === 0);
    document.getElementById('yokaiCount').innerText = (move['yo-kai']?.length ?? 0) + '';
    let learnedBy = document.getElementById('learnedBy');
    learnedBy.innerHTML = '';
    let yokaiLinks = move['yo-kai']?.map(id => {
        let yokai = yokaiDictionary[id];
        if(yokai == null) return;

        let yokaiSearchName = yokai.searchName, yokaiModelInfo = yokai.modelInfo;

        return `<nobr><a href="/yo-kai-info/#${yokaiSearchName.replaceAll(" ","")}">${yokaiSearchName}</a>`+
            (yokaiModelInfo ? ` <div class="inline-icon"><img src="/images/faceIcon/${yokaiModelInfo}.xi.00.png" alt="${yokaiSearchName}'s face icon"></div>` : '')+
            '</nobr>';
    });
    learnedBy.innerHTML = yokaiLinks.join(", ");


    let duplicateMoves = repeatCMDs[move.cmdID] ?? [];
    duplicateMoves = [...duplicateMoves];
    duplicateMoves.splice(duplicateMoves.indexOf(move) ?? 0, duplicateMoves.includes(move) ? 1 : 0);
    document.getElementById('duplicateMovesSection').classList.toggle('noContent',duplicateMoves.length === 0);
    let moveLinks = duplicateMoves?.map(move => {
        if(move == null) return;

        return `<nobr><a href="#${move.id}">${move.name}</a>`+
            ` <div class="inline-icon"><img src="/images/moveIcons/${move.icon ? 'image'+move.icon : 'soultimateWisp'}.png" alt="${move-name}'s icon"></div>` +
            '</nobr>';
    });
    document.getElementById('duplicateMoves').innerHTML = moveLinks.join(", ");


    document.getElementById('gaugeText').classList.toggle('hidden',!cmd.gauge);
    if(cmd.gauge) document.getElementById('gaugeUptime').innerText = NUMBER_FORMAT.format((1000-cmd.gauge.initial_use)/cmd.gauge.meter_use)+'s';




    // Charged move section
    let previousChargedCooldown = chargedCMD?.timing?.cooldown;

    // If the move's only functionality is a single link move, switches the move for that link move
    let newLinkArrayCMD = chargedCMD?.link?.filter(linkData => !hasNoEffect(orge_technic_cmd_data[linkData.move_ID]));
    if(hasNoEffect(chargedCMD) && newLinkArrayCMD?.length === 1) chargedCMD = orge_technic_cmd_data[newLinkArrayCMD[0].move_ID];

    document.getElementById('chargedDataContainer').classList.toggle('hidden',!(chargedCMD && chargedCMD.type === 'param'));
    document.getElementById('chargeText').classList.toggle('hidden',previousChargeTime === 0 && (!cmd?.timing?.charge_time || cmd?.timing?.charge_time === 0));
    document.getElementById('chargeTime').innerText = (previousChargeTime === 0 ? cmd.timing?.charge_time ?? 0 : previousChargeTime)+'s';

    if(chargedCMD && chargedCMD.type === 'param') {
        let moveStats = document.getElementById('moveStats-charged');
        moveStats.className = 'moveStats';
        moveStats.classList.add(['a-move','selectable','soultimate'][move.type]);
        moveStats.classList.add(cmd.type);

        let isSimpleMove =
            isParam &&
            (!chargedCMD.link ||
                chargedCMD.link.reduce((prev, curr) =>
                        prev && hasNoEffect(orge_technic_cmd_data[curr.move_ID])
                    ,true));


        let showHitboxText = isSimpleMove && chargedCMD.hitbox && chargedCMD.hitbox.hitbox_time > 0 && chargedCMD.hitbox.time_between_hits > 0 && chargedCMD.hitbox.hitbox_time > chargedCMD.hitbox.time_between_hits;
        document.getElementById('hitboxText-charged').classList.toggle('hidden', !showHitboxText);
        document.getElementById('hitboxTime-charged').innerText = NUMBER_FORMAT.format(chargedCMD.hitbox?.hitbox_time)+'s';
        document.getElementById('timeBetweenHits-charged').innerText = NUMBER_FORMAT.format(chargedCMD.hitbox?.time_between_hits)+'s';
        
        document.getElementById('drainText-charged').classList.toggle('hidden',!(chargedCMD.effect?.move_type === 'Drain'));


        document.getElementById('moveClass-charged').innerText = getAllMoveClasses(chargedCMD) ?? '---';

        let menuPower = chargedCMD?.menu?.power ?? 0;
        let noPower = false;
        if(isParam && !chargedCMD.link && chargedCMD?.effect?.base_power > 0) {
            let numberHits = cmd?.effect?.number_of_hits || 1;

            if(numberHits !== 1) document.getElementById('movePower-charged').innerText = `${NUMBER_FORMAT.format(chargedCMD?.effect?.base_power/numberHits)}x${numberHits}`;
            else document.getElementById('movePower-charged').innerText = chargedCMD?.effect?.base_power;
        }
        else if(menuPower !== 0 ) {
            let numberHits = chargedCMD?.menu?.number_of_hits || 1;

            if(numberHits !== 1) document.getElementById('movePower-charged').innerText = `${NUMBER_FORMAT.format(menuPower/numberHits)}x${numberHits}`;
            else document.getElementById('movePower-charged').innerText = menuPower;
        }
        else {
            noPower = true;
            document.getElementById('movePower-charged').innerText = '---';
        }


        let moveTarget = document.getElementById('moveTarget-charged');
        moveTarget.innerText = chargedCMD.hitbox?.target && chargedCMD.hitbox?.target !== 'Unknown' ? chargedCMD.hitbox?.target.replaceAll('_',' ') : '---';
        moveTarget.classList.toggle('noValue',!(chargedCMD.hitbox?.target) || chargedCMD.hitbox.target === 'Unknown');

        let moveCooldown = previousChargedCooldown ?? chargedCMD.timing?.cooldown ?? 0;
        document.getElementById('moveCooldown-charged').innerText = moveCooldown !== 0 ? NUMBER_FORMAT.format(moveCooldown)+'s' : '---';
        document.getElementById('moveCritRate-charged').innerText = !noPower && chargedCMD.effect?.crit_rate && isSimpleMove ? chargedCMD.effect.crit_rate+'%' : '---';

        let numHits = chargedCMD?.effect?.number_of_hits || 1;
        document.getElementById('moveSoulGain-charged').innerText =
            chargedCMD.soulMeter?.meterCharge && isSimpleMove ?
                chargedCMD.soulMeter.meterCharge + (numHits > 1 ? 'x'+numHits : '') :
                '---';
        document.getElementById('soultimateGauge-charged').innerText = chargedCMD.soulMeter?.chargeNeeded ?? '---';

        let moveScaling = document.getElementById('moveScaling-charged');
        moveScaling.innerText =
            chargedCMD.type === 'chain' || chargedCMD.type === 'random' ?
                Array.from(new Set(
                    chargedCMD.type === 'chain' ? chargedCMD?.chain ?.map(id => orge_technic_chargedCMD_data[id]?.effect?.scaling ?? 'None') :
                        chargedCMD?.random?.map(element => orge_technic_chargedCMD_data[element.id]?.effect?.scaling ?? 'None')
                )
                    .add(chargedCMD.type === 'chain' && chargedCMD.is_blitz_chain ? 'STR' : 'None'))
                    .filter(e => e !== 'None').join('/').replace(/^$/,"---") :
                chargedCMD.effect?.scaling && chargedCMD.effect?.scaling !== 'None' && isSimpleMove ? chargedCMD.effect?.scaling : '---';
        moveScaling.classList.toggle('noValue',moveScaling.innerText === '---');

        let moveAttribute = document.getElementById('moveAttribute-charged');
        moveAttribute.innerText = chargedCMD.effect?.attribute && chargedCMD.effect?.attribute !== 'None' && isSimpleMove ? chargedCMD.effect?.attribute : '---';
        moveAttribute.classList.toggle('noValue',!(chargedCMD.effect?.attribute && chargedCMD.effect?.attribute !== 'None' && isSimpleMove));


        let moveInspirits = document.getElementById('moveInspirits-charged');
        moveInspirits.classList.toggle('hidden',!isSimpleMove || ((!chargedCMD.inspirits || chargedCMD.inspirits.length === 0) && !(chargedCMD.effect?.stun > 0)));

        let newInspArray = chargedCMD.inspirits?.split('\n') ?? [];
        if(chargedCMD.effect?.stun > 0) newInspArray.push('Stuns small foes for a while.');
        moveInspirits.innerText = newInspArray.join('\n').replaceAll(/^\n*|\n*$/g,'');
    }



    // if it has a charged move, check that the charged move meets the conditions as well
    if(chargedCMD) {
        isSimpleMove &&=
            chargedCMD.type === 'param' &&
                (!chargedCMD.link ||
                chargedCMD.link.reduce((prev, curr) =>
                    prev && hasNoEffect(orge_technic_cmd_data[curr.move_ID])
                ,true));
    }

    document.getElementById('tabsContainer').classList.toggle('noDetails',isSimpleMove);
    if(!isSimpleMove) {
        document.getElementById('detailsTab').innerHTML = generateMoveDetails(cmd,false,['a-move','selectable','soultimate'][move.type],true,2);
    }



    infoContainer.classList.add('open');

}


function generateMoveDetails(cmd,forceParam,technicType,wrapContainer = false,level=2) {

    let elementText = "";

    let showedPreviousText =
        (cmd.type === 'param' || forceParam) && !hasNoEffect(cmd) ||
        cmd.type === 'random' ||
        cmd.type === 'chain';

    if((cmd.type === 'param' || forceParam) && !hasNoEffect(cmd)) {
        let showHitboxText = cmd.hitbox && cmd.hitbox.hitbox_time > 0 && cmd.hitbox.time_between_hits > 0 && cmd.hitbox.hitbox_time > cmd.hitbox.time_between_hits;


        let noPower = false;
        let movePower = '---';
        if(cmd?.effect?.base_power > 0) {
            let numberHits = cmd?.effect?.number_of_hits || 1;

            if(numberHits !== 1) movePower = `${NUMBER_FORMAT.format(cmd?.effect?.base_power/numberHits)}x${numberHits}`;
            else movePower = cmd?.effect?.base_power;
        }
        else {
            noPower = true;
        }


        let moveTarget = cmd.hitbox?.target && cmd.hitbox?.target !== 'Unknown' ? cmd.hitbox?.target.replaceAll('_',' ') : '---';
        let noTarget = !(cmd.hitbox?.target) || cmd.hitbox.target === 'Unknown';

        let moveCooldown =
                    cmd?.gauge?.meter_recharge ? Math.ceil((1000/cmd.gauge.meter_recharge)*30)/30 :
                        cmd?.gauge?.meter_recharge === 0 ? 0 :
                            cmd.timing?.cooldown ?? 0;
        moveCooldown = moveCooldown !== 0 ? NUMBER_FORMAT.format(moveCooldown)+'s' : '---';


        let moveCritRate = !noPower && cmd.effect?.crit_rate ? cmd.effect.crit_rate+'%' : '---';

        let numHits = cmd?.effect?.number_of_hits || 1;
        let moveSoulGain = cmd.soulMeter?.meterCharge + (numHits > 1 ? 'x'+numHits : '') ?? '---';
        let moveSoulGauge = cmd.soulMeter?.chargeNeeded ?? '---';

        let moveScaling = cmd.effect?.scaling && cmd.effect?.scaling !== 'None' ? cmd.effect?.scaling : '---';
        let noScaling =moveScaling.innerText === '---';

        let moveAttribute = cmd.effect?.attribute && cmd.effect?.attribute !== 'None' ? cmd.effect?.attribute : '---';
        let noAttribute = !(cmd.effect?.attribute && cmd.effect?.attribute !== 'None');



        let noInspirits = (!cmd.inspirits || cmd.inspirits.length === 0) && !(cmd.effect?.stun > 0);

        let newInspArray = cmd.inspirits?.split('\n') ?? [];
        if(cmd.effect?.stun > 0) newInspArray.push('Stuns small foes for a while.');
        let inspiritText = newInspArray.join('\n').replaceAll(/^\n*|\n*$/g,'');

        if(wrapContainer) elementText+=`<div class="moveDataContainer" style="--separator_width: ${30 + 70*(0.7**(4-level))}%;">`;



        elementText +=
            `
            <div class="data-text ${showHitboxText ? '' : 'hidden'}">This move has a hitbox that lasts for <span class="numeric">${NUMBER_FORMAT.format(cmd.hitbox?.hitbox_time)+'s'}</span>, with <span class="numeric">${NUMBER_FORMAT.format(cmd.hitbox?.time_between_hits)+'s'}</span> between each hit.</div>
            <div class="data-text ${!(cmd.effect?.move_type === 'Drain') ? 'hidden' : ''}">This move heals the user by <span class="numeric">25%</span> of the damage dealt.</div>
            <div class="moveStats ${technicType} param">
                <div class="moveInfo">
                    <div class="infoTitle">Class</div>
                    <div class="infoValue text">${getMoveClass(cmd) ?? '---'}</div>
                </div>
    
                <div class="moveInfo param-only">
                    <div class="infoTitle ${noTarget ? 'noValue':''}">Target</div>
                    <div class="infoValue">${moveTarget}</div>
                </div>
    
                <div class="moveInfo">
                    <div class="infoTitle">Power</div>
                    <div class="infoValue numeric">${movePower}</div>
                </div>
    
                <div class="moveInfo">
                    <div class="infoTitle">Cooldown</div>
                    <div class="infoValue numeric">${moveCooldown}</div>
                </div>
    
                <div class="moveInfo param-only">
                    <div class="infoTitle">Crit Rate</div>
                    <div class="infoValue numeric">${moveCritRate}</div>
                </div>
    
                <div class="moveInfo param-only noSoultimate">
                    <div class="infoTitle">Soul Gain</div>
                    <div class="infoValue numeric">${moveSoulGain}</div>
                </div>
    
                <div class="moveInfo soultimate">
                    <div class="infoTitle">Gauge</div>
                    <div class="infoValue numeric">${moveSoulGauge}</div>
                </div>
    
                <div class="moveInfo">
                    <div class="infoTitle ${noScaling ? 'noValue':''}">Scaling</div>
                    <div class="infoValue text">${moveScaling}</div>
                </div>
    
                <div class="moveInfo param-only">
                    <div class="infoTitle ${noAttribute ? 'noValue':''}">Attribute</div>
                    <div class="infoValue text">${moveAttribute}</div>
                </div>
            </div>
            <div class="data-text ${noInspirits ? 'hidden':''}">${inspiritText}</div>
        `;

        if(wrapContainer) elementText+=`</div>`;
    }
    else if(cmd.type === 'random') {
        elementText += `<div class="data-text">This is a random move that can use any of the following moves:</div>`;


        for(let i=0; i<cmd?.random?.length; i++) {
            let randomData = cmd.random[i];
            let randomCMD = orge_technic_cmd_data[randomData.id];

            if(randomCMD == null) continue;


            if(i>0) elementText += `<hr class="${level >= 2 ? 'thick-separator' : level == 1 ? 'thin-separator' : 'no-separator'}">`;


            elementText +=
                `<div class="moveDataContainer" style="--separator_width: ${30 + 70*(0.7**(4-level))}%;">
                    <div class="data-text">The following move has a <span class="numeric">${NUMBER_FORMAT.format(randomData.odds)}%</span> chance of being used.</div>`;

            elementText += generateMoveDetails(randomCMD,true,technicType,false,level-1);

            elementText += `</div>`;

        }
    }
    else if(cmd.type === 'chain') {
        elementText += `<div class="data-text">This is a ${cmd.chain.length}-step move. If the button is pressed again before the previous move is over, the next one in the sequence is used.</div>`;


        for(let i=0; i<cmd?.chain?.length; i++) {
            let chainCMD = orge_technic_cmd_data[cmd.chain[i]];
            if(chainCMD == null) continue;


            if(i>0) elementText += `<hr class="${level >= 2 ? 'thick-separator' : level == 1 ? 'thin-separator' : 'no-separator'}">`;


            elementText +=
                `<div class="moveDataContainer" style="--separator_width: ${30 + 70*(0.7**(4-level))}%;">
                    <div class="data-text">Step ${i+1}:</div>`;

            elementText += generateMoveDetails(chainCMD,true,technicType,false,level-1);

            elementText += `</div>`;
        }


        if(cmd.is_blitz_chain) {
            elementText += `<hr class="${level >= 2 ? 'thick-separator' : level == 1 ? 'thin-separator' : 'no-separator'}">`;
            elementText += `<div class="data-text">This move has the following finisher:</div>`;
            elementText += generateMoveDetails(orge_technic_cmd_data[BLITZ_FINISHER],true,false,technicType,level-1);
        }
    }


    if(cmd.link) {
        if(showedPreviousText) elementText += `<hr class="${level >= 2 ? 'thick-separator' : level == 1 ? 'thin-separator' : 'no-separator'}">`;

        let newLinkArray = cmd.link.filter(linkData => !hasNoEffect(orge_technic_cmd_data[linkData.move_ID]));
        elementText += `<div class="data-text">This move uses the following ${newLinkArray.length > 1 ? newLinkArray.length+' ' : ''}move${newLinkArray.length > 1 ? 's' : ''}:</div>`;

        for(let i=0; i<newLinkArray.length; i++) {

            let linkData = newLinkArray[i];

            if (i > 0) elementText += `<hr class="${level >= 2 ? 'thick-separator' : level == 1 ? 'thin-separator' : 'no-separator'}">`;

            elementText +=
                `<div class="moveDataContainer" style="--separator_width: ${30 + 70*(0.7**(4-level))}%;">`;
            //<div class="data-text">The following is used at a <span class="numeric">${NUMBER_FORMAT.format(linkData.angle)}°</span> angle.</div>

            elementText += generateMoveDetails(orge_technic_cmd_data[linkData.move_ID], false, technicType, false, level - 1);

            elementText += `</div>`;
        }

    }

    showedPreviousText ||= cmd.link;
    let chargedCMD = cmd.chargedCMD || orge_technic_cmd_data[cmd.charged];
    if(chargedCMD) {
        if(showedPreviousText) elementText += `<hr class="fullwidth ${level >= 2 ? 'thick-separator' : level == 1 ? 'thin-separator' : 'no-separator'}">`;

        elementText += `<div class="data-text">When charged, the move has the following properties:</div>`;

        elementText += generateMoveDetails(chargedCMD,false,technicType,true,level);

    }


    return elementText;
}

function hasNoEffect(cmd) {
    return cmd == null ||
        cmd.type === 'param' && (
            !cmd.effect ||
            (cmd.effect?.scaling === 'None' && (!cmd.inspirits || cmd.inspirits.length === 0)) ||
            cmd.hitbox?.target === 'Unknown' ||
            cmd.hitbox?.hit_type === 'Unknown'
        );
}



function closeInfoPopup() {
    let infoContainer = document.getElementById('infoPopupContainer');
    infoContainer.addEventListener('transitionend', function () {
        this.close();
        let moveDetails = document.getElementsByClassName('moveDetailsSection');
        for(let i= 0; i < moveDetails.length; i++) moveDetails[i].classList.remove('open');
    },{once:true});
    infoContainer.classList.remove('open');

    history.pushState(null,null,location.pathname+location.search);
}


function normalizeString(str) {
    return str?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "");
}

function switchTab(button) {
    if(!(button instanceof HTMLElement)) return;

    let allButtons = document.getElementsByClassName('tabButton');
    for(let i=0; i < allButtons.length; i++) {
        if(allButtons[i] == button) continue;

        allButtons[i].classList.remove('active');
        let tab = document.getElementById(allButtons[i].dataset.tab);
        if(tab !== null) tab.classList.remove('active');
    }

    button.classList.add('active');
    let tab = document.getElementById(button.dataset.tab);
    if(tab !== null) tab.classList.add('active');


}



function getMoveClass(cmd) {
    if(!(cmd.effect?.move_type !== 'Unknown'
        && (cmd.effect?.scaling !== 'None' || cmd.effect?.move_type?.includes('Status'))
        || cmd?.inspirits?.length > 1)) return 'Status';

    return cmd.effect?.move_type === 'Heal' ? 'Heal' :
            cmd.effect?.move_type === 'Attack' || cmd.effect?.move_type === 'Drain'  ? 'Attack' :
            'Status';
}

function getAllMoveClasses(cmd) {
    if(!cmd) return '';

    let moveClasses = new Set();

    let otherMoveIDs = [];
    cmd.link?.forEach((element) => otherMoveIDs.push(element.move_ID));
    cmd.random?.forEach((element) => otherMoveIDs.push(element.id));
    cmd.chain?.forEach((element) => otherMoveIDs.push(element));
    if(cmd.is_blitz_chain) otherMoveIDs.push(BLITZ_FINISHER);
    if(cmd.type === 'param') otherMoveIDs.unshift(cmd.ID);


    otherMoveIDs.forEach((id) => {
        let otherMoveCMD = orge_technic_cmd_data[id];
        if(!otherMoveCMD.effect) return;

        if(
            otherMoveCMD.effect?.move_type !== 'Unknown'
            && (otherMoveCMD.effect?.scaling !== 'None'
                || otherMoveCMD.effect?.move_type?.includes('Status'))
            || otherMoveCMD?.inspirits?.length > 1
        ) {
            moveClasses.add(getMoveClass(otherMoveCMD));
        }
    });


    if(moveClasses.size > 1) moveClasses.delete('Status');

    if(moveClasses.size === 0) return 'Status';
    else {
        let orderedClasses = Array.from(moveClasses.values()).sort();
        return orderedClasses.join('/');
    }
}

