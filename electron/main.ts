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
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
    });

    if (serve) {
        // dirname is target/electron/dist
        // require('electron-reload')(__dirname + '/electron', {electron: require(`${__dirname}/../../../node_modules/electron`)});
        win.loadURL('http://localhost:4200');
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, '../../dist/web/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

try {

    let serverProcess: ChildProcess;

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

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
        if (serve) {
            createWindow();
        } else {
            const waitOn = require('wait-on');
            const opts = {
                resources: ['http://127.0.0.1:8080/api/libraries/tracks'],
                delay: 0,
                interval: 200,
                timeout: 10000,
                headers: {'Accept': 'application/json'}
            };
            waitOn(opts, err => {
                if (err) { throw err; }
                createWindow();
            });
        }
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

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });

} catch (e) {
    app.quit();
    throw e;
}
