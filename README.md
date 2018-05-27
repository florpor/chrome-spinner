## chrome-spinner

Chrome-spinner allows you to spin headless Chrome processes seamlessly using puppeteer.

To work with chrome-spinner just use your favourite Chrome DevTools Protocol library 
(tested with [pychrome](https://github.com/fate0/pychrome), should work with others).

To run locally, use:
```
npm install
npm start
```

To use the docker image:
```
docker pull florpor/chrome-spinner
docker run --shm-size 1g -p 2229:2229 chrome-spinner
```
