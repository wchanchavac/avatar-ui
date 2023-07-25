module.exports = (req, res) => {


    const tmpUrl = req.query.image || '';
    let url = '';
    function getconfig(size = 'none') {
        let config = {
            size: 64,
            font: 'roboto_32px.fnt'
        };
        switch (size) {
            case 'small':
                config.font = 'roboto_64px.fnt'
                config.size = 128
                break;
            case 'medium':
                config.font = 'roboto_128px.fnt'
                config.size = 256
                break;
            case 'large':
                config.font = 'roboto_256px.fnt'
                config.size = 512
                break;
        }

        return config;
    }
    if (tmpUrl.length) {
        url = Buffer.from(tmpUrl, 'base64').toString('ascii');
    } else {
        res.status(500).send('need image param');
    }
    console.log('url image =>', url);
    var size = getconfig(req.query.size).size;
    var Jimp = require('jimp');
    Jimp.read(url).then(async image => {
        image
        .quality(60)
        .cover(size, size)
        .circle()
        .getBufferAsync(Jimp.MIME_PNG).then(buffer => {
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        }).catch(error => {
            console.log(error.message);
            res.status(500).send('Internal server error');
        });
    }).catch(error => {
        console.log(error.message);
        res.status(404).send(`image not found`);
    })
}