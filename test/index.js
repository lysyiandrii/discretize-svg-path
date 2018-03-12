const fs = require('fs');
const rimraf = require('rimraf');
const svg2png = require('svg2png');
const resemblejs = require('node-resemble-js');
const paths = require('./test-data').paths;
const Promise = require('promise');
const args = process.argv.slice(2);

let discretizePath;
if (args[0] === '--debug') {
    discretizePath = require('../src/index');
} else {
    discretizePath = require('../dist/bundle');
}

function cleanTextResults(directory) {
    return new Promise((resolve, reject) => {
        rimraf(`test/test-results/${directory}/*.*`, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Testing: clean directory ./test-results/${directory}`);
                resolve();
            }
        });
    });
}

async function cleanAllTextResults() {
    await cleanTextResults('png/compared');
    await cleanTextResults('png/original');
    await cleanTextResults('png/discretized');
    await cleanTextResults('svg/original');
    await cleanTextResults('svg/discretized');
}

function writeFile(filePath, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`test/test-results/${filePath}`, content, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Testing: create file ./test-results/${filePath}`);
                resolve();
            }
        });
    });
}
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(`test/test-results/${filePath}`, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}

async function createSVGImageFromPath(imagePath, svgPath) {
    const svg =
        `<svg width="500" height="500" viewBox="0 0 500 500">
            <path
                fill="none"
                stroke="#000000"
                d="${svgPath}">
            </path>
        </svg>`;

    await writeFile(`svg/${imagePath}`, svg);
}

async function createSVGImageFromPoints(imagePath, svgPoints) {
    const svg =
        `<svg width="500" height="500" viewBox="0 0 500 500">
            <polyline
                fill="none"
                stroke="#000000"
                points="${svgPoints.map(point => point.join(',') + ' ')}"
            />
        </svg>`;

    await writeFile(`svg/${imagePath}`, svg);
}

async function createPNGImageFromSVG(imagePath, svgImagePath) {
    const buffer = svg2png.sync(await readFile(`svg/${svgImagePath}`));
    await writeFile(`png/${imagePath}`, buffer);
}

async function compareImages (original, discretized, index) {
    const originalFile = await readFile(`png/${original}`);
    const discretizedFile = await readFile(`png/${discretized}`);

    resemblejs(originalFile).compareTo(discretizedFile).ignoreColors().onComplete(function(data) {
        try {
            data.getDiffImage().pack().pipe(fs.createWriteStream(`test/test-results/png/compared/diff-${index}.png`));

            console.log(`Test ${discretized} result ${Number(data.misMatchPercentage) < 0.01} - ${Number(data.misMatchPercentage)}`);
        } catch (e) {
            console.log(e);
        }
    });
}

async function runTest(path, index) {
    await createSVGImageFromPath(`original/${index}.svg`, path);
    await createSVGImageFromPoints(`discretized/${index}.svg`, discretizePath(path));

    await createPNGImageFromSVG(`original/${index}.png`, `original/${index}.svg`);
    await createPNGImageFromSVG(`discretized/${index}.png`, `discretized/${index}.svg`);

    compareImages(`original/${index}.png`, `discretized/${index}.png`, index);
}

async function runTests() {
    await cleanAllTextResults();

    paths.forEach(runTest);
}

runTests();