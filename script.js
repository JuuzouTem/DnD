let currentData = []; 

document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('myDndData');
    if (savedData) {
        currentData = JSON.parse(savedData);
    } else {
        currentData = dndData;
    }
    populateFilters();
    renderFeatures(currentData);
});

function populateFilters() {
    const raceSelect = document.getElementById('race-filter');
    const classSelect = document.getElementById('class-filter');
    const races = new Set();
    const classes = new Set();

    currentData.forEach(item => {
        if (item.race && item.race !== "General") races.add(item.race);
        if (item.class && item.class !== "General") classes.add(item.class);
    });

    Array.from(races).sort().forEach(race => {
        const opt = document.createElement('option');
        opt.value = race;
        opt.textContent = race;
        raceSelect.appendChild(opt);
    });

    Array.from(classes).sort().forEach(className => {
        const opt = document.createElement('option');
        opt.value = className;
        opt.textContent = className;
        classSelect.appendChild(opt);
    });
}

function renderFeatures(data) {
    const listContainer = document.getElementById('features-list');
    listContainer.innerHTML = ''; 

    data.forEach((feat) => {
        const originalIndex = currentData.findIndex(item => item.name === feat.name);

        const card = document.createElement('div');
        card.className = 'card';
        
        const raceTag = feat.race.toLowerCase().replace(/\s+/g, '-');
        const classTag = feat.class.toLowerCase().replace(/\s+/g, '-');

        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">${feat.name}</div>
                <button class="edit-btn" title="Zarı Düzenle" onclick="editDice(${originalIndex})">⚙️</button>
            </div>
            <div class="card-tags">
                <span class="tag race-${raceTag}">${feat.race}</span>
                <span class="tag class-${classTag}">${feat.class}</span>
            </div>
            <div class="card-desc">${feat.desc}</div>
            <div class="card-dice">
                <strong>Tür:</strong> ${feat.type} | <strong>Zar:</strong> <span class="dice-val">${feat.dice}</span>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function filterFeatures() {
    const raceVal = document.getElementById('race-filter').value;
    const classVal = document.getElementById('class-filter').value;
    const searchVal = document.getElementById('search-input').value.toLowerCase();

    let filtered = currentData.filter(item => {
        let raceMatch = false;
        if (raceVal === 'all') {
            raceMatch = true;
        } else {
            raceMatch = (item.race === raceVal);
        }

        let classMatch = false;
        if (classVal === 'all') {
            classMatch = true;
        } else {
            classMatch = (item.class === classVal);
        }

        const searchMatch = item.name.toLowerCase().includes(searchVal) || 
                            item.desc.toLowerCase().includes(searchVal);
        
        return raceMatch && classMatch && searchMatch;
    });

    filtered.sort((a, b) => {
        if (raceVal !== 'all' && classVal === 'all') {
            if (a.race === raceVal && b.race !== raceVal) return -1;
            if (a.race !== raceVal && b.race === raceVal) return 1;
            if (a.race === 'General' && b.race !== 'General') return 1;
            if (a.race !== 'General' && b.race === 'General') return -1;
            return a.name.localeCompare(b.name);
        }

        if (raceVal === 'all' && classVal !== 'all') {
            if (a.class === classVal && b.class !== classVal) return -1;
            if (a.class !== classVal && b.class === classVal) return 1;
            if (a.class === 'General' && b.class !== 'General') return 1;
            if (a.class !== 'General' && b.class === 'General') return -1;
            
            const raceDiff = a.race.localeCompare(b.race);
            if (raceDiff !== 0) return raceDiff;
            
            return a.name.localeCompare(b.name);
        }

        if (raceVal !== 'all' && classVal !== 'all') {
            
            const aRaceMatch = (a.race === raceVal);
            const aClassMatch = (a.class === classVal);
            const bRaceMatch = (b.race === raceVal);
            const bClassMatch = (b.class === classVal);
            
            const aScore = (aRaceMatch && aClassMatch) ? 0 : 
                          (aRaceMatch) ? 1 : 
                          (aClassMatch) ? 2 : 3;
            const bScore = (bRaceMatch && bClassMatch) ? 0 : 
                          (bRaceMatch) ? 1 : 
                          (bClassMatch) ? 2 : 3;
            
            if (aScore !== bScore) return aScore - bScore;
            
            return a.name.localeCompare(b.name);
        }

        const aIsGeneral = (a.race === 'General' && a.class === 'General');
        const bIsGeneral = (b.race === 'General' && b.class === 'General');
        
        if (aIsGeneral && !bIsGeneral) return 1;
        if (!aIsGeneral && bIsGeneral) return -1;
        
        const raceDiff = a.race.localeCompare(b.race);
        if (raceDiff !== 0) return raceDiff;
        
        const classDiff = a.class.localeCompare(b.class);
        if (classDiff !== 0) return classDiff;
        
        return a.name.localeCompare(b.name);
    });

    renderFeatures(filtered);
}

function editDice(index) {
    const newDice = prompt(`${currentData[index].name} için yeni değer:`, currentData[index].dice);
    if (newDice !== null) {
        currentData[index].dice = newDice;
        localStorage.setItem('myDndData', JSON.stringify(currentData));
        filterFeatures(); 
    }
}

function setDMRule() {
    const action = document.getElementById('target-action').value;
    const dc = document.getElementById('target-dc').value;
    const display = document.getElementById('active-rule');
    if(!dc) return;
    display.innerHTML = `<span>⚡ DM KURALI: <strong>${action || 'Eylem'}</strong> için Hedef Zar (DC): <strong>${dc}</strong></span>`;
    display.classList.remove('hidden');
}

function clearDMRule() {
    document.getElementById('active-rule').classList.add('hidden');
}

function resetAllData() {
    if(confirm("Tüm değişiklikler sıfırlanacak?")) {
        localStorage.removeItem('myDndData');
        location.reload();
    }
}