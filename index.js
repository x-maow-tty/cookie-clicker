'use strict';

// === IMPORTS ===

const { app, session, ipcMain, BrowserWindow, Menu, Tray } = require('electron');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');

const discord = require('discord-rich-presence')('1025380938772910100');

const fs = require('fs');
const path = require('path');

// ===============

const relative = (file) => path.join(__dirname, file);

const url = "https://orteil.dashnet.org/cookieclicker";
const blocker = ElectronBlocker.parse(fs.readFileSync(relative('easylist.txt'), 'utf-8'));

let win;
let tray;

// Prevent navigation
app.on('web-contents-created', (_event, contents) => {
    contents.on('will-navigate', (event) => {
        event.preventDefault()
    })
})

app.whenReady().then(() => {
    ipcMain.on('update-game-state', (_event, gameState) => {
        updateRichPresence(gameState);
    });
    ipcMain.on('game-ready', () => console.log('Game is ready!'));

    blocker.enableBlockingInSession(session.defaultSession);

    win = createWindow();
    tray = createTrayIcon(win);
});

const createWindow = () => {
    const win = new BrowserWindow({
        show: false,
        icon: relative('icon.png'),
        webPreferences: {
            preload: relative('preload.js')
        }
    });

    win.on('close', (event) => {
        event.preventDefault();
        win.hide();
    });

    win.removeMenu();
    win.maximize();
    win.loadURL(url);

    win.show();
    return win;
};

const createTrayIcon = (win) => {
    const menu = Menu.buildFromTemplate([
        { label: 'Show', type: 'normal', click: () => win.show() },
        { type: 'separator' },
        { label: 'Quit', type: 'normal', click: () => win.destroy() }
    ]);

    const tray = new Tray('icon.png');
    tray.setContextMenu(menu);    
    return tray;
};

let time;

const updateRichPresence = (gameState) => {
    if (!time) {
        time = Date.now();
    }
    discord.updatePresence({
        details: `${format(gameState.cookiesPerSecond)} cookies per second`,
        startTimestamp: time,
        largeImageKey: 'big_icon',
        largeImageText: `${gameState.bakeryName}'s Bakery`,
        smallImageKey: 'small_icon',
        smallImageText: `Prestige ${commas(gameState.prestigeLevel)}`,
        instance: false
    });
};

// Credit to Orteil - I am a lazy asshole (Also it's more accurate to use the game's logic anyways but whatever)
const notations = ['k','M','B','T','Qa','Qi','Sx','Sp','Oc','No'];
const format = (val) => {
    let base = 0, notationValue = '';
    if (!isFinite(val)) return 'Infinity';
    if (val >= 1000000) {
        val /= 1000;
        while (Math.round(val) >= 1000) {
            val /= 1000;
            base++;
        }
        if (base >= notations.length) {
            return 'Infinity';
        } else { 
            notationValue = notations[base];
        }
    }
    return (Math.round(val * 1000) / 1000) + notationValue;
};

// Credit to StackOverflow - https://stackoverflow.com/a/2901298
const commas = (val) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");