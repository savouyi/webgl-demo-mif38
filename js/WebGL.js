var curr = null;

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

            //switchPrograms(gl, o.p);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[0]);
            gl.vertexAttribPointer(o.p.aVP, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer[1]);
            gl.vertexAttribPointer(o.p.aTC, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(o.p.samplerUniform, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer[2]);

            gl.uniformMatrix4fv(o.p.uPM, false, pmat);
            gl.uniformMatrix4fv(o.p.uMV, false, vmat);

            gl.drawElements(gl.TRIANGLES, buffer[2].numItems, gl.UNSIGNED_SHORT, 0);
        }
};