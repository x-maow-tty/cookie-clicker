const { contextBridge, ipcRenderer, ipcMain } = require('electron');

// This is by far the most cursed code in this project.
// If you can find an easier way to do this, *please* tell me. I beg of you.

document.addEventListener("DOMContentLoaded", () => {
    inject(`
        const interval = setInterval(() => {
            if (Game && Game.ready && Game.ready == 1) {
                window.desktop.updateGameState({
                    bakeryName: Game.bakeryName,
                    cookiesPerSecond: Game.cookiesPs,
                    prestigeLevel: Game.prestige
                });
            }
        }, 10000);
    `)
})

function inject(code) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerText = code;
    document.getElementsByTagName("head")[0].appendChild(script);
}

contextBridge.exposeInMainWorld('desktop', {
    updateGameState: (gameState) => ipcRenderer.send('update-game-state', gameState)
});