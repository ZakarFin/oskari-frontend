/* eslint-disable import/no-webpack-loader-syntax, import/no-unresolved */
// libraries

import 'expose-loader?exposes=jQuery!jquery';
// registers global variable "MobileDetect" used in src/util.js:
import 'expose-loader?exposes=MobileDetect!mobile-detect';
import '../src/polyfills.js';

// Oskari global
import '../src/global.js';

// Oskari application helpers
import '../src/loader.js';
import '../src/oskari.app.js';
import '../src/BasicBundle.js';
// common css
import '../resources/css/forms.css';
import '../resources/css/portal.css';
