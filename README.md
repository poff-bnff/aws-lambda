# AWS Lambda back-end for pöff.ee

### Local setup
```shell
$ mkdir -p layers/nodejs
$ cp package*.json layers/nodejs
$ npm install
$ npm install --production --prefix layers/nodejs
```

### Local deploy to AWS
```shell
$ npm run deploy
```
