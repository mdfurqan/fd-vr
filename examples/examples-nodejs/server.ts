import { canvas, faceapi, faceDetectionNet, faceDetectionOptions, saveFile } from './commons';
import { processImages, createLocalMap, createFaceMatcher, loadSampleQueryImage, identifyFace, identifyDescriptor } from './core';

// Refer https://itnext.io/building-restful-web-apis-with-node-js-express-mongodb-and-typescript-part-1-2-195bdaf129cf

import app from "./app";

const PORT = 3031;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => res.send('Typescript backend Works'));
app.post('/identify_image', async (req, res) => {
    console.log('POST request received', req.body.fd);
    if (!req.body.fd) {
    	res.json({
    		error: 'Face Descriptor (fd) is missing in body params'
    	});
    	return;
    }
    const data = await identifyDescriptor(req.body.fd);
    res.json(data);
});

app.listen(PORT, async () => {
    console.log('Express server listening on port ' + PORT);

    // Start learning here

    // console.log('Testing write to disk');
    // writeFloat32Array(new Float32Array([1.1, 2.2, 3.3, 4.4, 5.5]), 'Float Array Test.dat');

    await processImages();
    await createLocalMap();
    await createFaceMatcher();

    // To use a sample image from 'test' folder and test, uncomment two lines below
    // const data = await loadSampleQueryImage();
    // await identifyFace(data);

});

// Set export TF_CPP_MIN_LOG_LEVEL=2