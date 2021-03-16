import { BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import cProcess from 'child_process';
import { autoUpdater } from 'electron-updater';
import { IPCRENDER_UPDATE_APP_INFO, STATICS_DOWNLOAD_PATH, STATICS_SAVE_PATH } from '@/constants/index';

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.allowDowngrade = true;

function copyStatics() {
  return new Promise((resolve, reject) => {
    cProcess.exec(`cp -r ${path.join(STATICS_DOWNLOAD_PATH, '/statics/')} ${STATICS_SAVE_PATH}`, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

function writeVersion(version: any) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, '/../extraResources/', 'version.json'), JSON.stringify({
      version
    }), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve('write version finish');
      }
    });
  });
}

interface UpdateSource {
  statics: boolean;
  app: boolean;
}

function findUpdateSource(cb: Function): Promise<UpdateSource> {
  return new Promise((resolve, reject) => {
    try {
      const hasStatics = fs.existsSync(path.join(STATICS_DOWNLOAD_PATH, 'statics'));
      const files = fs.readdirSync(path.join(STATICS_DOWNLOAD_PATH));
      const hasApp = files.some((file) => file.endsWith('AppImage'));
      cb(files);
      resolve({
        statics: !!hasStatics,
        app: !!hasApp
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default function updateApp(mainWindow: BrowserWindow) {
  function sendUpdateMessage(data: any) {
    mainWindow.webContents.send(IPCRENDER_UPDATE_APP_INFO, data);
  }

  autoUpdater.on('error', (error) => {
    sendUpdateMessage({
     cmd: 'error1',
     message: error == null ? 'unknown' : (error.stack || error).toString()
    });
    console.log('error', error);
  });

  autoUpdater.on('checking-for-update', (message) => {
    sendUpdateMessage({ cmd: 'checking-for-update', message: JSON.stringify(message) });
    console.log('checking-for-update', JSON.stringify(message));
  });

  autoUpdater.on('update-available', async (message) => {
    sendUpdateMessage({ cmd: 'update-available', message: JSON.stringify(message) });
    console.log('update-available', JSON.stringify(message));
    // try {
    //   const type = await findUpdateSource(sendUpdateMessage);
    //   sendUpdateMessage({ cmd: 'findypes', message: JSON.stringify(type) });
    //   if (type.statics) {
    //     // await copyStatics();
    //     if (!type.app) {
    //       // await writeVersion('1.2.1');
    //       // mainWindow.webContents.reload();
    //     }
    //   }
    //   // if (type.app) {
    //   autoUpdater.downloadUpdate();
    //   // }
    // } catch (error) {
    //   sendUpdateMessage({
    //     cmd: 'error2',
    //     message: JSON.stringify(error)
    //   });
    // }
  });

  autoUpdater.on('update-not-available', (message) => {
    sendUpdateMessage({ cmd: 'update-not-available', message: JSON.stringify(message) });
    console.log('update-not-available', JSON.stringify(message));
  });

  autoUpdater.on('download-progress', (progressObj) => {
    sendUpdateMessage({ cmd: 'download-progress', message: JSON.stringify(progressObj) });
    console.log('download-progress', JSON.stringify(progressObj));
  });

  autoUpdater.on('update-downloaded', (...message) => {
    sendUpdateMessage({
      cmd: 'update-downloaded',
      message: JSON.stringify(message)
    });
    console.log('update-downloaded', JSON.stringify(message));
    // autoUpdater.quitAndInstall();
  });

  ipcMain.on('check', () => {
    autoUpdater.checkForUpdates();
  });
  ipcMain.on('download', () => {
    autoUpdater.downloadUpdate();
  });
  ipcMain.on('install', () => {
    autoUpdater.quitAndInstall();
  });
  ipcMain.on('auto', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}
