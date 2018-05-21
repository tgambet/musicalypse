import {app, BrowserWindow, screen} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {ChildProcess} from 'child_process';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// const asar = process.mainModule.filename.indexOf('app.asar') !== -1;

// try {
//     require('dotenv').config();
// } catch {
//     console.log('asar');
// }

function createWindow() {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    frame: false,
    width: size.width - 200,
    height: size.height - 200,
    minHeight: 450,
    minWidth: 350,
    show: false,
    backgroundColor: '#000'
  });

  if (serve) {
    // dirname is target/electron/dist
    require('electron-reload')(__dirname, {electron: require(`${__dirname}/../../../node_modules/electron`)});
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../../dist/electron/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('focus', () => {
    win.send('focus');
  });

  win.on('blur', () => {
    win.send('blur');
  });

}

try {

  const shouldQuit = app.makeSingleInstance(() => {
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      }
      win.focus();
    }
  });

  let serverProcess: ChildProcess;

  if (shouldQuit) {
    app.quit();
  } else {
    if (!serve) {
      serverProcess = require('child_process')
        .spawn(
          'bin\\musicalypse.bat',
          [],
          {
            cwd: './target/universal/stage',
            env: {
              'JAVA_OPTS': '-Dmusic.uploadFolder=./uploads'
            }
          }
        ).addListener('exit', code => {
          if (code === 1) {
            throw Error('Server exited unexpectedly.');
          }
        });
      serverProcess.stdout.addListener('data', chunk => {
        console.log(chunk.toString().replace(/\n$/, ''));
      });
      serverProcess.stderr.addListener('data', chunk => {
        console.error(chunk.toString().replace(/\n$/, ''));
      });
    }
  }

  const ipc = require('electron').ipcMain;
  const dialog = require('electron').dialog;

  ipc.on('open-file-dialog', function (event) {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function (directory) {
      if (directory) {
        event.sender.send('selected-directory', directory);
      }
    });
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createWindow();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      if (serverProcess) {
        serverProcess.stdin.write('\n');
        serverProcess.on('exit', app.quit);
      } else {
        app.quit();
      }
    }
  });

  // app.on('will-quit', () => {
  //   if (serverProcess) {
  //     serverProcess.stdin.write('\n');
  //     serverProcess.on('exit', app.quit);
  //   } else {
  //     app.quit();
  //   }
  // })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  console.log(e);
  app.exit(1);
}
