const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');


// SET ENV
//process.env.NODE_ENV = 'development';

const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'production'

// Load MOVIE Database
//const MOVIE_DB_PATH = isDev ? path.join(__dirname, 'mvdb.json') : path.join(process.resourcesPath, 'mvdb.json');
const MOVIE_DB_PATH = path.join(process.resourcesPath, 'mvdb.json');
//const MOVIE_DB_PATH = path.join(__dirname, 'mvdb.json');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;
let MOVIEDB = {};

// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({width: 1200, height: 1000, webPreferences: {nodeIntegration: true}});
  // Load html in window
  mainWindow.loadURL(`file://${__dirname}/mainWindow.html`);
  //mainWindow.webContents.openDevTools();
  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
  
  // Start mainWindow
  loadMainWindow();

  console.info("Resource folder is: " + process.resourcesPath);
  console.info("__dir folder is: " + __dirname);

});

const mainMenuTemplate = [
    //...(isMac ? [{label: 'Alpha', submenu:[{role: 'about'}]}] : []),
    ...(isMac ? [{role: 'appMenu'}] : []),
    ...(isDev ? [
            {
                label: 'Developer Tools',
                submenu:[
                {role: 'reload'},
                {
                    label: 'Toggle DevTools',
                    accelerator: 'Shift+CmdOrCtrl+I',
                    click(item, focusedWindow){focusedWindow.toggleDevTools();}
                }
                ]
            }] : []),
];


ipcMain.on('on-genre-selection', (event, g1, g2) => {
    //event.sender.send('asynchronous-reply', 'pong')

    console.log('Get data for genres: ' + g1 + ' ' + g2)
    g1C = getCharacters(g1)
    g1K = getKeywords(g1)
    
    g2C = getCharacters(g2)
    g2K = getKeywords(g2)
 
    mainWindow.webContents.send('setSelection:keywords', g1K.concat(g2K));
    mainWindow.webContents.send('setSelection:characters', g1C.concat(g2C));
  })

  function getFromDB(DB, genre, num){
    db = DB[genre]

    selection = []
    for(var i=0; i < num; i++){
      var pos = Math.round((Math.random() * db.length) + 1)
      selection.push(db[pos])
    }
    return selection
  }


function getCharacters(genre, num=3){
  return getFromDB(MOVIEDB['characters'], genre, num)
}

function getKeywords(genre, num=5){
  return getFromDB(MOVIEDB['keywords'], genre, num)
}

function unpackDictionaryFromJSON(jsonData){
    /**
     * Unpacks a json file containing lists within a list
     * 
     * The first level is used as the key's and the second as values
     */
    var newDict = {};
    
    keys = Object.keys(jsonData);
    for(let i=0; i<keys.length; i++){
        newDict[keys[i]] = jsonData[keys[i]];
    }
    return newDict;
}

function loadDB(filepath){

    var mvdb_json = fs.readFileSync(filepath);
    var mvdb = JSON.parse(mvdb_json);

    var characters = {};
    characters = unpackDictionaryFromJSON(mvdb[0]);

    var movie_genres = {};
    movie_genres = Object.keys(characters);

    var keywords = {};
    keywords = unpackDictionaryFromJSON(mvdb[1]);
   
    return [movie_genres, characters, keywords];
}


function loadMainWindow(){
    [MOVIEDB['genres'], MOVIEDB['characters'], MOVIEDB['keywords']] = loadDB(MOVIE_DB_PATH);
    console.log('Loaded Movie database with following genres:\n');
    console.log(MOVIEDB['genres']);
}
