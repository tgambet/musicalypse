const prompt = require('prompt-sync')();
const fs = require('fs-extra');

const srcJRE = prompt('Path to JRE: ');
const destJRE = './target/jre';

fs.ensureDir(destJRE).then(() =>
  fs.copy(srcJRE, destJRE).then(() => {
    console.log('JRE copied.')
  }).catch(err => console.log(err))
);
