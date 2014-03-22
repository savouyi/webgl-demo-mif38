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

    if (curr != null) {

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
        o.buffer.numItems = v.length;
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
        }
};

PROGRAM.texture.prototype = {
    draw:
        function (buffer, texture, pmat, vmat)
        {
            var o = this;
            var gl = o.gl;

            if (!texture.image.complete)
                return;
            //switchPrograms(gl, o.p);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[0]);
            gl.vertexAttribPointer(o.p.aVP, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[1]);
            gl.vertexAttribPointer(o.p.aTC, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture.tex);
            gl.uniform1i(o.p.samplerUniform, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer[2]);

            gl.uniformMatrix4fv(o.p.uPM, false, pmat);
            gl.uniformMatrix4fv(o.p.uMV, false, vmat);

            gl.drawElements(gl.TRIANGLES, buffer[2].numItems, gl.UNSIGNED_SHORT, 0);
        }
};

var TEXTURE = function (gl, src) {
    var o = this;

    o.tex = gl.createTexture();
    o.image = new Image();
    o.image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, o.tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, o.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
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
      q, t,
      2 * q, t,
      2 * q, 0.0,
      q, 0.0,

      // Back face
      q, 2 * t,
      2 * q, 2 * t,
      2 * q, 1.0,
      q, 1.0,

      // Top face
      3 * q, 1.0,
      t, 0.0,
      2 * t, 0.0,
      3 * q, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

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

    o.bv = null;
    o.bt = null;
    o.bn = null;
    o.bi = null;

    o.ok = false;

    if (canvasHG == null)
    {
        canvasHG = document.getElementById('heightmap');
        ctxHG = canvasHG.getContext('2d');
    }

    o.img = new Image();
    o.img.onload = function () {
        var w = o.img.width;
        var h = o.img.height;

        canvasHG.width = o.img.width;
        canvasHG.height = o.img.height;

        ctxHG.drawImage(o.img, 0, 0);

        var data = ctxHG.getImageData(0, 0, o.img.width, o.img.height);

        console.log(o.img.width + ' ' + o.img.height + ' ' + data.data.length);

        var v = [];
        var t = [];
        var id = [];
        var k = 0;
        var kk = 0;

        for (var i = 0; i < w - 1; i++)
        {
            for (var j = 0; j < h - 1; j++)
            {
                
                v.push(i); v.push(data.data[(i * w + j) * 4]); v.push(j);
                v.push(i); v.push(data.data[(i * w + j) * 4 + 4]); v.push(j + 1);
                v.push(i + 1); v.push(data.data[((i + 1) * w + j) * 4]); v.push(j);

                v.push(i); v.push(data.data[(i * w + j) * 4 + 4]); v.push(j + 1);
                v.push(i + 1); v.push(data.data[((i + 1) * w + j) * 4 + 4]); v.push(j + 1);
                v.push(i + 1); v.push(data.data[((i + 1) * w + j) * 4]); v.push(j);

                if (un)
                {

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
        o.bv = new BUFFER(gl, v, 3, false);
        o.bt = new BUFFER(gl, t, 2, false);
        o.bi = new BUFFER(gl, id, 1, true);
    };
    o.img.src = src;
};

HEIGHTMAP.prototype = {
    draw:
        function (pg, pm, vm, pos) {
            var o = this;
            var tm = mat4.create(vm);

            mat4.translate(tm, pos);
            mat4.scale(tm, [o.size, o.size, o.size]);

            pg.draw([o.bv.buffer, o.bt.buffer, o.bi.buffer], o.texture, pm, tm);
        }
};