const ipcRenderer = nodeRequire('electron').ipcRenderer;

let form = document.querySelector("#genreSelectionForm")
let selCharacters = document.querySelector("#CharacterSelection ul")
let selKeywords = document.querySelector("#KeywordSelection ul")

form.addEventListener('submit', function sendForm(event) {
    event.preventDefault(); // stop the form from submitting
    gS1 = event.target.querySelector('#genreSelect1')
    gS2 = event.target.querySelector('#genreSelect2')

    g1 = gS1.options[gS1.selectedIndex].value
    g2 = gS1.options[gS2.selectedIndex].value

    ipcRenderer.send('on-genre-selection', g1, g2)
});


ipcRenderer.on('setSelection:characters', function(e, characters){
    while (selCharacters.firstChild) {
        selCharacters.removeChild(selCharacters.firstChild);
    }

    for(var i=0; i < characters.length; i++){
        const itemText = document.createTextNode(characters[i])
        const li = document.createElement('li')
        li.appendChild(itemText)
        selCharacters.appendChild(li)
    }
});

ipcRenderer.on('setSelection:keywords', function(e, keywords){
    while (selKeywords.firstChild) {
        selKeywords.removeChild(selKeywords.firstChild);
    }

    for(var i=0; i < keywords.length; i++){
        const itemText = document.createTextNode(keywords[i])
        const li = document.createElement('li')
        li.appendChild(itemText)
        selKeywords.appendChild(li)
    }
});