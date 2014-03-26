
$.ajax({
    type: "GET",
    url: "data/cube.html",
    dataType: 'text'
})
        .done(function (msg) {
            Parse.obj(msg);
            //alert("Data Saved: " + msg);
        });

$(function () {

    var cvs = document.getElementById('dessin2');
    cvs.height = $(window).height();
    cvs.width = $(window).width();

    var g = new GL('dessin2');
    var pt = new PROGRAM.texture(g.gl, 'vertex-shader', 'fragment-shader');
    var ptl = new PROGRAM.textureLight(g.gl, 'vertex-shader-light', 'fragment-shader-light');
    var ptm = new PROGRAM.mer(g.gl, 'vertex-shader-mer', 'fragment-shader-mer');

    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function handleLoadedTexture(texture) {
        g.gl.bindTexture(g.gl.TEXTURE_2D, texture);
        g.gl.pixelStorei(g.gl.UNPACK_FLIP_Y_WEBGL, true);
        g.gl.texImage2D(g.gl.TEXTURE_2D, 0, g.gl.RGBA, g.gl.RGBA, g.gl.UNSIGNED_BYTE, texture.image);
        g.gl.texParameteri(g.gl.TEXTURE_2D, g.gl.TEXTURE_MAG_FILTER, g.gl.NEAREST);
        g.gl.texParameteri(g.gl.TEXTURE_2D, g.gl.TEXTURE_MIN_FILTER, g.gl.NEAREST);
        g.gl.bindTexture(g.gl.TEXTURE_2D, null);
    }


    var hehe;

    function initTexture() {
        hehe = g.gl.createTexture();
        hehe.image = new Image();
        hehe.image.onload = function () {
            handleLoadedTexture(hehe)
        }

        hehe.image.src = "images/bamboo.png";
    }

    initTexture();


    var bv = new BUFFER(g.gl, [
            // Front face
            -1.0, -1.0, 1.0,
             1.0, -1.0, 1.0,
             1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
             1.0, 1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
             1.0, 1.0, 1.0,
             1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0, 1.0, -1.0,
             1.0, 1.0, 1.0,
             1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
    ], 3,false);

    var bt = new BUFFER(g.gl, [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

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
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ], 2,false);

    var bi = new BUFFER(g.gl, [
        0, 1, 2, 0, 2, 3,    // Front face
        4, 5, 6, 4, 6, 7,    // Back face
        8, 9, 10, 8, 10, 11,  // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23  // Left face
    ], 1, true);

    var tt = new TEXTURE(g.gl, 'images/bamboo.png');

    var angley = 0;
    var anglez = 0;
    var px = 10, py = 0, pz = 0;
    var tx = 0, ty = 0, tz = 0;
    var x = 0, y = 0, z = 0;
    var tty = 0.0;
    var sky = new SKYBOX(g.gl, 300, 'images/sky.png');
    var ter = new HEIGHTMAP(g.gl, 'images/h4.png', 'images/g1.jpg', 1, false, 256, 256);
    var mer = new MER(g.gl, [0, -10, 0], new TEXTURE(g.gl, 'images/t3.png'), tty);

    var position = [50, 1, 50];
    var look = [40, 0, 40];
    var rayon = 10;
    var teta = 180;
    var phi = 35;

    var _forward = [0, 0, 0];
    var _left = [0, 0, 0];

    var stack = [];

    setInterval(function () {
        look[1] = 1;
        g.gl.viewport(0, 0, g.gl.viewportWidth, g.gl.viewportHeight);
        g.gl.clear(g.gl.COLOR_BUFFER_BIT | g.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, g.gl.viewportWidth / g.gl.viewportHeight, 0.001, 1000.0, pMatrix);

        mat4.identity(mvMatrix);

        //mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

        if (M[1])
        {
            teta += (M.mx - M.x) * 0.5;
            phi += (M.my - M.y) * 0.5;

            if (phi > 89)
                phi = 89;
            else if (phi < -89)
                phi = -89;

            M.x = M.mx;
            M.y = M.my;
        }

        var ppp = 2;

        if (K[37]) { // gauche
            look[0] -= _left[0] * ppp;
            look[2] -= _left[2] * ppp;
        }
        if (K[38]) { // haut
            look[0] -= _forward[0] * ppp;
            look[2] -= _forward[2] * ppp;
        }
        if (K[39]) { // droite
            look[0] += _left[0] * ppp;
            look[2] += _left[2] * ppp;
        }
        if (K[40]) { // bas
            look[0] += _forward[0] * ppp;
            look[2] += _forward[2] * ppp;
        }

        
        //passage des coordonnées sphériques aux coordonnées cartésiennes
        var r_temp = Math.cos(phi*3.14/180);
        _forward[1] = Math.sin(phi*3.14/180); // z
        _forward[0] = r_temp*Math.cos(teta*3.14/180); // x
        _forward[2] = r_temp*Math.sin(teta*3.14/180); // y
        
        vec3.cross([0.0,1.0,0.0], [_forward[0], _forward[1], _forward[2]], _left);
        vec3.normalize(_left);

        position[0] = look[0] + _forward[0] * 10;
        position[1] = look[1] + _forward[1] * 10;
        position[2] = look[2] + _forward[2] * 10;

        /*console.log(position);
        console.log(look);
        console.log(_left);
        console.log(phi + '  ' + teta);
        console.log(' --- ');*/

        mat4.lookAt(position, look, [0, 1, 0], mvMatrix);

        //pt.draw([bv.buffer, bt.buffer, bi.buffer], tt, pMatrix, mvMatrix, look);
        sky.draw(pt, pMatrix, mvMatrix, [-150, 0, -150]);
        ter.draw(ptl, pMatrix, mvMatrix, [0, -20, 0]);


        mer.draw(ptm, pMatrix, mvMatrix);

        tty += 0.5;

        //mer = new MER(g.gl, [0, -11, 0], new TEXTURE(g.gl, 'images/t3.png'), tty);
    }, 100);
});