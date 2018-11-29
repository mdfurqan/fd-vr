import * as fs  from 'fs';
import * as path from 'path';

// const writeFloat32Array = (array, filename) => {
//     console.log('Writing f32array', [].slice.call(array).join(', '));
//     if (!filename)
//         filename = 'BinaryData_' + Math.round(Math.random() * 10e6) + '.dat';

//     const writeStream = fs.createWriteStream(filename);
//     // const data = new Float32Array([1.1, 2.2, 3.3, 4.4, 5.5]);
//     const buffer = new Buffer(array.length * 4);
//     for (let i = 0; i < array.length; i++) {
//         //write the float in Little-Endian and move the offset
//         buffer.writeFloatLE(array[i], i * 4);
//     }
//     writeStream.write(buffer);
//     writeStream.end();
//     console.log(filename + ' written to disk');
// };

const writeDescriptorToFile = (array, filename) => {

    console.log('Writing f32array', [].slice.call(array));

    if (!filename)
        filename = 'BinaryData_' + Math.round(Math.random() * 10e6) + '.dat';

    fs.writeFileSync(filename, JSON.stringify([].slice.call(array)));
    console.log(filename + ' written to disk');
};

const getDirectories = (dir) => {
    try {
        return fs.readdirSync(path.join(__dirname, dir)).filter(item => {
            try {
                return fs.statSync(path.join(__dirname + dir + '/' + item)).isDirectory()
            } catch (e) {
                return false;
            }
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}

const getFiles = (dir) => {
    try {
        return fs.readdirSync(path.join(__dirname, dir)).filter(item => {
            try {
                return !fs.statSync(path.join(__dirname + dir + '/' + item)).isDirectory()
            } catch (e) {
                return false;
            }
        });
    } catch (e) {
        console.error(e);
        return [];
    }
} 

const imageRegex = /\.(png|bmp|jpg|jpeg)/;

export {
    // writeFloat32Array,
    writeDescriptorToFile,
    getDirectories,
    getFiles,
    imageRegex
}

