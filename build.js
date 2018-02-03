const concat = require('concat');
const fse = require('fs-extra');

/* Concatenate JS files. Use a specific file order, to guarantee
 * that libraries are available for our app. */
const outputDir = 'dist/js/';
const outputFile = outputDir + 'app.js';

const order = [
    'src/js/vendor/pegasus.min.js',
    'src/js/vendor/note.min.js',
    'src/js/main.js'
];

// Make sure the directory exists.
fse.ensureDir(outputDir, (err) => {
    if (err) console.error(err);
    else concat(order, outputFile); // Go go power rangers!
});

// Copy some files.
fse.copy('src/vendor/', 'dist/vendor/')
   .then(() => console.log('Copied vendor files!'))
   .catch(err => console.error(err));
