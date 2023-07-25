'use-strict';

var debug = require('debug')('avatar-ui:');

module.exports = async (req, res) => {
    try {

        let allColors = ['#3DDC84','#0000FF','#000080','#4285F4','#073042','#3B40AB','#F86734','#00AA55', '#009FD4', '#B381B3', '#939393', '#E3BC00', '#D47500', '#DC2A2A'];

        function numberFromText(text=random()) {
            // numberFromText("AA");
            const charCodes = text
            .split('') // => ["A", "A"]
            .map(char => char.charCodeAt(0)) // => [65, 65]
            .join(''); // => "6565"

            return allColors[charCodes % allColors.length];
          }
        

        const random = () => {
            let str = '';

            for (let i = 0; i < 4; i++) {
                str += Math.floor((Math.random() * 9));
            }

            return str;
        }

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            } : null;
          }
          function rgbToHsl({r, g, b}){
            r /= 255, g /= 255, b /= 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
        
            if(max == min){
                h = s = 0; // achromatic
            }else{
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max){
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
        
            // return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
            return `hsl(${Math.floor(h * 360)},${Math.floor(s * 100)}%,${Math.floor(l * 100)}%)`
        }

        function getconfig(size = 'none') {
            let config = {
                size: 64,
                folder: 'open-sans-32-black',
                font: 'open-sans-32-black.fnt'
            };
            switch (size) {
                case 'small':
                    config.font = 'open-sans-64-black.fnt'
                    config.folder= 'open-sans-64-black',
                    config.size = 128
                    break;
                    case 'medium':
                        config.font = 'open-sans-128-black.fnt'
                        config.folder= 'open-sans-128-black',
                        config.size = 256
                        break;
                        case 'large':
                            config.font = 'open-sans-128-black.fnt'
                            config.folder= 'open-sans-128-black',
                            // config.font = 'roboto_256px.fnt'
                            // config.folder= 'open-sans-32-white',
                    config.size = 512
                    break;
            }

            return config;
        }

        const getLetters = (text = '') => {
            console.log(text);
            let letters = '';
            let tmp = '';
            const initials = text.split(/\s/);
            if (initials.length === 1) {
                // console.log(initials[0]);
                // letters +=  initials[0].slice(0, 1);
                letters += initials[0].slice(0, 2);
            } else {
                for (let i = 0; i < initials.length; i++) {
                    letters += initials[i].slice(0, 1);
                }
            }

            let max = Number.isInteger(input.length) ? input.length : 2;
            return letters.slice(0, max).toUpperCase();
        }

        var Jimp = require('jimp');


        const input = req.query;
        const config = getconfig(input.size);
        
        const cssColor = Jimp.cssColorToHex(rgbToHsl(hexToRgb(numberFromText(getLetters(input.text)))));// e.g. converts #FF00FF to 0xFF00FFFF
        
        
        let background = new Jimp(config.size, config.size, cssColor, (err, image) => {
            if (err) throw err
        });

        if (input.text) {
            let label = new Jimp(config.size, config.size, (err, image) => {
                if (err) throw err
            });
            var text = getLetters(input.text);
            console.log(text);
            console.log(text);
            console.log(text);
            console.log(text);
            
            const font = await Jimp.loadFont(`https://avatar-ui.vercel.app/static/${config.folder}/${config.font}`);
            // const font = await Jimp.loadFont(`http://localhost:3000/static/${config.font}`);
            label.print(font, 0, 0, {
                text: text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
                config.size,
                config.size
                );
            label.color([{ apply: 'xor', params: ['#ffffff'] }]); background.blit(label, 0, 0);
            
        }
        
        if (input.circle) {
            background.circle();
        }
        
        background.getBufferAsync(Jimp.MIME_PNG).then(buffer => {
            debug("step4");
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

            res.status(200).send(buffer);
        }).catch(error => {
            console.log("step4");
            res.status(200).send(error)
        });
    } catch (error) {
        debug(error);
        res.status(200).send(error);
    }
}