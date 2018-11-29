import * as fs from 'fs';
import * as path from 'path';
import { getDirectories, getFiles, imageRegex } from './utilities';
import { detectFace, initialize, getLabeledDescriptor } from './faceRecognition';
import { faceapi } from './commons';

const IMAGES_PATH = '/images/';
const TEST_PATH = '/test/';
const LOG_FILE_NAME = 'data.json';


const processImages = async () => {
	const directories = getDirectories(IMAGES_PATH);

	await initialize(); // Models for face detectFaceion

	directories.forEach(dir => {
		const files = getFiles(IMAGES_PATH + dir + '/');
		const filtered = files.filter(f => f.indexOf('.dat') === -1);

		filtered.forEach(file => {

			if (!imageRegex.test(file) || files.indexOf(file.replace(imageRegex, '.dat')) !== -1) {
				console.log('Skipping: ', file, ' Already processed.');
				return;
			}

			console.log('Processing file', file);
			const fullFilePath = path.join(__dirname + IMAGES_PATH + dir + '/' + file);
			const result = detectFace(fullFilePath, true);
		});

	});

};

const createLocalMap = async () => {
	var DB = [];

	const directories = getDirectories(IMAGES_PATH);

	directories.forEach(dir => {
		const files = getFiles(IMAGES_PATH + dir + '/');
		const datFiles = files.filter(f => f.indexOf('.dat') !== -1); // FIXME: can possibly go wrong here if name contains .dat

		datFiles.forEach(file => {
			const fullFilePath = path.join(__dirname + IMAGES_PATH + dir + '/' + file);
			DB.push({
				descriptorPath: fullFilePath, // This is the FullFaceDescription's descriptor
				dir,
				file,
				id: dir + '-' + file.replace('.dat', '')
			});
		});
	});

	writeLogFile(DB);
};

let faceMatcher = null;

const createFaceMatcher = async () => {

	// Load data from local DB
	const data = readLogFile();

	// Created LabeledDescriptors
	const labeledDescriptors = data.map(item => {
		let fileContent;
		try {
			fileContent = fs.readFileSync(item.descriptorPath, 'utf8');
		} catch (e) {
			console.log('File ' + item + ' doesnt exist');
			return;
		}
		const desc = JSON.parse(fileContent);
		const f32Array = new Float32Array(desc);
		return getLabeledDescriptor(item.id, f32Array);
	}).filter(l => !!l); // Create FaceMatcher with only existing files, ignore deleted ones
	console.log('LabeledDescriptors', labeledDescriptors);


	// Create FaceMatcher using LabeledDescriptors
	faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

	console.log('Face Matcher Ready');

	// const labels = faceMatcher.labeledDescriptors
	//     .map(ld => ld.label)

	// const refBoxesWithText = resultsRef
	//     .map(res => res.detection.box)
	//     .map((box, i) => new faceapi.BoxWithText(box, labels[i]))

	// const outRef = faceapi.createCanvasFromMedia(referenceImage) as any
	// faceapi.drawDetection(outRef, refBoxesWithText)
	// saveFile('referenceImage.jpg', outRef.toBuffer('image/jpeg'))

	// const queryBoxesWithText = resultsQuery.map(res => {
	//     const bestMatch = faceMatcher.findBestMatch(res.descriptor)
	//     return new faceapi.BoxWithText(res.detection.box, bestMatch.toString())
	// })
	// const outQuery = faceapi.createCanvasFromMedia(queryImage) as any
	// faceapi.drawDetection(outQuery, queryBoxesWithText)
	// saveFile('queryImage.jpg', outQuery.toBuffer('image/jpeg'))

};


const identifyFace = async (fullDesc) => {
	if (!faceMatcher) {
		console.error('FaceMatcher is not ready');
		return;
	}

	let bestMatch;
	const queryBoxesWithText = fullDesc.map(res => {
	    bestMatch = faceMatcher.findBestMatch(res.descriptor)
	    return new faceapi.BoxWithText(res.detection.box, bestMatch.toString());
	});

	console.log('Identified as', bestMatch.toString());
	return queryBoxesWithText;

};

const identifyDescriptor = async (descriptor) => {
	if (!faceMatcher) {
		console.error('FaceMatcher is not ready');
		return;
	}

	let bestMatch = faceMatcher.findBestMatch(descriptor);
	console.log('Identified as', bestMatch.toString());
	return bestMatch;

};

const loadSampleQueryImage = async () => {
	const file = getFiles(TEST_PATH).filter(f => imageRegex.test(f))[0];
	if (!file) return;
	const fullFilePath = path.join(__dirname + TEST_PATH + '/' + file);
	const result = await detectFace(fullFilePath, false);
	return result;
};

const readLogFile = () => {
	try {
		const data = fs.readFileSync(path.join(__dirname + IMAGES_PATH + '/' + LOG_FILE_NAME), 'utf8');
		let parsedData = [];
		if (data.length) {
			parsedData = JSON.parse(data);
		}
		return parsedData;
	} catch (e) {
		console.error(e);
	}
};

const writeLogFile = (data) => {
	try {
		fs.writeFileSync(
			path.join(__dirname + IMAGES_PATH + '/' + LOG_FILE_NAME), 
			JSON.stringify(data, null, 4),
		 	'utf8');
		console.log('Log File Written');
	} catch (e) {
		console.error(e);
	}
};

export {
	processImages,
	createLocalMap,
	createFaceMatcher,
	identifyFace,
	loadSampleQueryImage,
	identifyDescriptor
}
