var curr = null;

var canvasHG = null;
var ctxHG = null;

var GL = function (id) {
    var o = this;

    var canvas = document.getElementById(id);
    var gl = null;

    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }

    if (!gl)
        alert("Impossible d'initialiser WebGL...");
    else {
        o.gl = gl;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
};

function switchPrograms(gl, newProgram) {
    // Gets the number of attributes in the current and new programs
    var currentProgram = curr;

    if (curr != null && curr != newProgram) {

        var currentAttributes = gl.getProgramParameter(currentProgram, gl.ACTIVE_ATTRIBUTES);
        var newAttributes = gl.getProgramParameter(newProgram, gl.ACTIVE_ATTRIBUTES);

        // Fortunately, in OpenGL, attribute index values are always assigned in the
        // range [0, ..., NUMBER_OF_VERTEX_ATTRIBUTES - 1], so we can use that to
        // enable or disable attributes
        if (newAttributes > currentAttributes) // We need to enable the missing attributes
        {
            for (var i = currentAttributes; i < newAttributes; i++) {
                gl.enableVertexAttribArray(i);
            }
        }
        else if (newAttributes < currentAttributes) // We need to disable the extra attributes
        {
            for (var i = newAttributes; i < currentAttributes; i++) {
                gl.disableVertexAttribArray(i);
            }
        }
    }

    // With all the attributes now enabled/disabled as they need to be, let's switch!
    gl.useProgram(newProgram);

    curr = newProgram;

    //console.log(newProgram.nom);
}

var BUFFER = function (gl, v, s, index) {
    var o = this;
    
    o.gl = gl;

    o.buffer = gl.createBuffer();

    if (!index) {
        gl.bindBuffer(gl.ARRAY_BUFFER, o.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        o.buffer.itemSize = s;
        o.buffer.numItems = parseInt(v.length / s);
    }
    else {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(v), gl.STATIC_DRAW);

        o.buffer.itemSize = 1;
        o.buffer.numItems = parseInt(v.length);
    }
};

var SHADER = function (gl, id_vertex, id_fragment) {
    var o = this;

    var v = $('#' + id_vertex).html();
    var f = $('#' + id_fragment).html();


    o.sf = gl.createShader(gl.FRAGMENT_SHADER);
    o.sv = gl.createShader(gl.VERTEX_SHADER);

    var sv = o.sv, sf = o.sf;

    gl.shaderSource(sf, f);
    gl.compileShader(sf);

    gl.shaderSource(sv, v);
    gl.compileShader(sv);

    if (!gl.getShaderParameter(sv, gl.COMPILE_STATUS))
        alert(gl.getShaderInfoLog(sv));
    if (!gl.getShaderParameter(sf, gl.COMPILE_STATUS))
        alert(gl.getShaderInfoLog(sf));

    o.gl = gl;
};

var PROGRAM = {
    texture:
        function (gl, id_vertex, id_fragment) {
            var o = this;
            var s = new SHADER(gl, id_vertex, id_fragment);

            o.gl = gl;
            

            o.p = gl.createProgram();
            o.p.nom = 'texture';
            gl.attachShader(o.p, s.sv);
            gl.attachShader(o.p, s.sf);
            gl.linkProgram(o.p);

            if (!gl.getProgramParameter(o.p, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            //gl.useProgram(o.p);
            switchPrograms(gl, o.p);

            o.p.aVP = gl.getAttribLocation(o.p, "aVP");
            gl.enableVertexAttribArray(o.p.aVP);

            o.p.aTC = gl.getAttribLocation(o.p, "aTC");
            gl.enableVertexAttribArray(o.p.aTC);

            o.p.uPM = gl.getUniformLocation(o.p, "uPM");
            o.p.uMV = gl.getUniformLocation(o.p, "uMV");
            o.p.samplerUniform = gl.getUniformLocation(o.p, "uSampler");

            console.log('tex ' + o.p.aVP + ' ' + 
                o.p.aTC + ' ');
        },
    textureLight:
        function (gl, id_vertex, id_fragment) {
            var o = this;
            var s = new SHADER(gl, id_vertex, id_fragment);

            o.gl = gl;
            

            o.p = gl.createProgram();
            o.p.nom = 'texture light';
            var shaderProgram = o.p;

            gl.attachShader(o.p, s.sv);
            gl.attachShader(o.p, s.sf);
            gl.linkProgram(o.p);

            if (!gl.getProgramParameter(o.p, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            //gl.useProgram(shaderProgram);
            switchPrograms(gl, o.p);

            o.p.vertexPositionAttribute = gl.getAttribLocation(o.p, "aVertexPosition");
            gl.enableVertexAttribArray(o.p.vertexPositionAttribute);

            o.p.vertexNormalAttribute = gl.getAttribLocation(o.p, "aVertexNormal");
            gl.enableVertexAttribArray(o.p.vertexNormalAttribute);

            o.p.textureCoordAttribute = gl.getAttribLocation(o.p, "aTextureCoord");
            gl.enableVertexAttribArray(o.p.textureCoordAttribute);

            o.p.pMatrixUniform = gl.getUniformLocation(o.p, "uPMatrix");
            o.p.mvMatrixUniform = gl.getUniformLocation(o.p, "uMVMatrix");
            o.p.nMatrixUniform = gl.getUniformLocation(o.p, "uNMatrix");
            o.p.samplerUniform = gl.getUniformLocation(o.p, "uSampler");
            o.p.useLightingUniform = gl.getUniformLocation(o.p, "uUseLighting");
            o.p.ambientColorUniform = gl.getUniformLocation(o.p, "uAmbientColor");
            o.p.lightingDirectionUniform = gl.getUniformLocation(o.p, "uLightingDirection");
            o.p.directionalColorUniform = gl.getUniformLocation(o.p, "uDirectionalColor");

            console.log('light ' + o.p.vertexPositionAttribute + ' ' + o.p.vertexNormalAttribute + ' ' +
                o.p.textureCoordAttribute + ' ');
        },

    mer:
        function (gl, id_vertex, id_fragment) {
            var o = this;
            var s = new SHADER(gl, id_vertex, id_fragment);

            o.gl = gl;


            o.p = gl.createProgram();
            o.p.nom = 'texture light';
            var shaderProgram = o.p;

            gl.attachShader(o.p, s.sv);
            gl.attachShader(o.p, s.sf);
            gl.linkProgram(o.p);

            if (!gl.getProgramParameter(o.p, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            //gl.useProgram(shaderProgram);
            switchPrograms(gl, o.p);

            o.p.vertexPositionAttribute = gl.getAttribLocation(o.p, "aVertexPosition");
            gl.enableVertexAttribArray(o.p.vertexPositionAttribute);

            o.p.vertexNormalAttribute = gl.getAttribLocation(o.p, "aVertexNormal");
            gl.enableVertexAttribArray(o.p.vertexNormalAttribute);

            o.p.textureCoordAttribute = gl.getAttribLocation(o.p, "aTextureCoord");
            gl.enableVertexAttribArray(o.p.textureCoordAttribute);

            o.p.v1 = gl.getUniformLocation(o.p, "v1");
            o.p.v2 = gl.getUniformLocation(o.p, "v2");
            o.p.v4 = gl.getUniformLocation(o.p, "v3");
            o.p.v3 = gl.getUniformLocation(o.p, "v4");

            o.p.pMatrixUniform = gl.getUniformLocation(o.p, "uPMatrix");
            o.p.mvMatrixUniform = gl.getUniformLocation(o.p, "uMVMatrix");
            o.p.nMatrixUniform = gl.getUniformLocation(o.p, "uNMatrix");
            o.p.samplerUniform = gl.getUniformLocation(o.p, "uSampler");
            o.p.useLightingUniform = gl.getUniformLocation(o.p, "uUseLighting");
            o.p.ambientColorUniform = gl.getUniformLocation(o.p, "uAmbientColor");
            o.p.lightingDirectionUniform = gl.getUniformLocation(o.p, "uLightingDirection");
            o.p.directionalColorUniform = gl.getUniformLocation(o.p, "uDirectionalColor");

            console.log('light ' + o.p.vertexPositionAttribute + ' ' + o.p.vertexNormalAttribute + ' ' +
                o.p.textureCoordAttribute + ' ');
        }
};

PROGRAM.textureLight.prototype = {
    draw:
        function (buffer, texture, pmat, vmat, s) {
            var o = this;
            var gl = o.gl;

            if (!texture.image.complete)
                return;
            switchPrograms(gl, o.p);

            var shaderProgram = o.p;

            /*console.log('attr ' + o.p.vertexPositionAttribute + ' ' + o.p.vertexNormalAttribute + ' ' +
                o.p.textureCoordAttribute + ' ');*/

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[0]);
            gl.vertexAttribPointer(o.p.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[3]);
            gl.vertexAttribPointer(o.p.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[1]);
            gl.vertexAttribPointer(o.p.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture.tex);
            gl.uniform1i(o.p.samplerUniform, 0);
            var lighting = true;
            gl.uniform1i(o.p.useLightingUniform, lighting);
            //if (lighting) {
                gl.uniform3f(
                    o.p.ambientColorUniform,
                    1.0,
                    1.0,
                    1.0
                );

                var lightingDirection = [
                    -0.5,
                    0.0,
                    -1.0
                ];
                var adjustedLD = vec3.create();
                vec3.normalize(lightingDirection, adjustedLD);
                vec3.scale(adjustedLD, -1);
                gl.uniform3fv(o.p.lightingDirectionUniform, adjustedLD);

                gl.uniform3f(
                    o.p.directionalColorUniform,
                    0.5,
                    0.5,
                    0.5
                );
            //}

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer[2]);

            gl.uniformMatrix4fv(o.p.pMatrixUniform, false, pmat);
            gl.uniformMatrix4fv(o.p.mvMatrixUniform, false, vmat);

            var normalMatrix = mat3.create();
            mat4.toInverseMat3(vmat, normalMatrix);
            mat3.transpose(normalMatrix);
            gl.uniformMatrix3fv(o.p.nMatrixUniform, false, normalMatrix);

            gl.drawElements(gl.TRIANGLES, buffer[2].numItems, gl.UNSIGNED_SHORT, 0);
        }
};

PROGRAM.mer.prototype = {
    draw:
        function (buffer, texture, pmat, vmat, s) {
            var o = this;
            var gl = o.gl;

            if (!texture.image.complete)
                return;
            switchPrograms(gl, o.p);

            var shaderProgram = o.p;

            /*console.log('attr ' + o.p.vertexPositionAttribute + ' ' + o.p.vertexNormalAttribute + ' ' +
                o.p.textureCoordAttribute + ' ');*/

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[0]);
            gl.vertexAttribPointer(o.p.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[3]);
            gl.vertexAttribPointer(o.p.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[1]);
            gl.vertexAttribPointer(o.p.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture.tex);
            gl.uniform1i(o.p.samplerUniform, 0);
            var lighting = true;
            gl.uniform1i(o.p.useLightingUniform, lighting);
            //if (lighting) {
            gl.uniform3f(
                o.p.ambientColorUniform,
                1.0,
                1.0,
                1.0
            );

            var lightingDirection = [
                -0.5,
                0.0,
                -1.0
            ];
            var adjustedLD = vec3.create();
            vec3.normalize(lightingDirection, adjustedLD);
            vec3.scale(adjustedLD, -1);
            gl.uniform3fv(o.p.lightingDirectionUniform, adjustedLD);

            gl.uniform3f(
                o.p.directionalColorUniform,
                0.5,
                0.5,
                0.5
            );
            //}

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer[2]);

            gl.uniformMatrix4fv(o.p.pMatrixUniform, false, pmat);
            gl.uniformMatrix4fv(o.p.mvMatrixUniform, false, vmat);

            var normalMatrix = mat3.create();
            mat4.toInverseMat3(vmat, normalMatrix);
            mat3.transpose(normalMatrix);
            gl.uniformMatrix3fv(o.p.nMatrixUniform, false, normalMatrix);

            gl.drawElements(gl.TRIANGLES, buffer[2].numItems, gl.UNSIGNED_SHORT, 0);
        }
};

PROGRAM.texture.prototype = {
    draw:
        function (buffer, texture, pmat, vmat, pos)
        {
            var o = this;
            var gl = o.gl;

            if (!texture.image.complete)
                return;
            switchPrograms(gl, o.p);

            var tm = mat4.create(vmat);

            if (pos != undefined)
                mat4.translate(tm, pos);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[0]);
            gl.vertexAttribPointer(o.p.aVP, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[1]);
            gl.vertexAttribPointer(o.p.aTC, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture.tex);
            gl.uniform1i(o.p.samplerUniform, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer[2]);

            gl.uniformMatrix4fv(o.p.uPM, false, pmat);
            gl.uniformMatrix4fv(o.p.uMV, false, tm);

            gl.drawElements(gl.TRIANGLES, buffer[2].numItems, gl.UNSIGNED_SHORT, 0);
        }
};

var TEXTURE = function (gl, src) {
    var o = this;

    o.tex = gl.createTexture();
    o.image = new Image();
    o.image.onload = function () {
        /*gl.bindTexture(gl.TEXTURE_2D, o.tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, o.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);*/

        gl.bindTexture(gl.TEXTURE_2D, o.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, o.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    };

    o.image.src = src;
};

var MESH = function () {
    var o = this;

    o.bv = null;
    o.bt = null;
    o.bn = null;
    o.bi = null;

    o.texture = null;
};

var SKYBOX = function (gl, s, src) {
    var o = this;

    o.gl = gl;
    o.size = s;
    o.texture = new TEXTURE(gl, src);

    o.bv = new BUFFER(gl,
        [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
            // Back face
            -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
            // Top face
            -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            // Right face
             1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ], 3, false);

    var q = 1.0 / 4.0;
    var t = 1.0 / 3.0;

    o.bt = new BUFFER(gl, [
      // Front face
      q, 2 * t,
      2 * q, 2 * t,
      2 * q, 3 * t,
      q, 3 * t,

      // Back face
      1.0, 2 * t,
      1.0, t,
      3 * q, t,
      3 * q, 2 * t,

      // Top face
      q, 0.0,
      2 * q, 0.0,
      2 * q, t,
      q, t,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      3 * q, t,
      3 * q, 2 * t,
      2 * q, 2 * t,
      2 * q, t,

      // Left face
      0.0, t,
      q, t,
      q, 2*t,
      0.0, 2*t,
    ], 2, false);

    o.bi = new BUFFER(gl, [
        0, 1, 2, 0, 2, 3,    // Front face
        4, 5, 6, 4, 6, 7,    // Back face
        8, 9, 10, 8, 10, 11,  // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23  // Left face
    ], 1, true);
};

SKYBOX.prototype = {
    draw:
        function (pg, pm, vm, pos)
        {
            var o = this;
            var tm = mat4.create(vm);

            mat4.translate(tm, pos);
            mat4.scale(tm, [o.size, o.size, o.size]);

            pg.draw([o.bv.buffer, o.bt.buffer, o.bi.buffer], o.texture, pm, tm);
        }
};

var HEIGHTMAP = function (gl, src, tex, s, un) {
    var o = this;

    o.gl = gl;
    o.size = s;
    o.texture = new TEXTURE(gl, tex);

    o.bv = [];
    o.bt = [];
    o.bn = [];
    o.bi = [];

    o.nb = 0;

    o.ok = false;

    if (canvasHG == null)
    {
        canvasHG = document.getElementById('heightmap');
        ctxHG = canvasHG.getContext('2d');
    }

    o.data = null;

    o.img = new Image();
    o.img.onload = function () {
        var w = o.img.width;
        var h = o.img.height;

        canvasHG.width = o.img.width;
        canvasHG.height = o.img.height;

        ctxHG.drawImage(o.img, 0, 0);

        var data = ctxHG.getImageData(0, 0, o.img.width, o.img.height);

        data.p = function (xxx, yyy) {
            return data.data[(xxx * w + yyy) * 4];
        };

        o.data = data;

        //console.log(o.img.width + ' ' + o.img.height + ' ' + data.data.length);

        var v = [];
        var t = [];
        var n = [];
        var id = [];
        var k = 0;
        var kk = 0;

        o.nb++;

        var ddw = parseInt(w / 100) + 1;
        var ddh = parseInt(h / 100) + 1;

        var dw = 1.0 / w;
        var dh = 1.0 / h;

        console.log('dim : ' + w + ' ' + h + ' ' + ddw + ' ' + ddh);

        function normal(i, j, ni, nj, data)
        {
            var v1 = [i, data.p(i, j - nj), j - nj];
            var v2 = [i + ni, data.p(i + ni, j), j];
            var v3 = [i, data.p(i, j + nj), j + nj];
            var v4 = [i - ni, data.p(i - ni, j), j];

            var c1 = [0, 0, 0];
            var c2 = [0, 0, 0];
            var c3 = [0, 0, 0];
            var c4 = [0, 0, 0];

            vec3.cross(v1, v2, c1);
            vec3.cross(v2, v3, c2);
            vec3.cross(v3, v4, c3);
            vec3.cross(v4, v1, c4);

            var n = [0, 0, 0];

            vec3.add(n, c1);
            vec3.add(n, c2);
            vec3.add(n, c3);
            vec3.add(n, c4);

            vec3.normalize(n);

            return n;
        }

        for (var i = ddw; i < w - 2 - ddw; i += ddw)
        {
            for (var j = ddh; j < h - 2 - ddh; j+=ddh)
            {        
                v.push(i); v.push(data.p(i,j)); v.push(j);
                v.push(i); v.push(data.p(i, j + ddh)); v.push(j + ddh);
                v.push(i + ddw); v.push(data.p(i + ddw, j)); v.push(j);

                v.push(i); v.push(data.p(i, j + ddh)); v.push(j + ddh);
                v.push(i + ddw); v.push(data.p(i + ddw, j + ddh)); v.push(j + ddh);
                v.push(i + ddw); v.push(data.p(i + ddw, j)); v.push(j);

                var vec = [0, 0, 0];

                u = i;
                f = j;
                vec3.cross(
                    [0, data.p(u, f + ddh) - data.p(u, f - ddh), ddh],
                    [ddw, data.p(u + ddw, f) - data.p(u - ddw, f), 0],
                    vec);
                vec3.normalize(vec);
                vec = normal(u, f, ddw, ddh, data);
                n.push(vec[0]); n.push(vec[1]); n.push(vec[2]);

                u = i;
                f = j + 1;
                vec3.cross(
                    [0, data.p(u, f + ddh) - data.p(u, f - ddh), ddh],
                    [ddw, data.p(u + ddw, f) - data.p(u - ddw, f), 0],
                    vec);
                vec3.normalize(vec);
                vec = normal(u, f, ddw, ddh, data);
                n.push(vec[0]); n.push(vec[1]); n.push(vec[2]);

                u = i + 1;
                f = j;
                vec3.cross(
                    [0, data.p(u, f + ddh) - data.p(u, f - ddh), ddh],
                    [ddw, data.p(u + ddw, f) - data.p(u - ddw, f), 0],
                    vec);
                vec3.normalize(vec);
                vec = normal(u, f, ddw, ddh, data);
                n.push(vec[0]); n.push(vec[1]); n.push(vec[2]);

                u = i;
                f = j + 1;
                vec3.cross(
                    [0, data.p(u, f + ddh) - data.p(u, f - ddh), ddh],
                    [ddw, data.p(u + ddw, f) - data.p(u - ddw, f), 0],
                    vec);
                vec3.normalize(vec);
                vec = normal(u, f, ddw, ddh, data);
                n.push(vec[0]); n.push(vec[1]); n.push(vec[2]);

                u = i + 1;
                f = j + 1;
                vec3.cross(
                    [0, data.p(u, f + ddh) - data.p(u, f - ddh), ddh],
                    [ddw, data.p(u + ddw, f) - data.p(u - ddw, f), 0],
                    vec);
                vec3.normalize(vec);
                vec = normal(u, f, ddw, ddh, data);
                n.push(vec[0]); n.push(vec[1]); n.push(vec[2]);

                u = i + 1;
                f = j;
                vec3.cross(
                    [0, data.p(u, f + ddh) - data.p(u, f - ddh), ddh],
                    [ddw, data.p(u + ddw, f) - data.p(u - ddw, f), 0],
                    vec);
                vec3.normalize(vec);
                vec = normal(u, f, ddw, ddh, data);
                n.push(vec[0]); n.push(vec[1]); n.push(vec[2]);

                if (un)
                {
                    t.push(i * dw); t.push(j * dh);
                    t.push(i * dw); t.push((j + ddh) * dh);
                    t.push((i + ddw) * dw); t.push(j * dh);

                    t.push(i * dw); t.push((j + ddh) * dh);
                    t.push((i + ddw) * dw); t.push((j + ddh) * dh);
                    t.push((i + ddw) * dw); t.push(j * dh);
                }
                else
                {
                    t.push(0.0); t.push(1.0);
                    t.push(1.0); t.push(1.0);
                    t.push(0.0); t.push(0.0);

                    t.push(1.0); t.push(1.0);
                    t.push(1.0); t.push(0.0);
                    t.push(0.0); t.push(0.0);
                }

                for (var l = 0; l < 6; l++)
                {
                    id.push(k);
                    k++;
                }

                kk++;
            }
            
        }

        console.log('kk ' + kk);
        /*o.bv = new BUFFER(gl, v, 3, false);
        o.bt = new BUFFER(gl, t, 2, false);
        o.bn = new BUFFER(gl, n, 3, false);
        o.bi = new BUFFER(gl, id, 1, true);*/
        o.bv.push(new BUFFER(gl, v, 3, false));
        o.bt.push(new BUFFER(gl, t, 2, false));
        o.bn.push(new BUFFER(gl, n, 3, false));
        o.bi.push(new BUFFER(gl, id, 1, true));

        console.log((v.length / 3) + ' ' + (t.length / 2) + ' ' + id.length);

        o.ok = true;
    };
    o.img.src = src;
};

HEIGHTMAP.prototype = {
    draw:
        function (pg, pm, vm, pos) {
            var o = this;

            if (!o.ok)
                return;

            var tm = mat4.create(vm);

            mat4.translate(tm, pos);
            mat4.scale(tm, [o.size, 0.25, o.size]);
            //console.log('aaaaa1');
            for (var i = 0; i < o.nb; i++) {
                //console.log(i);
                pg.draw([o.bv[i].buffer, o.bt[i].buffer, o.bi[i].buffer, o.bn[i].buffer], o.texture, pm, tm);
            }
            //console.log('aaaaa2');
        },

    xyh:
        function (xx, yy) {
            var o = this;

            if (o.data == null)
                return 0;

            var x = xx;
            var y = yy;
            var ix = parseInt(x);
            var iy = parseInt(y);
            var dx = x - ix;
            var dy = y - iy;
            var hauteursol = ((1 - dx) * o.data.p(ix, iy) + dx * o.data.p(ix + 1, iy)) * (1 - dy)
                                  + ((1 - dx) * o.data.p(ix, iy + 1) + dx * o.data.p(ix + 1, iy + 1)) * dy;
            return hauteursol * 0.25;
        }
};

var MER = function (gl, pos, tex, decc) {
    var o = this;

    o.bv = null;
    o.bt = null;
    o.bn = null;
    o.bi = null;

    o.texture = tex;

    o.pos = pos;

    var v = [], vv = new Float32Array(100 * 100 * 3),t = [], n = [], id = [], k = 0;
    var h = 0.01;

    function dv (i, j)
    {
        var dec = (i * 100 + j) * 3;
        return [vv[dec], vv[dec + 1], vv[dec + 2]];
    }

    function sv(i, hh, j) {
        var dec = (i * 100 + j) * 3;
        vv[dec] = i;
        vv[dec + 1] = hh;
        vv[dec + 2] = j;
    }

    function mern (i, j)
    {
        var v1 = [i, 0, j - 1];
        var v2 = [i + 1, 0, j];
        var v3 = [i, 0, j + 1];
        var v4 = [i - 1, 0, j];

        var ij = dv(i, j);

        if (i == 0)
            v4 = ij;
        if (i == 99)
            v2 = ij;
        if (j == 0)
            v1 = ij;
        if (j == 99)
            v3 = ij;

        v1 = dv( v1[0], v1[2]);
        v2 = dv(v2[0], v2[2]);
        v3 = dv(v3[0], v3[2]);
        v4 = dv(v4[0], v4[2]);

        var c1 = [0, 0, 0];
        var c2 = [0, 0, 0];
        var c3 = [0, 0, 0];
        var c4 = [0, 0, 0];

        vec3.cross(v1, v2, c1);
        vec3.cross(v2, v3, c2);
        vec3.cross(v3, v4, c3);
        vec3.cross(v4, v1, c4);

        var n = [0, 0, 0];

        vec3.add(n, c1);
        vec3.add(n, c2);
        vec3.add(n, c3);
        vec3.add(n, c4);

        vec3.normalize(n);

        return n;
    }

    for (var i = 0; i < 100; i++)
    {
        for (var j = 0; j < 100; j++)
        {
            v.push(i); v.push(Math.sin(decc + i + j) * h + Math.cos(decc + i)); v.push(j);
            v.push(i); v.push(Math.sin(decc + i + (j + 1)) * h + Math.cos(decc + i)); v.push(j + 1);
            v.push(i + 1); v.push(Math.sin(decc + (i + 1) + (j + 1)) * h + Math.cos(decc + i + 1)); v.push(j + 1);

            v.push(i + 1); v.push(Math.sin(decc + (i + 1) + (j + 1)) * h + Math.cos(decc + i + 1)); v.push(j + 1);
            v.push(i + 1); v.push(Math.sin(decc + (i + 1) + j) * h + Math.cos(decc + i + 1)); v.push(j);
            v.push(i); v.push(Math.sin(decc + i + j) * h + Math.cos(decc + i)); v.push(j);

            sv(i, Math.sin(i + j) * h, j);
            sv(i, Math.sin(i + (j + 1)) * h, j + 1);
            sv(i + 1, Math.sin((i + 1) + (j + 1)) * h, j + 1);

            sv(i + 1, Math.sin((i + 1) + (j + 1)) * h, j + 1);
            sv((i + 1), Math.sin((i + 1) + j) * h, j);
            sv(i, Math.sin(i + j) * h, j);

            t.push(1.0); t.push(1.0);
            t.push(0.0); t.push(1.0);
            t.push(0.0); t.push(0.0);

            t.push(0.0); t.push(0.0);
            t.push(1.0); t.push(0.0);
            t.push(1.0); t.push(1.0);

            for (var l = 0; l < 6; l++)
            {
                id.push(k);
                k++;
            }
        }
    }

    for (var i = 0; i < 100; i++) {
        for (var j = 0; j < 100; j++) {
            var nn = mern(i, j, v);
            n.push(nn[0]); n.push(nn[1]); n.push(nn[2]);
            nn = mern(i, j + 1, v);
            n.push(nn[0]); n.push(nn[1]); n.push(nn[2]);
            nn = mern(i + 1, j + 1, v);
            n.push(nn[0]); n.push(nn[1]); n.push(nn[2]);

            nn = mern(i + 1, j + 1, v);
            n.push(nn[0]); n.push(nn[1]); n.push(nn[2]);
            nn = mern(i + 1, j, v);
            n.push(nn[0]); n.push(nn[1]); n.push(nn[2]);
            nn = mern(i, j, v);
            n.push(nn[0]); n.push(nn[1]); n.push(nn[2]);
        }
    }

    o.bv = new BUFFER(gl, v, 3, false);
    o.bt = new BUFFER(gl, t, 2, false);
    o.bn = new BUFFER(gl, n, 3, false);
    o.bi = new BUFFER(gl, id, 1, true);
};


MER.prototype = {
    draw:
        function (pg, pm, vm) {
            var o = this;

            

            var tm = mat4.create(vm);

            mat4.translate(tm, o.pos);

            pg.draw([o.bv.buffer, o.bt.buffer, o.bi.buffer, o.bn.buffer], o.texture, pm, tm);
        }
};