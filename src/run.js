var fs = require('fs');

//var result = "foo baz".splice( 4, 0, "bar " );
//
//alert(result); // "foo bar baz"

var inFile = 'canvg_v2/canvg.js';
var insertFlag = "if (typeof CanvasRenderingContext2D != \'undefined\')";//version 2

var outFile = 'canvg.js';

var js = fs.readFileSync(inFile, 'utf8');


function insertAfter(match, str) {
    var index = match.length + js.indexOf(match);
    var str1 = js.substring(0, index + 1);
    var str2 = js.substring(index + 1);

    js = str1 + str + '\n' + str2;
}

function insertBefor(match, str) {
    var index = js.indexOf(match);
    var str1 = js.substring(0, index);
    var str2 = js.substring(index);

    js = str1 + '\n' + str + '\n' + str2;

}

function replaceAll(str1, str2) {
    var pattern = new RegExp(str1.replace(".", "\\.").replace("(", "\\(").replace(")", "\\)").replace("\n", "\\\n").replace("\"", "\\\""), "g");
    js = js.replace(pattern, str2);
}

insertBefor(insertFlag, fs.readFileSync('insert.code.js', 'utf8'));

var properties = {
    "textBaseline": false,
    "textAlign": false,
    "font": false,
    "lineDashOffset": false,
    "miterLimit": false,
    "lineJoin": false,
    "lineCap": false,
    "lineWidth": false,
    "shadowColor": false,
    "shadowBlur": false,
    "shadowOffsetY": false,
    "shadowOffsetX": false,
    "fillStyle": false,
    "strokeStyle": false,
    "imageSmoothingEnabled": false,
    //"webkitImageSmoothingEnabled": false,
    "globalCompositeOperation": false,
    "globalAlpha": false,
    //"canvas": false,
    //"_changed": false,
    "save": true,
    "restore": true,
    "scale": true,
    "rotate": true,
    "translate": true,
    "transform": true,
    "setTransform": true,
    "resetTransform": true,
    "createLinearGradient": true,
    "createRadialGradient": true,
    "createPattern": true,
    "clearRect": true,
    "fillRect": true,
    "strokeRect": true,
    "beginPath": true,
    "fill": true,
    "stroke": true,
    "drawFocusIfNeeded": true,
    "clip": true,
    "isPointInPath": true,
    "isPointInStroke": true,
    "fillText": true,
    "strokeText": true,
    //"measureText": true,
    "drawImage": true,
    //"createImageData": true,
    //"getImageData": true,
    "putImageData": true,
    //"getContextAttributes": true,
    "setLineDash": true,
    "getLineDash": true,
    "closePath": true,
    "moveTo": true,
    "lineTo": true,
    "quadraticCurveTo": true,
    "bezierCurveTo": true,
    "arcTo": true,
    "rect": true,
    "arc": true,
    "ellipse": true,
    //"constructor": true,
    //"drawSvg": true
};


for (var name in properties) {
    if (properties[name]) {
        replaceAll('ctx.' + name + '(', 'ctx.' + name + '2(');
        replaceAll('tempCtx.' + name + '(', 'tempCtx.' + name + '2(');
    } else {
        replaceAll('ctx.' + name, 'ctx.' + name + '2');
        replaceAll('tempCtx.' + name, 'tempCtx.' + name + '2');
    }
}

replaceAll('draw();', "code = '';\ndraw();\nif(window.onSVGDraw){\nonSVGDraw(\"{\\n draw: function(ctx){\\n\" + code + \"}\\n\\n}\", ctx.canvas);\n}");
replaceAll('global.canvgv2', 'global.canvg')

/**
 * modified by sam@qunee.com
 * http://demo.qunee.com/svg2canvas
 */
js = "/**\n\
* modified by sam@qunee.com\n\
* http://demo.qunee.com/svg2canvas\n\
*/" + js;
fs.writeFileSync(outFile, js);
