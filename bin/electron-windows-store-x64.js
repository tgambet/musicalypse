const convertToWindowsStore = require('electron-windows-store');
const prompt = require('prompt-sync')();

const windowsKit = prompt('Path to Windows Kit: ');

const fs = require('fs-extra');

const options = {
  containerVirtualization: false,
  inputDirectory: __dirname + '/../dist/electron/win-unpacked',
  outputDirectory: __dirname + '/../dist',
  packageVersion: '1.0.0.0',
  packageName: '53695CreaSource.Musicalypse',
  packageDisplayName: 'Musicalypse',
  packageDescription: 'A modern audio player built with Web technologies.',
  packageExecutable: 'app/Musicalypse.exe',
  assets: __dirname + '/../build/UWP/assets',
  manifest: __dirname + '/../build/UWP/AppXManifest_x64.xml',
  deploy: false,
  publisher: 'CN=482ACF73-DAC8-4D98-BA01-FA590F32FB7E',
  publisherDisplayName: 'CreaSource',
  windowsKit: windowsKit,
  devCert: __dirname + '/../dist/creasource.pfx',
  certPass: '',
  makePri: true,
};

// function createCertIfNeeded() {
//   return new Promise((resolve, reject) => {
//     try {
//       if (!fs.existsSync(options.devCert)) {
//         sign.makeCert({
//           publisherName: options.publisher,
//           certFilePath: __dirname + '/../dist/',
//           certFileName: 'creasource',
//           program: options2,
//           install: false
//         }).then(() => resolve());
//       } else {
//         resolve()
//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// }

convertToWindowsStore(options);
