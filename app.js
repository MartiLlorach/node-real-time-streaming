const http = require("http")
const fs = require("fs")

var config = {
    port: 3000,
    host: "0.0.0.0",
    updateInterval: 500, //ms
    multipartBoundary: "fronteraimagenes"
}

//mock source video feed 
async function* imageGenerator() {
    let counter = 1
    while (true) {
        yield await new Promise((resolve) => {
            setTimeout(() => resolve(fs.readFileSync(`./img/${counter}.png`)), config.updateInterval)
        })
        counter == 5 ? counter = 1 : counter++
    }
}

function sendImage(imageBuffer, res) {
    res.write("--" + config.multipartBoundary + "\r\n");
    res.write("Content-Type: image/png\r\n");
    res.write("Content-Length: " + imageBuffer.length + "\r\n");
    res.write("\r\n");
    res.write(imageBuffer);
}

const server = http.createServer(async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'multipart/x-mixed-replace; boundary=--' + config.multipartBoundary
    });

    for await (const image of imageGenerator()) {
        sendImage(image, res)
    }
})

server.listen(config.port, config.host, () => {
    console.log(`listening on port ${server.address().port}`);
})