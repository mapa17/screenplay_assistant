const electron = require('electron');
const path = require('path');
const url = require('url');

const fs = require('fs');


// Load MOVIE Database
const MOVIE_DB_PATH = './mvdb.json';

// SET ENV
process.env.NODE_ENV = 'development';

const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'production'

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;
let MOVIEDB = {};

// Listen for app to be ready
app.on('ready', function(){
  // Create new window
  mainWindow = new BrowserWindow({width: 1100, height: 700, webPreferences: {nodeIntegration: true}});
  // Load html in window
  mainWindow.loadURL(`file://${__dirname}/mainWindow.html`);
  mainWindow.webContents.openDevTools();
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
    console.log(g1C, g1K)
    
    g2C = getCharacters(g2)
    g2K = getKeywords(g2)
    console.log(g2C, g2K)
 
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

function getKeywords(genre, num=4){
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

ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close(); 
    // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
    //addWindow = null;
  });
/*
// Handle add item window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height:200,
    title:'Add Shopping List Item'
  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes:true
  }));
  // Handle garbage collection
  addWindow.on('close', function(){
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
  mainWindow.webContents.send('item:add', item);
  addWindow.close(); 
  // Still have a reference to addWindow in memory. Need to reclaim memory (Grabage collection)
  //addWindow = null;
});

// Create menu template
const mainMenuTemplate =  [
  // Each object is a dropdown
  {
    label: 'File',
    submenu:[
      {
        label:'Add Item',
        click(){
          createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If OSX, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
*/