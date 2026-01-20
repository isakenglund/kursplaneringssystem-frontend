import { app, BrowserWindow, Menu, shell, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import http from "http";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'icon.png')
    : path.join(__dirname, '../icon.png');


let backendProcess = null;
let splashWindow = null;
let mainWindow = null;

const BACKEND_PORT = 8080;
const CHECK_INTERVAL = 500;
const MAX_RETRIES = 60;

function startBackend() {
    let jarPath;
    let javaExecutable;

    if (app.isPackaged) {
        jarPath = path.join(process.resourcesPath, "backend.jar");
        javaExecutable = path.join(process.resourcesPath, "java-runtime", "bin", "java.exe");
    } else {
        jarPath = path.join(__dirname, "../java-backend/backend.jar");
        javaExecutable = "java";
    }

    console.log("Startar backend...");
    backendProcess = spawn(javaExecutable, ['-jar', jarPath]);

    backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
    backendProcess.stderr.on('data', (data) => console.error(`Backend Error: ${data}`));

    backendProcess.on('close', (code) => {
        console.log(`Backend dog med kod: ${code}`);
        if (splashWindow) splashWindow.close();
        app.quit();
    });
}

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        alwaysOnTop: true,
        transparent: false,
        webPreferences: {
            nodeIntegration: false
        }
    });

    splashWindow.loadFile(path.join(__dirname, "splash.html"));
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }

    mainWindow.once('ready-to-show', () => {
        if (splashWindow) {
            splashWindow.close();
            splashWindow = null;
        }

        mainWindow.maximize();
        mainWindow.show();
    });
}

function checkBackendStatus(retryCount = 0) {
    const request = http.get(`http://localhost:${BACKEND_PORT}/actuator/health`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 401) {
            console.log("Backend är redo!");
            createMainWindow();
        } else {
            console.log(`Backend svarar med status ${res.statusCode}, startar appen...`);
            createMainWindow();
        }
    });

    request.on('error', (err) => {
        if (retryCount < MAX_RETRIES) {
            console.log(`Väntar på backend... (Försök ${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => checkBackendStatus(retryCount + 1), CHECK_INTERVAL);
        } else {
            console.error("Timeout: Backend startade aldrig.");
            if (splashWindow) splashWindow.close();
            app.quit();
        }
    });

    request.end();
}

function setAppMenu() {
    const isMac = process.platform === 'darwin';

    const template = [
        {
            label: 'Arkiv',
            submenu: [
                {
                    label: 'Importera kalender',
                    click: async () => {
                        await dialog.showMessageBox({
                            type: 'info',
                            title: 'Oops!',
                            message: 'Oops! Denna funktion saknar implementation!',
                            detail: 'Funktionen är inte under utveckling.',
                            buttons: ['OK']
                        });
                    }
                },
                {
                    label: 'Exportera kalender',
                    click: async () => {
                        await dialog.showMessageBox({
                            type: 'info',
                            title: 'Oops!',
                            message: 'Oops! Denna funktion saknar implementation!',
                            detail: 'Funktionen är inte under utveckling.',
                            buttons: ['OK']
                        });
                    }
                },
                { type: 'separator' },
                { label: 'Avsluta och stäng av', role: 'quit' }
            ]
        },

        {
            label: 'Visa',
            submenu: [
                { label: 'Ladda om', role: 'reload' },
                { label: 'Tvinga omladdning', role: 'forceReload' },
                { label: 'Utvecklarverktyg', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Återställ zoom', role: 'resetZoom' },
                { label: 'Zooma in', role: 'zoomIn' },
                { label: 'Zooma ut', role: 'zoomOut' },
                { type: 'separator' },
                { label: 'Helskärm', role: 'togglefullscreen' }
            ]
        },

        {
            label: 'Fönster',
            submenu: [
                { label: 'Minimera', role: 'minimize' },
                { label: 'Zoom', role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { label: 'Flytta fram alla', role: 'front' },
                    { type: 'separator' },
                    { label: 'Fönster', role: 'window' }
                ] : [
                    { label: 'Stäng', role: 'close' }
                ])
            ]
        },

        {
            label: 'Hjälp',
            role: 'help',
            submenu: [
                {
                    label: 'Öppna Manual (PDF)',
                    click: async () => {
                        let manualPath;
                        if (app.isPackaged) {
                            manualPath = path.join(process.resourcesPath, "manual.pdf");
                        } else {
                            manualPath = path.join(__dirname, "../manual.pdf");
                        }
                        await shell.openPath(manualPath);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Om HoardBoard',
                    click: () => {
                        app.setAboutPanelOptions({
                            applicationName: 'HoardBoard',
                            applicationVersion: '1.0.0',
                            copyright: `Copyright © ${new Date().getFullYear()} hoardTeam`,

                            credits: 'Developed by hoardTeam\n\nContributors:\nElov, Simon, Izzy, Imran, Isak',
                        });

                        app.showAboutPanel();
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    setAppMenu();
    createSplashWindow();
    startBackend();
    checkBackendStatus();
});

app.on("will-quit", () => {
    if (backendProcess) {
        backendProcess.kill();
        backendProcess = null;
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});