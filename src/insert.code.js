var code;
var images;
var caches;
var index = 0;

function appendCode(str, ctx) {
    code += str;
}

function createCtxName() {
    if (index == 0) {
        return 'ctx';
    }
    return 'ctx' + index;
}

function customCanvas(ctx, tempCtx) {
    if (ctx.name) {
        if(!index){
            index++;
        }
        return;
    }
    ctx.name = createCtxName();
    index++;
    if (tempCtx) {
        appendCode('var canvas = document.createElement("canvas");\n' +
        'canvas.width = ' + ctx.canvas.width + ';\n' +
        'canvas.height = ' + ctx.canvas.height + ';\nvar ' + ctx.name + ' = canvas.getContext("2d");\n', ctx);
    }

    function valueToString(v) {
        if (typeof v == 'string') {
            //if(!caches){
            //    caches = {};
            //}
            //if(!caches[v]){
            //    var name = 'str' + index++;
            //    appendCode('var ' + name + ' = "' + v.replace(/\"/g, "'") + '";\n');
            //    caches[v] = name;
            //}
            //return caches[v];
            return '"' + v.replace(/\"/g, "'") + '"';
        } else if (v instanceof CanvasGradient) {
            return 'g';
        } else if (v instanceof CanvasPattern) {
            return 'p';
        } else if (v instanceof HTMLCanvasElement) {
            return v.getContext('2d').name + '.canvas';
        } else if (v instanceof HTMLImageElement) {
            if(!images){
                images = {};
            }
            if(!images[v.src]){
                images[v.src] = v;
                v.name = 'img' + index++;
                appendCode('var ' + v.name + '= new Image();\n' + v.name + '.src = ' + valueToString(v.src) + ';\n', ctx);
            }
            return v.name;
        }
        return v;
    }

    function createFunction(name) {
        return function () {
            //ctx.setTranslate(10, 10)
            var param = '';
            if (arguments.length) {
                var i = 0;
                while (i < arguments.length) {
                    param += valueToString(arguments[i]);
                    i++;
                    if (i < arguments.length) {
                        param += ',';
                    }
                }
            }
            var ctxName = this.name;
            if (name == 'createLinearGradient' || name == 'createRadialGradient') {
                appendCode('var g = ' + ctxName + '.' + name + '(' + param + ');\n', this);
                var gradient = this[name].apply(this, arguments);

                var ctx = this;
                var oldFunction = gradient.addColorStop;
                gradient.addColorStop = function (offset, color) {
                    appendCode('g.addColorStop(' + valueToString(offset) + ',' + valueToString(color) + ');\n', ctx);
                    return oldFunction.apply(this, arguments);
                }
                return gradient;
            } else if (name == 'createPattern') {
                var result = this[name].apply(this, arguments);
                appendCode('var p = ' + ctxName + '.' + name + '(' + param + ');\n', this);
                return result;
            } else if (name == 'translate' && !arguments[0] && !arguments[1]) {
                //.translate(0,0)
            } else if (name == 'scale' && arguments[0] == 1 && arguments[1] == 1) {
                //.translate(0,0)
            } else if (name == 'setLineDash') {
                appendCode('' + ctxName + '.' + name + '([' + param + ']);\n', this);
            //} else if (name == 'drawImage') {
            //    appendCode('' + ctxName + '.' + name + '([' + param + ']);\n', this);
            } else {
                appendCode('' + ctxName + '.' + name + '(' + param + ');\n', this);
            }
            return this[name].apply(this, arguments);
        }
    }

    function createGetSet(name) {
        return {
            get: function () {
                return this[name];
            },
            set: function (v) {
                var old = this[name];
                if(old === v){
                    return;
                }
                this[name] = v;
                var ctxName = this.name;
                appendCode(ctxName + '.' + name + '=' + valueToString(v) + ';\n', this);
            }
        }
    }

    //var prototype = CanvasRenderingContext2D.prototype;
    //
    //var properties = {};
    //Object.getOwnPropertyNames(ctx).forEach(function (name) {
    //    try{
    //        properties[name] = ctx[name] instanceof Function;
    //    }catch(error){}
    //})
    //
    //Object.getOwnPropertyNames(prototype).forEach(function (name) {
    //    try{
    //        properties[name] = prototype[name] instanceof Function;
    //    }catch(error){}
    //})
    //delete properties.canvas;
    //delete properties.drawSvg;
    //delete properties.constructor;
    //delete properties.prototype;
    //console.log(JSON.stringify(properties));


    var properties = {"webkitLineDash":false,"strokeStyle":false,"fillStyle":false,"name":false,"globalAlpha":false,"globalCompositeOperation":false,"lineWidth":false,"lineCap":false,"lineJoin":false,"miterLimit":false,"shadowOffsetX":false,"shadowOffsetY":false,"shadowBlur":false,"shadowColor":false,"lineDashOffset":false,"webkitLineDashOffset":false,"font":false,"textAlign":false,"textBaseline":false,"webkitBackingStorePixelRatio":false,"webkitImageSmoothingEnabled":false,"save":true,"restore":true,"scale":true,"rotate":true,"translate":true,"transform":true,"setTransform":true,"createLinearGradient":true,"createRadialGradient":true,"setLineDash":true,"getLineDash":true,"clearRect":true,"fillRect":true,"beginPath":true,"closePath":true,"moveTo":true,"lineTo":true,"quadraticCurveTo":true,"bezierCurveTo":true,"arcTo":true,"rect":true,"arc":true,"fill":true,"stroke":true,"clip":true,"isPointInPath":true,"isPointInStroke":true,"measureText":true,"setAlpha":true,"setCompositeOperation":true,"setLineWidth":true,"setLineCap":true,"setLineJoin":true,"setMiterLimit":true,"clearShadow":true,"fillText":true,"strokeText":true,"setStrokeColor":true,"setFillColor":true,"strokeRect":true,"drawImage":true,"drawImageFromRect":true,"setShadow":true,"putImageData":true,"webkitPutImageDataHD":true,"createPattern":true,"createImageData":true,"getImageData":true,"webkitGetImageDataHD":true,"drawFocusIfNeeded":true};


    for (var name in properties) {
        if (properties[name]) {
            ctx[name + '2'] = createFunction(name);
        } else {
            try {
                Object.defineProperty(ctx, name + '2', createGetSet(name))
            } catch (error) {
                console.log(error);
            }
        }
    }
    //console.log(JSON.stringify(properties))
}


var oldCanvg = canvg;
canvg = function (target, s, opts) {
    if (!(typeof s == 'string')) {
        return;
    }
    images = null;
    caches = null;
    index = 0;
    var ctx = target.getContext('2d');

    oldCanvg.apply(this, arguments);
}

var oldGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (name) {
    var result = oldGetContext.apply(this, arguments);
    if (name == '2d') {
        customCanvas(result, index > 0);
    }
    return result;
}
