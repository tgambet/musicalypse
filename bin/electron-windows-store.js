const zip = require('electron-windows-store/lib/zip');
const flatten = require('electron-windows-store/lib/flatten');
const setup = require('electron-windows-store/lib/setup');
const sign = require('electron-windows-store/lib/sign');
const assets = require('electron-windows-store/lib/assets');
const convert = require('electron-windows-store/lib/convert');
const finalSay = require('electron-windows-store/lib/finalsay');
const makeappx = require('electron-windows-store/lib/makeappx');
const manifest = require('electron-windows-store/lib/manifest');
const deploy = require('electron-windows-store/lib/deploy');
const makepri = require('electron-windows-store/lib/makepri');

const fs = require('fs-extra');

const options = {
  containerVirtualization: false,
  inputDirectory: __dirname + '/../dist/electron-jre/win-unpacked',
  outputDirectory: __dirname + '/../dist',
  flatten: false,
  packageVersion: '1.0.0.0',
  packageName: '53695CreaSource.Musicalypse',
  packageDisplayName: 'Musicalypse',
  packageDescription: 'A modern audio player built with Web technologies.',
  packageExecutable: 'app/Musicalypse.exe',
  assets: __dirname + '/../build/UWP/assets',
  manifest: __dirname + '/../build/UWP/AppXManifest.xml',
  deploy: false,
  publisher: 'CN=482ACF73-DAC8-4D98-BA01-FA590F32FB7E',
  publisherDisplayName: 'CreaSource',
  windowsKit: 'C:\\Program Files (x86)\\Windows Kits\\10\\App Certification Kit',
  devCert: __dirname + '/../dist/creasource.pfx',
  certPass: '',
  makePri: true,
  isModuleUse: true,
  /*finalSay: function () {
    return new Promise((resolve, reject) => resolve())
  }*/
};

const options2 = {
  ...options,
  windowsKit: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.17134.0\\x64'
};

function createCertIfNeeded() {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(options.devCert)) {
        sign.makeCert({
          publisherName: options.publisher,
          certFilePath: __dirname + '/../dist/',
          certFileName: 'creasource',
          program: options2,
          install: false
        }).then(() => resolve());
      } else {
        resolve()
      }
    } catch (e) {
      reject(e);
    }
  });
}

createCertIfNeeded()
  .then(() => setup(options))
  .then(() => flatten(options))
  .then(() => zip(options))
  .then(() => convert(options))
  .then(() => assets(options))
  .then(() => manifest(options))
  .then(() => makepri(options2))
  .then(() => finalSay(options))
  .then(() => makeappx(options))
  .then(() => sign.signAppx(options))
  .then(() => deploy(options));
