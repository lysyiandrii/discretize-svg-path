## discretize-svg-path

Library for converting svg path to array of points

## Usage

``` javascript
var discretizePath = require('discretize-svg-path');
var path = 'M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80';
discretizePath(path); // [[10, 80], [10, 80], [21.03515625, 57.03125], ...]
```

## Installation

    $ npm install discretize-svg-path

## License

This library is released under an MIT-style license. That generally means that you are free to do almost anything you want with it as long as you give a bit of credit where credit is due. See the LICENSE file included for the actual legal limitations.