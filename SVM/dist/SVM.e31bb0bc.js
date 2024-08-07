// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
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

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
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
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/svm/lib/svm.js":[function(require,module,exports) {
// MIT License
// Andrej Karpathy

var svmjs = (function(exports){

  /*
    This is a binary SVM and is trained using the SMO algorithm.
    Reference: "The Simplified SMO Algorithm" (http://math.unt.edu/~hsp0009/smo.pdf)
    
    Simple usage example:
    svm = svmjs.SVM();
    svm.train(data, labels);
    testlabels = svm.predict(testdata);
  */
  var SVM = function(options) {
  }

  SVM.prototype = {
    
    // data is NxD array of floats. labels are 1 or -1.
    train: function(data, labels, options) {
      
      // we need these in helper functions
      this.data = data;
      this.labels = labels;

      // parameters
      options = options || {};
      var C = options.C || 1.0; // C value. Decrease for more regularization
      var tol = options.tol || 1e-4; // numerical tolerance. Don't touch unless you're pro
      var alphatol = options.alphatol || 1e-7; // non-support vectors for space and time efficiency are truncated. To guarantee correct result set this to 0 to do no truncating. If you want to increase efficiency, experiment with setting this little higher, up to maybe 1e-4 or so.
      var maxiter = options.maxiter || 10000; // max number of iterations
      var numpasses = options.numpasses || 10; // how many passes over data with no change before we halt? Increase for more precision.
      
      // instantiate kernel according to options. kernel can be given as string or as a custom function
      var kernel = linearKernel;
      this.kernelType = "linear";
      if("kernel" in options) {
        if(typeof options.kernel === "string") {
          // kernel was specified as a string. Handle these special cases appropriately
          if(options.kernel === "linear") { 
            this.kernelType = "linear"; 
            kernel = linearKernel; 
          }
          if(options.kernel === "rbf") { 
            var rbfSigma = options.rbfsigma || 0.5;
            this.rbfSigma = rbfSigma; // back this up
            this.kernelType = "rbf";
            kernel = makeRbfKernel(rbfSigma);
          }
        } else {
          // assume kernel was specified as a function. Let's just use it
          this.kernelType = "custom";
          kernel = options.kernel;
        }
      }

      // initializations
      this.kernel = kernel;
      this.N = data.length; var N = this.N;
      this.D = data[0].length; var D = this.D;
      this.alpha = zeros(N);
      this.b = 0.0;
      this.usew_ = false; // internal efficiency flag

      // run SMO algorithm
      var iter = 0;
      var passes = 0;
      while(passes < numpasses && iter < maxiter) {
        
        var alphaChanged = 0;
        for(var i=0;i<N;i++) {
        
          var Ei= this.marginOne(data[i]) - labels[i];
          if( (labels[i]*Ei < -tol && this.alpha[i] < C)
           || (labels[i]*Ei > tol && this.alpha[i] > 0) ){
            
            // alpha_i needs updating! Pick a j to update it with
            var j = i;
            while(j === i) j= randi(0, this.N);
            var Ej= this.marginOne(data[j]) - labels[j];
            
            // calculate L and H bounds for j to ensure we're in [0 C]x[0 C] box
            ai= this.alpha[i];
            aj= this.alpha[j];
            var L = 0; var H = C;
            if(labels[i] === labels[j]) {
              L = Math.max(0, ai+aj-C);
              H = Math.min(C, ai+aj);
            } else {
              L = Math.max(0, aj-ai);
              H = Math.min(C, C+aj-ai);
            }
            
            if(Math.abs(L - H) < 1e-4) continue;
            
            var eta = 2*kernel(data[i],data[j]) - kernel(data[i],data[i]) - kernel(data[j],data[j]);
            if(eta >= 0) continue;
            
            // compute new alpha_j and clip it inside [0 C]x[0 C] box
            // then compute alpha_i based on it.
            var newaj = aj - labels[j]*(Ei-Ej) / eta;
            if(newaj>H) newaj = H;
            if(newaj<L) newaj = L;
            if(Math.abs(aj - newaj) < 1e-4) continue; 
            this.alpha[j] = newaj;
            var newai = ai + labels[i]*labels[j]*(aj - newaj);
            this.alpha[i] = newai;
            
            // update the bias term
            var b1 = this.b - Ei - labels[i]*(newai-ai)*kernel(data[i],data[i])
                     - labels[j]*(newaj-aj)*kernel(data[i],data[j]);
            var b2 = this.b - Ej - labels[i]*(newai-ai)*kernel(data[i],data[j])
                     - labels[j]*(newaj-aj)*kernel(data[j],data[j]);
            this.b = 0.5*(b1+b2);
            if(newai > 0 && newai < C) this.b= b1;
            if(newaj > 0 && newaj < C) this.b= b2;
            
            alphaChanged++;
            
          } // end alpha_i needed updating
        } // end for i=1..N
        
        iter++;
        //console.log("iter number %d, alphaChanged = %d", iter, alphaChanged);
        if(alphaChanged == 0) passes++;
        else passes= 0;
        
      } // end outer loop
      
      // if the user was using a linear kernel, lets also compute and store the
      // weights. This will speed up evaluations during testing time
      if(this.kernelType === "linear") {

        // compute weights and store them
        this.w = new Array(this.D);
        for(var j=0;j<this.D;j++) {
          var s= 0.0;
          for(var i=0;i<this.N;i++) {
            s+= this.alpha[i] * labels[i] * data[i][j];
          }
          this.w[j] = s;
          this.usew_ = true;
        }
      } else {

        // okay, we need to retain all the support vectors in the training data,
        // we can't just get away with computing the weights and throwing it out

        // But! We only need to store the support vectors for evaluation of testing
        // instances. So filter here based on this.alpha[i]. The training data
        // for which this.alpha[i] = 0 is irrelevant for future. 
        var newdata = [];
        var newlabels = [];
        var newalpha = [];
        for(var i=0;i<this.N;i++) {
          //console.log("alpha=%f", this.alpha[i]);
          if(this.alpha[i] > alphatol) {
            newdata.push(this.data[i]);
            newlabels.push(this.labels[i]);
            newalpha.push(this.alpha[i]);
          }
        }

        // store data and labels
        this.data = newdata;
        this.labels = newlabels;
        this.alpha = newalpha;
        this.N = this.data.length;
        //console.log("filtered training data from %d to %d support vectors.", data.length, this.data.length);
      }

      var trainstats = {};
      trainstats.iters= iter;
      return trainstats;
    }, 
    
    // inst is an array of length D. Returns margin of given example
    // this is the core prediction function. All others are for convenience mostly
    // and end up calling this one somehow.
    marginOne: function(inst) {

      var f = this.b;
      // if the linear kernel was used and w was computed and stored,
      // (i.e. the svm has fully finished training)
      // the internal class variable usew_ will be set to true.
      if(this.usew_) {

        // we can speed this up a lot by using the computed weights
        // we computed these during train(). This is significantly faster
        // than the version below
        for(var j=0;j<this.D;j++) {
          f += inst[j] * this.w[j];
        }

      } else {

        for(var i=0;i<this.N;i++) {
          f += this.alpha[i] * this.labels[i] * this.kernel(inst, this.data[i]);
        }
      }

      return f;
    },
    
    predictOne: function(inst) { 
      return this.marginOne(inst) > 0 ? 1 : -1; 
    },
    
    // data is an NxD array. Returns array of margins.
    margins: function(data) {
      
      // go over support vectors and accumulate the prediction. 
      var N = data.length;
      var margins = new Array(N);
      for(var i=0;i<N;i++) {
        margins[i] = this.marginOne(data[i]);
      }
      return margins;
      
    },
    
    // data is NxD array. Returns array of 1 or -1, predictions
    predict: function(data) {
      var margs = this.margins(data);
      for(var i=0;i<margs.length;i++) {
        margs[i] = margs[i] > 0 ? 1 : -1;
      }
      return margs;
    },
    
    // THIS FUNCTION IS NOW DEPRECATED. WORKS FINE BUT NO NEED TO USE ANYMORE. 
    // LEAVING IT HERE JUST FOR BACKWARDS COMPATIBILITY FOR A WHILE.
    // if we trained a linear svm, it is possible to calculate just the weights and the offset
    // prediction is then yhat = sign(X * w + b)
    getWeights: function() {
      
      // DEPRECATED
      var w= new Array(this.D);
      for(var j=0;j<this.D;j++) {
        var s= 0.0;
        for(var i=0;i<this.N;i++) {
          s+= this.alpha[i] * this.labels[i] * this.data[i][j];
        }
        w[j]= s;
      }
      return {w: w, b: this.b};
    },

    toJSON: function() {
      
      if(this.kernelType === "custom") {
        console.log("Can't save this SVM because it's using custom, unsupported kernel...");
        return {};
      }

      json = {}
      json.N = this.N;
      json.D = this.D;
      json.b = this.b;

      json.kernelType = this.kernelType;
      if(this.kernelType === "linear") { 
        // just back up the weights
        json.w = this.w; 
      }
      if(this.kernelType === "rbf") { 
        // we need to store the support vectors and the sigma
        json.rbfSigma = this.rbfSigma; 
        json.data = this.data;
        json.labels = this.labels;
        json.alpha = this.alpha;
      }

      return json;
    },
    
    fromJSON: function(json) {
      
      this.N = json.N;
      this.D = json.D;
      this.b = json.b;

      this.kernelType = json.kernelType;
      if(this.kernelType === "linear") { 

        // load the weights! 
        this.w = json.w; 
        this.usew_ = true; 
        this.kernel = linearKernel; // this shouldn't be necessary
      }
      else if(this.kernelType == "rbf") {

        // initialize the kernel
        this.rbfSigma = json.rbfSigma; 
        this.kernel = makeRbfKernel(this.rbfSigma);

        // load the support vectors
        this.data = json.data;
        this.labels = json.labels;
        this.alpha = json.alpha;
      } else {
        console.log("ERROR! unrecognized kernel type." + this.kernelType);
      }
    }
  }
  
  // Kernels
  function makeRbfKernel(sigma) {
    return function(v1, v2) {
      var s=0;
      for(var q=0;q<v1.length;q++) { s += (v1[q] - v2[q])*(v1[q] - v2[q]); } 
      return Math.exp(-s/(2.0*sigma*sigma));
    }
  }
  
  function linearKernel(v1, v2) {
    var s=0; 
    for(var q=0;q<v1.length;q++) { s += v1[q] * v2[q]; } 
    return s;
  }

  // Misc utility functions
  // generate random floating point number between a and b
  function randf(a, b) {
    return Math.random()*(b-a)+a;
  }

  // generate random integer between a and b (b excluded)
  function randi(a, b) {
     return Math.floor(Math.random()*(b-a)+a);
  }

  // create vector of zeros of length n
  function zeros(n) {
    var arr= new Array(n);
    for(var i=0;i<n;i++) { arr[i]= 0; }
    return arr;
  }

  // export public members
  exports = exports || {};
  exports.SVM = SVM;
  exports.makeRbfKernel = makeRbfKernel;
  exports.linearKernel = linearKernel;
  return exports;

})(typeof module != 'undefined' && module.exports);  // add exports to module.exports if in node.js

},{}],"index.js":[function(require,module,exports) {
var svm = require("svm");

var N = 10; //number of data points

var data = new Array(N);
var labels = new Array(N);
var wb; // weights and offset structure

var ss = 50.0; // scaling factor for drawing

var trainstats;
var dirty = true;
var degree_value = 3;
var rbfKernelSigma = 1.0;
var c_sig = 0.050;
var alpha = 0.32;
var svmC = 10.0;
var a_value = 1.0;
var SVM = new svm.SVM();
var kernelid = 0;
var c = document.getElementById("NPGcanvas");
var ctx = c.getContext('2d');
var covg = document.getElementById("covg");
var supp = document.getElementById("supp");
var kern = document.getElementById("kern");
var cdiv = document.getElementById("c");
var sig = document.getElementById("sig");
var a = document.getElementById("a");
var deg = document.getElementById("deg");
var alp = document.getElementById("alp");
var csig = document.getElementById("csig");
data[0] = [-0.4326, 1.1909];
data[1] = [3.0, 4.0];
data[2] = [0.1253, -0.0376];
data[3] = [0.2877, 0.3273];
data[4] = [-1.1465, 0.1746];
data[5] = [1.8133, 2.1139];
data[6] = [2.7258, 3.0668];
data[7] = [1.4117, 2.0593];
data[8] = [4.1832, 1.9044];
data[9] = [1.8636, 1.1677];
labels[0] = 1;
labels[1] = 1;
labels[2] = 1;
labels[3] = 1;
labels[4] = 1;
labels[5] = -1;
labels[6] = -1;
labels[7] = -1;
labels[8] = -1;
labels[9] = -1;
setChange(10);

function myinit() {
  retrainSVM();
}

function poly() {
  return function (v1, v2) {
    var s = 0;

    for (var q = 0; q < v1.length; q++) {
      s += v1[q] * v2[q] + a_value;
    }

    return Math.pow(s, degree_value);
  };
}

function sigmoid() {
  return function (v1, v2) {
    var s = 0;

    for (var q = 0; q < v1.length; q++) {
      s += v1[q] * v2[q];
    }

    return Math.tanh(alpha * s + c_sig);
  };
}

function hideSig() {
  document.getElementById("sigreport").style.display = "none";
  document.getElementById("slider2").style.display = "none";
}

function hideDeg() {
  document.getElementById("degreport").style.display = "none";
  document.getElementById("slider3").style.display = "none";
}

function hidea() {
  document.getElementById("areport").style.display = "none";
  document.getElementById("slider4").style.display = "none";
}

function hidealp() {
  document.getElementById("alpreport").style.display = "none";
  document.getElementById("slider5").style.display = "none";
}

function hidecsig() {
  document.getElementById("csigreport").style.display = "none";
  document.getElementById("slider6").style.display = "none";
}

function showSig() {
  document.getElementById("report").appendChild(document.getElementById("sigreport"));
  document.getElementById("rider").appendChild(document.getElementById("slider2"));
  document.getElementById("sigreport").style.display = "block";
  document.getElementById("slider2").style.display = "block";
}

function showDeg() {
  document.getElementById("report").appendChild(document.getElementById("degreport"));
  document.getElementById("rider").appendChild(document.getElementById("slider3"));
  document.getElementById("degreport").style.display = "block";
  document.getElementById("slider3").style.display = "block";
}

function showa() {
  document.getElementById("preport").appendChild(document.getElementById("areport"));
  document.getElementById("provider").appendChild(document.getElementById("slider4"));
  document.getElementById("areport").style.display = "block";
  document.getElementById("slider4").style.display = "block";
}

function showalp() {
  document.getElementById("report").appendChild(document.getElementById("alpreport"));
  document.getElementById("rider").appendChild(document.getElementById("slider5"));
  document.getElementById("alpreport").style.display = "block";
  document.getElementById("slider5").style.display = "block";
}

function showcsig() {
  document.getElementById("preport").appendChild(document.getElementById("csigreport"));
  document.getElementById("provider").appendChild(document.getElementById("slider6"));
  document.getElementById("csigreport").style.display = "block";
  document.getElementById("slider6").style.display = "block";
}

function retrainSVM() {
  if (kernelid == 0) {
    trainstats = SVM.train(data, labels, {
      kernel: 'linear',
      C: svmC
    });
    wb = SVM.getWeights();
    hideSig();
    hidea();
    hidealp();
    hidecsig();
    hideDeg();
  } else if (kernelid == 1) {
    trainstats = SVM.train(data, labels, {
      kernel: 'rbf',
      rbfsigma: rbfKernelSigma,
      C: svmC
    });
    showSig();
    hidea();
    hidealp();
    hidecsig();
    hideDeg();
  } else if (kernelid == 2) {
    trainstats = SVM.train(data, labels, {
      kernel: poly(),
      C: svmC
    });
    hideSig();
    showa();
    hidealp();
    hidecsig();
    showDeg();
  } else if (kernelid == 3) {
    trainstats = SVM.train(data, labels, {
      kernel: sigmoid(),
      rbfsigma: rbfKernelSigma,
      C: svmC
    });
    hideSig();
    hidea();
    showalp();
    showcsig();
    hideDeg();
  }

  dirty = true; // to redraw screen
}

function update() {}

function draw() {
  if (!dirty) return;
  ctx.clearRect(0, 0, WIDTH, HEIGHT); // draw decisions in the grid

  var density = 4.0;

  for (var x = 0.0; x <= WIDTH; x += density) {
    for (var y = 0.0; y <= HEIGHT; y += density) {
      var dec = SVM.marginOne([(x - WIDTH / 2) / ss, (y - HEIGHT / 2) / ss]);
      if (dec > 0) ctx.fillStyle = '#4169E1';else ctx.fillStyle = '#ffef00';
      ctx.fillRect(x - density / 2 - 1, y - density - 1, density + 2, density + 2);
    }
  } // draw datapoints. Draw support vectors larger


  ctx.strokeStyle = 'rgb(0,0,0)';

  for (var i = 0; i < N; i++) {
    if (labels[i] == 1) ctx.fillStyle = '#0080FF';else ctx.fillStyle = '#FFAA00';
    if (SVM.alpha[i] > 1e-2) ctx.lineWidth = 3; // distinguish support vectors
    else ctx.lineWidth = 1;
    drawCircle(data[i][0] * ss + WIDTH / 2, data[i][1] * ss + HEIGHT / 2, Math.floor(5));
  } // if linear kernel, draw decision boundary and margin lines


  if (kernelid == 0) {
    var xs = [-5, 5];
    var ys = [0, 0];
    ys[0] = (-wb.b - wb.w[0] * xs[0]) / wb.w[1];
    ys[1] = (-wb.b - wb.w[0] * xs[1]) / wb.w[1];
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.lineWidth = 1;
    ctx.beginPath(); // wx+b=0 line

    ctx.moveTo(xs[0] * ss + WIDTH / 2, ys[0] * ss + HEIGHT / 2);
    ctx.lineTo(xs[1] * ss + WIDTH / 2, ys[1] * ss + HEIGHT / 2); // wx+b=1 line

    ctx.moveTo(xs[0] * ss + WIDTH / 2, (ys[0] - 1.0 / wb.w[1]) * ss + HEIGHT / 2);
    ctx.lineTo(xs[1] * ss + WIDTH / 2, (ys[1] - 1.0 / wb.w[1]) * ss + HEIGHT / 2); // wx+b=-1 line

    ctx.moveTo(xs[0] * ss + WIDTH / 2, (ys[0] + 1.0 / wb.w[1]) * ss + HEIGHT / 2);
    ctx.lineTo(xs[1] * ss + WIDTH / 2, (ys[1] + 1.0 / wb.w[1]) * ss + HEIGHT / 2);

    for (var i = 0; i < N; i++) {
      if (SVM.alpha[i] < 1e-2) continue;

      if (labels[i] == 1) {
        ys[0] = (1 - wb.b - wb.w[0] * xs[0]) / wb.w[1];
        ys[1] = (1 - wb.b - wb.w[0] * xs[1]) / wb.w[1];
      } else {
        ys[0] = (-1 - wb.b - wb.w[0] * xs[0]) / wb.w[1];
        ys[1] = (-1 - wb.b - wb.w[0] * xs[1]) / wb.w[1];
      }

      var u = (data[i][0] - xs[0]) * (xs[1] - xs[0]) + (data[i][1] - ys[0]) * (ys[1] - ys[0]);
      u = u / ((xs[0] - xs[1]) * (xs[0] - xs[1]) + (ys[0] - ys[1]) * (ys[0] - ys[1]));
      var xi = xs[0] + u * (xs[1] - xs[0]);
      var yi = ys[0] + u * (ys[1] - ys[0]);
      ctx.moveTo(data[i][0] * ss + WIDTH / 2, data[i][1] * ss + HEIGHT / 2);
      ctx.lineTo(xi * ss + WIDTH / 2, yi * ss + HEIGHT / 2);
    }

    ctx.stroke();
  }

  ctx.fillStyle = 'rgb(0,0,0)';
  covg.innerHTML = "Converged in " + trainstats.iters + " iterations";
  var numsupp = 0;

  for (var i = 0; i < N; i++) {
    if (SVM.alpha[i] > 1e-2) numsupp++;
  }

  supp.innerHTML = "No. of Support Vectors: " + numsupp;
  kern.innerHTML = "Using Linear kernel";
  cdiv.innerHTML = "C = " + svmC.toPrecision(2);

  if (kernelid == 0) {
    document.getElementById("linear_info").style.display = "block";
    document.getElementById("poly_info").style.display = "none";
    document.getElementById("rbf_info").style.display = "none";
    document.getElementById("sigmoid_info").style.display = "none";
    kern.innerHTML = "Using Linear kernel";
    cdiv.innerHTML = "C = " + svmC.toPrecision(2);
  }

  if (kernelid == 1) {
    document.getElementById("linear_info").style.display = "none";
    document.getElementById("poly_info").style.display = "none";
    document.getElementById("rbf_info").style.display = "block";
    document.getElementById("sigmoid_info").style.display = "none";
    kern.innerHTML = "Using Gaussian kernel";
    cdiv.innerHTML = "C = " + svmC.toPrecision(2);
    sig.style.display = "list-item";
    csig.style.display = "none";
    a.style.display = "none";
    alp.style.display = "none";
    deg.style.display = "none";
    sig.innerHTML = "Gaussian Kernel Sigma: " + rbfKernelSigma.toPrecision(2);
  }

  if (kernelid == 2) {
    document.getElementById("linear_info").style.display = "none";
    document.getElementById("poly_info").style.display = "block";
    document.getElementById("rbf_info").style.display = "none";
    document.getElementById("sigmoid_info").style.display = "none";
    kern.innerHTML = "Using Polynomial kernel";
    cdiv.innerHTML = "C = " + svmC.toPrecision(2);
    deg.style.display = "list-item";
    sig.style.display = "none";
    alp.style.display = "none";
    csig.style.display = "none";
    deg.innerHTML = "Polynomial Kernel Degree: " + degree_value;
    a.style.display = "list-item";
    a.innerHTML = "Polynomial Kernel a: " + a_value.toPrecision(2);
  }

  if (kernelid == 3) {
    document.getElementById("linear_info").style.display = "none";
    document.getElementById("poly_info").style.display = "none";
    document.getElementById("rbf_info").style.display = "none";
    document.getElementById("sigmoid_info").style.display = "block";
    kern.innerHTML = "Using Sigmoid kernel";
    cdiv.innerHTML = "C = " + svmC.toPrecision(2);
    alp.style.display = "list-item";
    sig.style.display = "none";
    deg.style.display = "none";
    a.style.display = "none";
    alp.innerHTML = "Sigmoid Kernel alpha: " + alpha.toPrecision(2);
    csig.style.display = "list-item";
    csig.innerHTML = "Sigmoid Kernel c: " + c_sig.toPrecision(2);
  }
}

function drawCircle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function mouseClick(x, y, shiftPressed) {
  // add datapoint at location of click
  data[N] = [(x - WIDTH / 2) / ss, (y - HEIGHT / 2) / ss];
  labels[N] = shiftPressed ? 1 : -1;
  N += 1; // retrain the svm

  retrainSVM();
}

function keyUp(key) {
  if (key == 67) {
    // 'c'
    // clear the points
    data = data.splice(0, 10);
    labels = labels.splice(0, 10);
    N = 10;
    retrainSVM();
  }

  if (key == 76) {
    // 'l'
    // Switch to linear kernel
    kernelid = 0;
    retrainSVM();
  }

  if (key == 82) {
    // 'r'
    // Switch to rbf kernel
    kernelid = 1;
    retrainSVM();
  }

  if (key == 80) {
    // 'p'
    // Switch to polynomial kernel
    kernelid = 2;
    retrainSVM();
  }

  if (key == 83) {
    // 's'
    // Switch to sigmoid kernel
    kernelid = 3;
    retrainSVM();
  }

  if (key == 85) {
    // 'u'
    // Undo
    data = data.splice(0, N - 1);
    labels = labels.splice(0, N - 1);
    N = N - 1;
    retrainSVM();
  }
}

function keyDown(key) {} // UI stuff


function refreshC(event, ui) {
  var logC = ui.value;
  svmC = Math.pow(10, logC);
  $("#creport").text("C = " + svmC.toPrecision(2));
  retrainSVM();
}

function eventClick(e) {
  var x;
  var y;

  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  mouseClick(x, y, e.shiftKey);
}

function eventKeyUp(e) {
  var keycode = 'which' in e ? e.which : e.keyCode;
  keyUp(keycode);
}

function eventKeyDown(e) {
  var keycode = 'which' in e ? e.which : e.keyCode;
  keyDown(keycode);
}

function setChange(FPS) {
  canvas = document.getElementById('NPGcanvas');
  ctx = canvas.getContext('2d');
  WIDTH = canvas.width;
  HEIGHT = canvas.height;
  canvas.addEventListener('click', eventClick, false);
  document.addEventListener('keyup', eventKeyUp, true);
  document.addEventListener('keydown', eventKeyDown, true);
  setInterval(main, 1000 / FPS);
  myinit();
}

function main() {
  update();
  draw();
}

function refreshC(event, ui) {
  var logC = ui.value;
  svmC = Math.pow(10, logC);
  $("#creport").text("C = " + svmC.toPrecision(2));
  retrainSVM();
}

function refreshSig(event, ui) {
  var logSig = ui.value;
  rbfKernelSigma = Math.pow(10, logSig);
  $("#sigreport").text("Gaussian Kernel sigma = " + rbfKernelSigma.toPrecision(2));
  retrainSVM();
}

function refreshDeg(event, ui) {
  var logDeg = ui.value;
  degree_value = logDeg;
  $("#degreport").text("Polynomial Kernel degree = " + degree_value);
  retrainSVM();
}

function refreshA(event, ui) {
  var logA = ui.value;
  a_value = Math.pow(10, logA);
  $("#areport").text("Polynomial Kernel a = " + a_value.toPrecision(2));
  retrainSVM();
}

function refreshAlpha(event, ui) {
  var logAlpha = ui.value;
  alpha = Math.pow(10, logAlpha);
  $("#alpreport").text("Sigmoid Kernel alpha = " + alpha.toPrecision(2));
  retrainSVM();
}

function refreshCsig(event, ui) {
  var logCsig = ui.value;
  c_sig = Math.pow(10, logCsig);
  $("#csigreport").text("Sigmoid Kernel c-sigma = " + c_sig.toPrecision(2));
  retrainSVM();
}

$(function () {
  // for C parameter
  $("#slider1").slider({
    orientation: "horizontal",
    animate: "slow",
    slide: refreshC,
    max: 2.0,
    min: -2.0,
    step: 0.1,
    value: 0.0
  }); // for rbf kernel sigma

  $("#slider2").slider({
    orientation: "horizontal",
    animate: "slow",
    slide: refreshSig,
    max: 2.0,
    min: -2.0,
    step: 0.1,
    value: 0.0
  });
  $("#slider3").slider({
    orientation: "horizontal",
    animate: "slow",
    slide: refreshDeg,
    max: 8,
    min: 2,
    step: 1,
    value: 3
  });
  $("#slider4").slider({
    orientation: "horizontal",
    animate: "slow",
    slide: refreshA,
    max: 2.0,
    min: -2.0,
    step: 0.1,
    value: 0.0
  });
  $("#slider5").slider({
    orientation: "horizontal",
    animate: "slow",
    slide: refreshAlpha,
    max: 2.0,
    min: -2.0,
    step: 0.1,
    value: 0.0
  });
  $("#slider6").slider({
    orientation: "horizontal",
    animate: "slow",
    slide: refreshCsig,
    max: 2.0,
    min: -2.0,
    step: 0.1,
    value: 0.0
  });
  $("#slider1").css('border-color', 'rgb(255,0,0)');
  $("#slider2").css('border-color', 'rgb(0,180,0)');
  $("#slider3").css('border-color', 'rgb(0,180,0)');
  $("#slider4").css('border-color', 'rgb(0,0,255)');
  $("#slider5").css('border-color', 'rgb(0,180,0)');
  $("#slider6").css('border-color', 'rgb(0,0,255)');
  $("#slider1").css('background', 'rgb(247, 188, 188)');
  $("#slider2").css('background', 'rgb(192, 247, 188)');
  $("#slider3").css('background', 'rgb(192, 247, 188)');
  $("#slider4").css('background', 'rgb(188, 217, 247)');
  $("#slider5").css('background', 'rgb(192, 247, 188)');
  $("#slider6").css('background', 'rgb(188, 217, 247)');
  $(".ui-slider-handle").css('background', 'rgb(255,255,204)');
});
$(document).ready(function () {
  $("#collapseInfo").click(function () {
    $(this).toggleClass("active");

    if ($(this).hasClass("active")) {
      $(this).text("Show Less..");
    } else {
      $(this).text("Show More..");
    }
  });
  $("#collapseInst").click(function () {
    $(this).toggleClass("active");

    if ($(this).hasClass("active")) {
      $(this).text("Hide Instructions..");
    } else {
      $(this).text("Show Instructions..");
    }
  });
});
var prevKernel;
var prevData;
var prevLabel;

function getPrevKernel() {
  return prevKernel;
}

function getPrevData() {
  return prevData;
}

function getPrevLabel() {
  return prevLabel;
}

function setPrevKernel(kid) {
  prevKernel = kid;
}

function setPrevData(x) {
  prevData = x;
}

function setPrevLabel(y) {
  prevLabel = y;
}
},{"svm":"node_modules/svm/lib/svm.js"}]},{},["index.js"], null)
//# sourceMappingURL=/SVM.e31bb0bc.js.map