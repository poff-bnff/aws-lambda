# AWS Lambda back-end for pöff.ee

### Local deploy
```shell
$ mkdir -p layers/nodejs
$ cp package*.json layers/nodejs
$ npm install
$ npm install --production --prefix layers/nodejs
$ npm run deploy
```
