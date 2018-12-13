import {app, BrowserWindow, screen, powerMonitor} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {ChildProcess} from 'child_process';

const fs = require('fs');
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;
const spawn = require('child_process').spawn;

const serve = process.argv.slice(1).some(val => val === '--serve');

const isPackaged: boolean = __dirname.indexOf('app.asar') !== -1;

const rootDirectory: string = path.normalize(
  isPackaged ?
    path.join(__dirname, '../../../../../') :
    path.join(__dirname, '../../../')
);

let win: BrowserWindow;
let serverProcess: ChildProcess;

function createWindow() {

  const size = screen.getPrimaryDisplay().workAreaSize;

  const windowSize = Math.min(size.height, size.width);

  // Create the browser window.
  win = new BrowserWindow({
    frame: false,
    width: windowSize - 50,
    height: windowSize - 200,
    minHeight: 450,
    minWidth: 350,
    show: false,
    backgroundColor: '#000',
    icon: path.join(rootDirectory, 'build/electron/assets/icons/64x64.png')
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

  powerMonitor.on('suspend', () => {
    win.webContents.send('suspend');
  });

}

function initialize() {

  ipc.on('open-file-dialog', function (event) {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function (directory) {
      if (directory) {
        event.sender.send('selected-directory', directory);
      }
    });
  });

  app.on('ready', () => {
    createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      stopServerAndQuit();
    }
  });

  app.on('will-quit', () => {
    stopServerAndQuit();
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      }
      win.focus();
    }
  });

  if (!serve) {
    startServer();
  }
}

function startServer() {

  function isJavaOnPath(): boolean {
    try {
      require('child_process').execSync('java -version');
      return true;
    } catch (e) {
      return false;
    }
  }

  const musicFolder = app.getPath('music');
  const cacheFolder = app.getPath('userData') + '/data';

  const javaExecutable = (process.platform === 'win32') ? 'java.exe' : 'java';
  const javaPath = path.join(rootDirectory, '/target/jre/bin/' + javaExecutable);
  const JAVACMD = fs.existsSync(javaPath) ? javaPath : 'java';

  if (JAVACMD === 'java' && !isJavaOnPath()) {
    dialog.showErrorBox(
      'Java is not installed or can\'t be found',
      'Please go to https://www.java.com/download/ and download and install Java before running Musicalypse. ' +
      'If you think this message is an error, please check your PATH environment variable to see if "java.exe" is accessible.'
    );
    console.error('Java couldn\'t be found');
    app.exit(1);
  }

  const stagePath = path.join(rootDirectory, 'target/universal/stage');

  const separator = (process.platform === 'win32') ? ';' : ':';
  const libs = fs.readdirSync(stagePath + '/lib').map(val => 'lib/' + val);
  const classPath = [
    libs.filter(lib => lib.indexOf('musicalypse') !== -1),
    ...libs.filter(lib => lib.indexOf('musicalypse') === -1)
  ].join(separator);

  serverProcess = spawn(
    JAVACMD,
    [`-Dmusic.library=${musicFolder}`, `-Dmusic.cacheFolder=${cacheFolder}`, '-cp', classPath, 'net.creasource.Main'],
    {
      cwd: stagePath
    }
  ).addListener('exit', code => {
    if (code === 1) {
      app.exit(1);
      throw Error('Server exited unexpectedly.');
    } else {
      app.exit(0);
    }
  }).addListener('error', (err: Error) => {
    dialog.showErrorBox(
      'Error',
      err.message
    );
    app.exit(1);
  });

  serverProcess.stdout.addListener('data', chunk => {
    console.log(chunk.toString().replace(/\n$/, ''));
    /*dialog.showMessageBox(
      {message: chunk.toString().replace(/\n$/, '')}
    );*/
  });

  serverProcess.stderr.addListener('data', chunk => {
    console.error(chunk.toString().replace(/\n$/, ''));
    /*dialog.showMessageBox(
      {message: chunk.toString().replace(/\n$/, '')}
    );*/
  });
}

function stopServerAndQuit() {
  if (serverProcess) {
    serverProcess.stdin.write('\n');
    serverProcess.on('exit', app.quit);
  } else {
    app.quit();
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  try {
    initialize();
  } catch (e) {
    dialog.showErrorBox(
      'Error', e.toString()
    );
    console.error('An error occurred!');
    console.error(e);
    app.exit(1);
  }
}

