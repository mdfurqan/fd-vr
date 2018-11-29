import { canvas, faceapi, faceDetectionNet, faceDetectionOptions, saveFile } from './commons';
import { writeDescriptorToFile } from './utilities';

const REFERENCE_IMAGE = '../images/bbt1.jpg'
const QUERY_IMAGE = '../images/bbt4.jpg'

async function initialize() {
    await faceDetectionNet.loadFromDisk('../../weights')
    await faceapi.nets.faceLandmark68Net.loadFromDisk('../../weights')
    await faceapi.nets.faceRecognitionNet.loadFromDisk('../../weights')
}

async function detectFace(imgPath, save) {

    console.log('Detect face for path? ', imgPath);
    const referenceImage = await canvas.loadImage(imgPath)
    // const queryImage = await canvas.loadImage(QUERY_IMAGE)

    // Array<FullFaceDescription>
    const faceDescriptions = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)
        .withFaceLandmarks()
        .withFaceDescriptors()


    if (!faceDescriptions.length) {
        console.log('No face detected in the file', imgPath);
    }

    console.log('faceDescriptions image detected');

    // Write a DAT file 

    if (save) {

        const binaryFileName = imgPath.replace(/\.(png|bmp|jpg|jpeg)/, '.dat');

        writeDescriptorToFile(faceDescriptions[0].descriptor, binaryFileName);

        console.log('DAT File Written');
    }

    return faceDescriptions;
}

async function recognize(result) {
    const faceMatcher = new faceapi.FaceMatcher(result) // Create the FaceMatcher with LabeledDescriptors
    let bestMatch;
    const queryBoxesWithText = result.map(res => {
        bestMatch = faceMatcher.findBestMatch(res.descriptor)
        return new faceapi.BoxWithText(res.detection.box, bestMatch.toString())
    });
}

const getLabeledDescriptor = (label, descriptor) => {
    return new faceapi.LabeledFaceDescriptors(
        label,
        [descriptor]
    );
}

export {
    detectFace,
    initialize,
    recognize,
    getLabeledDescriptor
};
