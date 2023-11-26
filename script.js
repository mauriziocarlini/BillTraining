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
    19: 'Default (not changed)',
};

let initialNatureValue;
let initialTeratypeValue;
let pokemonName;
let OTName;

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
            pokemonName = String.fromCharCode.apply(null, data.slice(88, 112));
            document.getElementById('pokemonNameValue').textContent = pokemonName;
            // POKEMON NAME END

            // OT START
            // OTName = String.fromCharCode.apply(null, data.slice(168, 194));
            // document.getElementById('OTNameValue').textContent = OTName;
            // OT END

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
            // document.getElementById('natureValue').textContent = `${natureText}`;
            initialNatureValue = natureValue;  // Salva il valore iniziale della natura
            // NATURE END

            // TERATYPE START
            const teratypeValue = view.getUint8(149);
            const teratypeText = teratypeDictionary[teratypeValue] || 'Default (not changed)';
            // document.getElementById('teratypeValue').textContent = teratypeText;
            initialTeratypeValue = teratypeValue;  // Salva il valore iniziale del teratype
            // TERATYPE END

            // Ability Patch START
            const byte10 = view.getUint8(10);
            const byte11 = view.getUint8(11);
            const abilityPatchCheckbox = document.getElementById('abilityPatchCheckbox');

            if (byte10 === 70 && byte11 === 6) {
                // Se i byte 10 e 11 hanno i valori desiderati, checka e disabilita la checkbox
                abilityPatchCheckbox.checked = true;
                abilityPatchCheckbox.disabled = true;
            } else {
                // Altrimenti, deseleziona e abilita la checkbox
                abilityPatchCheckbox.checked = false;
                abilityPatchCheckbox.disabled = false;
            }
            // Ability Patch END

            // Mostra la select solo quando viene caricato un file
            document.getElementById('playGround').style.display = 'block';

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

    // Chiedi all'utente il nome del file
    const fileName = prompt('Enter the name for the exported PK9 file (without extension):');

    if (!fileName) {
        alert('Please enter a valid file name.');
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

        // Modifica l'Ability Patch se la checkbox è selezionata
        if (document.getElementById('abilityPatchCheckbox').checked) {
            data.set([70, 6], 10);
        }

        const modifiedFile = new Blob([data], { type: 'application/octet-stream' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(modifiedFile);

        // Aggiungi il suffisso e imposta il nome del file
        downloadLink.download = `${fileName}.pk9`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    reader.readAsArrayBuffer(originalFile);
}

// Funzione per interpretare il byte come carattere alfanumerico
function interpretByte(byte) {
    // Verifica se il byte è un carattere stampabile ASCII
    if (byte >= 32 && byte <= 126) {
        return String.fromCharCode(byte);
    } else {
        // Se non è un carattere stampabile, restituisci una rappresentazione numerica
        return byte.toString();
    }
}

// // Funzione per mostrare l'interpretazione dei byte
// function displayByteInterpretation(data) {
//     const byteInterpretationDiv = document.getElementById('byteInterpretation');
//     byteInterpretationDiv.innerHTML = '<h2>Byte Interpretation</h2>';

//     for (let i = 0; i < data.length; i++) {
//         const byteValue = data[i];
//         const charRepresentation = interpretByte(byteValue);

//         const paragraph = document.createElement('span');
//         paragraph.textContent = `Byte ${i + 1}: ${charRepresentation}`;


//         byteInterpretationDiv.appendChild(paragraph);
//     }
// }

// Funzione chiamata quando cambia lo stato della checkbox Ability Patch
function handleAbilityPatchChange() {
    const abilityPatchCheckbox = document.getElementById('abilityPatchCheckbox');
    const fileInput = document.getElementById('fileInput');

    if (abilityPatchCheckbox.checked) {
        // Se la checkbox è selezionata, imposta i byte 10 e 11 ai valori desiderati
        const originalFile = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            data.set([70, 6], 10);

            const modifiedFile = new Blob([data], { type: 'application/octet-stream' });
            fileInput.files[0] = new File([modifiedFile], originalFile.name);
        };

        reader.readAsArrayBuffer(originalFile);
    } else {
        // Se la checkbox è deselezionata, reimposta i byte 10 e 11 ai valori originali
        handleFileSelect({ target: { files: [fileInput.files[0]] } });
    }
}

// Funzione chiamata quando viene cambiato il valore di una stat
function handleStatChange(statInputId) {
    const individualStatLimit = 252;

    // Assicurati che ogni singola stat non superi 252
    const updatedStatValue = Math.min(individualStatLimit, parseInt(document.getElementById(statInputId).value) || 0);
    document.getElementById(statInputId).value = updatedStatValue;

    const hp = parseInt(document.getElementById('hp').value) || 0;
    const atk = parseInt(document.getElementById('atk').value) || 0;
    const def = parseInt(document.getElementById('def').value) || 0;
    const spa = parseInt(document.getElementById('spa').value) || 0;
    const spd = parseInt(document.getElementById('spd').value) || 0;
    const spe = parseInt(document.getElementById('spe').value) || 0;

    const total = hp + atk + def + spa + spd + spe;

    // Aggiorna i valori delle stat per evitare che la somma superi 510
    if (total > 510) {
        const exceedingAmount = total - 510;
        const currentStatValue = parseInt(document.getElementById(statInputId).value) || 0;
        const updatedStatValue = Math.max(0, currentStatValue - exceedingAmount);

        // Aggiorna il valore della stat e il campo di input corrispondente
        document.getElementById(statInputId).value = updatedStatValue;
    }
}

// Aggiungi il gestore degli eventi "input" per ogni campo di input delle stat
document.getElementById('hp').addEventListener('input', () => handleStatChange('hp'));
document.getElementById('atk').addEventListener('input', () => handleStatChange('atk'));
document.getElementById('def').addEventListener('input', () => handleStatChange('def'));
document.getElementById('spa').addEventListener('input', () => handleStatChange('spa'));
document.getElementById('spd').addEventListener('input', () => handleStatChange('spd'));
document.getElementById('spe').addEventListener('input', () => handleStatChange('spe'));

