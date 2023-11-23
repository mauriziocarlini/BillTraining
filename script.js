// Dizionario delle nature
const natureDictionary = {
    1: 'Lonely (+Atk / -Def)',
    2: 'Brave (+Atk / -Spe)',
    3: 'Adamant (+Atk / -SpA)',
    4: 'Naughty (+Atk / -SpD)',
    5: 'Bold (+Def / -Atk)',
    7: 'Relaxed (+Def / -Spe)',
    8: 'Impish (+Def / -SpA)',
    9: 'Lax (+Def / -SpD)',
    10: 'Timid (+Spe / -Atk)',
    11: 'Hasty (+Spe / -Def)',
    13: 'Jolly (+Spe / -SpA)',
    14: 'Naive (+Spe / -SpD)',
    15: 'Modest (+SpA / -Atk)',
    16: 'Mild (+SpA / -Def)',
    17: 'Quiet (+SpA / -Spe)',
    19: 'Rash (+SpA / -SpD)',
    20: 'Calm (+SpD / -Atk)',
    21: 'Gentle (+SpD / -Def)',
    22: 'Sassy (+SpD / -Spe)',
    23: 'Careful (+SpD / -SpA)'
};

// Dizionario dei teratipi
const teratypeDictionary = {
    0: 'Normal',
    1: 'Fighting',
    2: 'Flying',
    3: 'Poison',
    4: 'Ground',
    5: 'Rock',
    6: 'Bug',
    7: 'Ghost',
    8: 'Steel',
    9: 'Fire',
    10: 'Water',
    11: 'Grass',
    12: 'Electric',
    13: 'Psychic',
    14: 'Ice',
    15: 'Dragon',
    16: 'Dark',
    17: 'Fairy',
    19: 'Default'
};

let initialNatureValue;
let initialTeratypeValue;
let pokemonName;

function selectFile() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

// Funzione chiamata quando viene selezionato un file
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const view = new DataView(e.target.result);

            // POKEMON NAME START
            pokemonName = String.fromCharCode.apply(null, data.slice(88, 111));
            document.getElementById('pokemonNameValue').textContent = pokemonName;
            // POKEMON NAME END

            // STAT START
            const hp = view.getUint8(38);
            const atk = view.getUint8(39);
            const def = view.getUint8(40);
            const spa = view.getUint8(42);
            const spd = view.getUint8(43);
            const spe = view.getUint8(41);

            document.getElementById('hp').value = hp;
            document.getElementById('atk').value = atk;
            document.getElementById('def').value = def;
            document.getElementById('spa').value = spa;
            document.getElementById('spd').value = spd;
            document.getElementById('spe').value = spe;
            // STAT END

            // NATURE START
            const natureValue = view.getUint8(33);
            const natureText = natureDictionary[natureValue] || 'Neutral';
            document.getElementById('natureValue').textContent = `${natureText}`;
            initialNatureValue = natureValue;  // Salva il valore iniziale della natura
            // NATURE END

            // TERATYPE START
            const teratypeValue = view.getUint8(149);
            const teratypeText = teratypeDictionary[teratypeValue] || 'Default';
            document.getElementById('teratypeValue').textContent = teratypeText;
            initialTeratypeValue = teratypeValue;  // Salva il valore iniziale del teratype
            // TERATYPE END

            // Mostra la select solo quando viene caricato un file
            document.getElementById('setNature').style.display = 'block';
            document.getElementById('setTeratype').style.display = 'block';

            // Imposta le voci preselezionate in base ai valori iniziali
            document.getElementById('mintSelect').value = initialNatureValue;
            document.getElementById('teratypeSelect').value = initialTeratypeValue;

            // Chiamata a displayByteInterpretation
            displayByteInterpretation(data);
        };

        reader.readAsArrayBuffer(file);
    }
}

// Funzione chiamata quando si salva il file
function saveFile() {
    const hp = document.getElementById('hp').value;
    const atk = document.getElementById('atk').value;
    const def = document.getElementById('def').value;
    const spa = document.getElementById('spa').value;
    const spd = document.getElementById('spd').value;
    const spe = document.getElementById('spe').value;

    const total = parseInt(hp) + parseInt(atk) + parseInt(def) +
                    parseInt(spe) + parseInt(spa) + parseInt(spd);

    if (total > 510) {
        alert('Total cannot exceed 510.');
        return;
    }

    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Please upload a PK9 file.');
        return;
    }

    const originalFile = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);

        // Modifica solo le parti modificate dall'utente
        data.set([hp, atk, def, spe, spa, spd], 38);

        // Modifica la natura solo se è stata cambiata
        const selectedNatureValue = document.getElementById('mintSelect').value;
        if (selectedNatureValue !== initialNatureValue) {
            data.set([selectedNatureValue], 33);
        }

        // Modifica il teratype solo se è stato cambiato
        const selectedTeratypeValue = document.getElementById('teratypeSelect').value;
        if (selectedTeratypeValue !== initialTeratypeValue) {
            data.set([selectedTeratypeValue], 149);
        }

        const modifiedFile = new Blob([data], { type: 'application/octet-stream' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(modifiedFile);
      
        // Ottieni il nome del file originale
        const originalFileName = originalFile.name;

        // Aggiungi il suffisso e imposta il nome del file
        downloadLink.download = `${originalFileName.replace(".pk9", "")}-[Bill-Trained].pk9`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    reader.readAsArrayBuffer(originalFile);
}