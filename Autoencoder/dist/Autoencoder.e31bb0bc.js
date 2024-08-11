// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"datas.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MnistData = exports.IMAGE_W = exports.IMAGE_H = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var IMAGE_H = 28;
exports.IMAGE_H = IMAGE_H;
var IMAGE_W = 28;
exports.IMAGE_W = IMAGE_W;
var IMAGE_SIZE = IMAGE_H * IMAGE_W;
var NUM_CLASSES = 10;
var NUM_DATASET_ELEMENTS = 65000;
var NUM_TRAIN_ELEMENTS = 55000;
var NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;
var MNIST_IMAGES_SPRITE_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
var MNIST_LABELS_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';
/**
 * A class that fetches the sprited MNIST dataset and provide data as
 * tf.Tensors.
 */

var MnistData =
/*#__PURE__*/
function () {
  function MnistData() {
    _classCallCheck(this, MnistData);
  }

  _createClass(MnistData, [{
    key: "load",
    value: function () {
      var _load = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var img, canvas, ctx, imgRequest, labelsRequest, _ref, _ref2, imgResponse, labelsResponse;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // Make a request for the MNIST sprited image.
                img = new Image();
                canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d');
                imgRequest = new Promise(function (resolve, reject) {
                  img.crossOrigin = '';

                  img.onload = function () {
                    img.width = img.naturalWidth;
                    img.height = img.naturalHeight;
                    var datasetBytesBuffer = new ArrayBuffer(NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4);
                    var chunkSize = 5000;
                    canvas.width = img.width;
                    canvas.height = chunkSize;

                    for (var i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
                      var datasetBytesView = new Float32Array(datasetBytesBuffer, i * IMAGE_SIZE * chunkSize * 4, IMAGE_SIZE * chunkSize);
                      ctx.drawImage(img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width, chunkSize);
                      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                      for (var j = 0; j < imageData.data.length / 4; j++) {
                        // All channels hold an equal value since the image is grayscale, so
                        // just read the red channel.
                        datasetBytesView[j] = imageData.data[j * 4] / 255;
                      }
                    }

                    _this.datasetImages = new Float32Array(datasetBytesBuffer);
                    resolve();
                  };

                  img.src = MNIST_IMAGES_SPRITE_PATH;
                });
                labelsRequest = fetch(MNIST_LABELS_PATH);
                _context.next = 7;
                return Promise.all([imgRequest, labelsRequest]);

              case 7:
                _ref = _context.sent;
                _ref2 = _slicedToArray(_ref, 2);
                imgResponse = _ref2[0];
                labelsResponse = _ref2[1];
                _context.t0 = Uint8Array;
                _context.next = 14;
                return labelsResponse.arrayBuffer();

              case 14:
                _context.t1 = _context.sent;
                this.datasetLabels = new _context.t0(_context.t1);
                // Slice the the images and labels into train and test sets.
                this.trainImages = this.datasetImages.slice(0, IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
                this.testImages = this.datasetImages.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
                this.trainLabels = this.datasetLabels.slice(0, NUM_CLASSES * NUM_TRAIN_ELEMENTS);
                this.testLabels = this.datasetLabels.slice(NUM_CLASSES * NUM_TRAIN_ELEMENTS);

              case 20:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
    /**
     * Get all training data as a data tensor and a labels tensor.
     *
     * @returns
     *   xs: The data tensor, of shape `[numTrainExamples, 28, 28, 1]`.
     *   labels: The one-hot encoded labels tensor, of shape
     *     `[numTrainExamples, 10]`.
     */

  }, {
    key: "getTrainData",
    value: function getTrainData() {
      var xs = tf.tensor4d(this.trainImages, [this.trainImages.length / IMAGE_SIZE, IMAGE_H, IMAGE_W, 1]);
      var labels = tf.tensor2d(this.trainLabels, [this.trainLabels.length / NUM_CLASSES, NUM_CLASSES]);
      return {
        xs: xs,
        labels: labels
      };
    }
    /**
     * Get all test data as a data tensor a a labels tensor.
     *
     * @param {number} numExamples Optional number of examples to get. If not
     *     provided,
     *   all test examples will be returned.
     * @returns
     *   xs: The data tensor, of shape `[numTestExamples, 28, 28, 1]`.
     *   labels: The one-hot encoded labels tensor, of shape
     *     `[numTestExamples, 10]`.
     */

  }, {
    key: "getTestData",
    value: function getTestData(numExamples) {
      var xs = tf.tensor4d(this.testImages, [this.testImages.length / IMAGE_SIZE, IMAGE_H, IMAGE_W, 1]);
      var labels = tf.tensor2d(this.testLabels, [this.testLabels.length / NUM_CLASSES, NUM_CLASSES]);

      if (numExamples != null) {
        xs = xs.slice([0, 0, 0, 0], [numExamples, IMAGE_H, IMAGE_W, 1]);
        labels = labels.slice([0, 0], [numExamples, NUM_CLASSES]);
      }

      return {
        xs: xs,
        labels: labels
      };
    }
  }]);

  return MnistData;
}();

exports.MnistData = MnistData;
},{}],"ui.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showTestResults = showTestResults;
exports.draw = draw;

function showTestResults(batch, output, epochs) {
  var testExamples = batch.shape[0];
  var element = document.getElementById('new');
  element.innerHTML = "<span style='display:block;'>After epochs = " + epochs + "</span>";

  for (var i = 0; i < testExamples; i++) {
    var image = batch.slice([i, 0], [1, batch.shape[1]]);
    var out = output.slice([i, 0], [1, batch.shape[1]]);
    var div = document.createElement('div');
    div.className = 'pred-container';
    var canvas = document.createElement('canvas');
    canvas.className = 'prediction-canvas';
    draw(image.flatten(), canvas);
    var canvas1 = document.createElement('canvas');
    canvas1.className = 'prediction-canvas';
    draw(out.flatten(), canvas1);
    div.appendChild(canvas1);
    div.appendChild(canvas);
    element.appendChild(div);
  }
}

function draw(image, canvas) {
  var width = 28,
      height = 28;
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');
  var imageData = new ImageData(width, height);
  var data = image.dataSync();

  for (var i = 0; i < height * width; ++i) {
    var j = i * 4;
    imageData.data[j + 0] = data[i] * 255;
    imageData.data[j + 1] = data[i] * 255;
    imageData.data[j + 2] = data[i] * 255;
    imageData.data[j + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _datas = require("./datas.js");

var ui = _interopRequireWildcard(require("./ui.js"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function createConvModel(n_layers, n_units, hidden) {
  //resnet-densenet-batchnorm
  this.latent_dim = Number(hidden); //final dimension of hidden layer

  this.n_layers = Number(n_layers); //how many hidden layers in encoder and decoder

  this.n_units = Number(n_units); //output dimension of each layer

  this.img_shape = [28, 28];
  this.img_units = this.img_shape[0] * this.img_shape[1]; // build the encoder

  var i = tf.input({
    shape: this.img_shape
  });
  var h = tf.layers.flatten().apply(i);
  h = tf.layers.batchNormalization(-1).apply(h);
  h = tf.layers.dense({
    units: this.n_units,
    activation: 'relu'
  }).apply(h);

  for (var j = 0; j < this.n_layers - 1; j++) {
    var tm = h;
    var addLayer = tf.layers.add();
    var h = tf.layers.dense({
      units: this.n_units,
      activation: 'relu'
    }).apply(h); //n hidden

    h = addLayer.apply([tm, h]);
    h = tf.layers.batchNormalization(0).apply(h);
  }

  var o = tf.layers.dense({
    units: this.latent_dim
  }).apply(h); //1 final

  this.encoder = tf.model({
    inputs: i,
    outputs: o
  }); // build the decoder

  var i = h = tf.input({
    shape: this.latent_dim
  });
  h = tf.layers.dense({
    units: this.n_units,
    activation: 'relu'
  }).apply(h);

  for (var j = 0; j < this.n_layers - 1; j++) {
    var tm = h;

    var _addLayer = tf.layers.add(); //n hidden


    var h = tf.layers.dense({
      units: this.n_units,
      activation: 'relu'
    }).apply(h);
    h = _addLayer.apply([tm, h]);
  }

  var o = tf.layers.dense({
    units: this.img_units
  }).apply(h); //1 final

  var o = tf.layers.reshape({
    targetShape: this.img_shape
  }).apply(o);
  this.decoder = tf.model({
    inputs: i,
    outputs: o
  }); // stack the autoencoder

  var i = tf.input({
    shape: this.img_shape
  });
  var z = this.encoder.apply(i); //z is hidden code

  var o = this.decoder.apply(z);
  this.auto = tf.model({
    inputs: i,
    outputs: o
  });
}

var epochs = 0,
    trainEpochs,
    batch;
var trainData;
var testData;
var b;
var model;

function train(_x) {
  return _train.apply(this, arguments);
}

function _train() {
  _train = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(model) {
    var e, validationSplit, element, lr, y, onBatchEnd;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            e = document.getElementById('batchsize');
            batch = Number(e.value);
            validationSplit = Number(0); // Get number of training epochs from the UI.

            element = document.getElementById('train-epochs');
            trainEpochs = Number(element.value);
            lr = Number(document.getElementById('lr').value);
            epochs = Number(epochs) + Number(trainEpochs);
            y = trainData.xs.reshape([-1, 28, 28]);
            model.auto.compile({
              optimizer: 'adam',
              loss: 'meanSquaredError',
              lr: lr
            });
            onBatchEnd = loadbar;
            _context.next = 12;
            return model.auto.fit(y, y, {
              batchSize: batch,
              validationSplit: validationSplit,
              epochs: trainEpochs,
              callbacks: [{
                onBatchEnd: loadbar
              }]
            });

          case 12:
            _context.next = 14;
            return showPredictions(model, epochs);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _train.apply(this, arguments);
}

function showPredictions(_x2, _x3) {
  return _showPredictions.apply(this, arguments);
}

function _showPredictions() {
  _showPredictions = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(model, epochs) {
    var testExamples, examples;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //Trivial Samples of autoencoder
            testExamples = 10;
            examples = data.getTestData(testExamples);
            tf.tidy(function () {
              var output = model.auto.predict(examples.xs.reshape([-1, 28, 28]));
              ui.showTestResults(examples.xs.reshape([-1, 28, 28]), output, epochs);
            });

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return _showPredictions.apply(this, arguments);
}

var data,
    vis = Number(500);

function run() {
  return _run.apply(this, arguments);
}

function _run() {
  _run = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            data = new _datas.MnistData();
            _context3.next = 3;
            return data.load();

          case 3:
            trainData = data.getTrainData();
            testData = data.getTestData();

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return _run.apply(this, arguments);
}

document.getElementById('vis').oninput = function () {
  vis = Number(document.getElementById('vis').value);
  console.log(vis);
};

function load() {
  return _load.apply(this, arguments);
}

function _load() {
  _load = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var ele, n_units, n_layers, hidden, elem;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            ele = document.getElementById('barc');
            ele.style.display = "none";
            n_units = document.getElementById('n_units').value;
            n_layers = document.getElementById('n_layers').value;
            hidden = document.getElementById('hidden').value;
            model = new createConvModel(n_layers, n_units, hidden); //load model

            elem = document.getElementById('new');
            elem.innerHTML = "Model Created!!!";
            epochs = 0;
            vis = Number(document.getElementById('vis').value);

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));
  return _load.apply(this, arguments);
}

load();

function runtrain() {
  return _runtrain.apply(this, arguments);
}

function _runtrain() {
  _runtrain = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var ele, elem;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            ele = document.getElementById('barc');
            ele.style.display = "block";
            elem = document.getElementById('new');
            elem.innerHTML = "";
            b = 0;
            _context5.next = 7;
            return train(model);

          case 7:
            //start training
            vis = Number(document.getElementById('vis').value);

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));
  return _runtrain.apply(this, arguments);
}

function loadbar() {
  var element = document.getElementById("bar");
  element.style.width = Math.min(Math.ceil(b * 100 * batch / (trainEpochs * 55000)), 100) + '%';
  element.innerHTML = Math.min(Math.ceil(b * 100 * batch / (trainEpochs * 55000)), 100) + '%';
  b++;
  console.log(b);
}

function normaltensor(prediction) {
  for (var i = 0; i < prediction.length; i++) {
    prediction[i] += 50;
    prediction[i] /= 100;
  }

  prediction = tf.tensor(prediction).toFloat();
  var inputMax = prediction.max();
  var inputMin = prediction.min();
  prediction = prediction.sub(inputMin).div(inputMax.sub(inputMin));
  return prediction;
}

function normal(prediction) {
  var inputMax = prediction.max(); //normailization

  var inputMin = prediction.min();
  prediction = prediction.sub(inputMin).div(inputMax.sub(inputMin));
  return prediction;
}

var container = document.getElementById('cn'); //plot2d area

var canvas = document.getElementById('celeba-scene');
var mot = document.getElementById('mot');
var cont = mot.getContext('2d');

function sample(obj) {
  //plotting
  obj.x = obj.x * vis;
  obj.y = obj.y * vis; // convert 10, 50 into a vector

  var y = tf.tensor2d([[obj.x, obj.y]]);
  var prediction = model.decoder.predict(y).dataSync(); //scaling

  prediction = normaltensor(prediction);
  prediction = prediction.reshape([28, 28]);
  prediction = prediction.mul(255).toInt(); //for2dplot
  // log the prediction to the browser console

  tf.browser.toPixels(prediction, canvas);
}

var mouse = {
  x: 0,
  y: 0
};
sample(mouse);
cont.fillStyle = "#DDDDDD";
cont.fillRect(0, 0, mot.width, mot.height);
mot.addEventListener('mousemove', function (e) {
  mouse.x = (e.pageX - this.offsetLeft) * 3.43;
  mouse.y = (e.pageY - this.offsetTop) * 1.9;
}, false); //mouse movement for 2dplot

mot.addEventListener('mousedown', function (e) {
  mot.addEventListener('mousemove', on, false);
}, false);
mot.addEventListener('mouseup', function () {
  mot.removeEventListener('mousemove', on, false);
}, false);

var on = function on() {
  cont.fillStyle = "#BBBBBB";
  cont.fillRect(0, 0, mot.width, mot.height);
  cont.fillStyle = "#000000";
  cont.fillRect(mouse.x - 10, mouse.y - 10, 40, 20);
  sample(mouse);
};

function plot2d() {
  load();
  var decision = Number(document.getElementById("hidden").value);

  if (decision === Number(2)) {
    container.style.display = "block";
  } else {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    container.style.display = "none"; //clearing canvas for higher dimensions
  }
}

var el = document.getElementById('Create'); //listeners

el.addEventListener('click', plot2d);
var element = document.getElementById('train');
element.addEventListener('click', runtrain);
document.addEventListener('DOMContentLoaded', run);
document.addEventListener('DOMContentLoaded', plot2d); //load model

var canv = document.getElementById('canv');
var outcanv = document.getElementById('outcanv');
var ct = outcanv.getContext('2d');
var ctx = canv.getContext('2d');

function clear() {
  ctx.clearRect(0, 0, canv.width, canv.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canv.width, canv.height); //for canvas autoencoding

  ct.clearRect(0, 0, outcanv.width, outcanv.height);
  ct.fillStyle = "#DDDDDD";
  ct.fillRect(0, 0, outcanv.width, outcanv.height);
}

document.getElementById('clear').addEventListener('click', clear);
document.getElementById('save').addEventListener('click', rundraw);
clear();
var mouse = {
  x: 0,
  y: 0
};
var last_mouse = {
  x: 0,
  y: 0
};
/* Mouse Capturing Work */

canv.addEventListener('mousemove', function (e) {
  last_mouse.x = mouse.x;
  last_mouse.y = mouse.y;
  mouse.x = (e.pageX - this.offsetLeft) / 1.34;
  mouse.y = (e.pageY - this.offsetTop) / 2.7;
}, false);
/* Drawing on Paint App */

ctx.lineWidth = 15;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.strokeStyle = 'white';
canv.addEventListener('mousedown', function (e) {
  canv.addEventListener('mousemove', onPaint, false);
}, false);
canv.addEventListener('mouseup', function () {
  canv.removeEventListener('mousemove', onPaint, false);
}, false);

var onPaint = function onPaint() {
  ctx.beginPath();
  ctx.moveTo(last_mouse.x, last_mouse.y);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.closePath();
  ctx.stroke();
};

function rundraw() {
  var sm = tf.browser.fromPixels(canv, 1);
  sm = sm.toFloat().resizeNearestNeighbor([28, 28]).reshape([-1, 28, 28]);
  sm = normal(sm);
  var pr = model.auto.predict(sm).dataSync();
  pr = normal(tf.tensor(pr).toFloat()).reshape([28, 28]).mul(255.0).toInt();
  tf.browser.toPixels(pr, outcanv);
}
},{"./datas.js":"datas.js","./ui.js":"ui.js"}]},{},["index.js"], null)
//# sourceMappingURL=/Autoencoder.e31bb0bc.map