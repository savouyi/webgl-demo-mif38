
$(function () {

    var cvs = document.getElementById('dessin2');
    cvs.height = $(window).height();
    cvs.width = $(window).width();

    var g = new GL('dessin2');
    var pt = new PROGRAM.texture(g.gl, 'vertex-shader', 'fragment-shader');
    var ptl = new PROGRAM.textureLight(g.gl, 'vertex-shader-light', 'fragment-shader-light');

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

    var sky = new SKYBOX(g.gl, 300, 'images/sky.png');
    var ter = new HEIGHTMAP(g.gl, 'images/hg.jpg', 'images/hgt.jpg', 1, true, 256, 256);

    var position = [10, 1, 0];
    var look = [0, 0, 0];
    var rayon = 10;
    var teta = 0;
    var phi = 0;

    var _forward = { X: 0, Y: 0, Z: 0 };
    var _left = [0, 0, 0];

    var stack = [];

    setInterval(function () {
        g.gl.viewport(0, 0, g.gl.viewportWidth, g.gl.viewportHeight);
        g.gl.clear(g.gl.COLOR_BUFFER_BIT | g.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, g.gl.viewportWidth / g.gl.viewportHeight, 0.001, 1000.0, pMatrix);

        mat4.identity(mvMatrix);

        //mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

        if (M[1])
        {
            teta += (M.mx - M.x) * 0.5;
            phi += (M.my - M.y) * 0.5;

            angley -= (M.mx - M.x) * 0.5;
            anglez += (M.my - M.y) * 0.5;
            /*M.x = M.mx;
            M.y = M.my;

            if (angley > 90)
                angley = -90;
            if (angley < -90)
                angley = 90;*/

            anglez += (M.mx - M.x) * 0.005;
            //mouvement sur X de la souris -> changement de la rotation horizontale
            angley -= (M.my - M.y) * 0.005;
            //mouvement sur Y de la souris -> changement de la rotation verticale
            //pour éviter certains problèmes, on limite la rotation verticale à des angles entre -90° et 90°
            if (angley > 90)
                angley = 90;
            else if (angley < -90)
                angley = -90;

            M.x = M.mx;
            M.y = M.my;
        }

        var pas = 1;

        var vdir = [tx - px, 0, tz - pz];
        vec3.normalize(vdir);

        if (K[37]) { // gauche
            angley += 1;

            /*position[2] -= Math.sin(teta) * 1;
            position[0] += Math.cos(teta) * 1;*/

            look[0] -= _left[0];
            look[2] -= _left[2];
        }
        if (K[38]) { // haut
            px += vdir[0];
            pz += vdir[2];

            /*position[2] += Math.cos(teta) * 1;
            position[0] += Math.sin(teta) * 1;*/

            look[0] -= _forward.X;
            look[2] -= _forward.Y;
        }
        if (K[39]) { // droite
            angley -= 1;

            /*position[2] += Math.sin(teta) * 1;
            position[0] -= Math.cos(teta) * 1;*/

            look[0] += _left[0];
            look[2] += _left[2];
        }
        if (K[40]) { // bas
            px -= vdir[0];
            pz -= vdir[2];

            /*position[2] -= Math.cos(teta) * 1;
            position[0] -= Math.sin(teta) * 1;*/

            look[0] += _forward.X;
            look[2] += _forward.Y;
        }

        z = 10 * Math.cos(angley * 3.14 / 180.0);
        y = 10 * Math.cos(angley * 3.14 / 180) * Math.sin(anglez * 3.14 / 180.0);
        x = 10 * Math.cos(angley * 3.14 / 180) * Math.cos(anglez * 3.14 / 180.0);

        //console.log(position);
        //console.log(look);

        /*if (phi > 89)
            phi = 89;
        else if (phi < -89)
            phi = -89;*/

        
        //passage des coordonnées sphériques aux coordonnées cartésiennes
        var r_temp = Math.cos(phi*3.14/180);
        _forward.Z = Math.sin(phi*3.14/180);
        _forward.X = r_temp*Math.cos(teta*3.14/180);
        _forward.Y = r_temp*Math.sin(teta*3.14/180);
        //diantre mais que fait ce passage ?
        
        vec3.cross([0.0,1.0,0.0], [_forward.X, _forward.Y, _forward.Z], _left);
        vec3.normalize(_left);

        //avec la position de la caméra et la direction du regard, on calcule facilement ce que regarde la caméra (la cible)
        //_target = _position + _forward;
        position[0] = look[0] + _forward.X * 10;
        position[1] = look[1] + _forward.Z * 10;
        position[2] = look[2] + _forward.Y * 10;

        /*console.log(position);
        console.log(look);
        console.log(_left);
        console.log(phi + '  ' + teta);*/

        mat4.lookAt(position, look, [0, 1, 0], mvMatrix);

        /*mat4.rotate(mvMatrix, angley, [0, 0, 1]);
        mat4.rotate(mvMatrix, anglez, [0, 1, 0]);*/

        /*look[0] = position[0] + Math.sin(teta) * rayon;
        look[1] = position[1] + Math.sin(phi) * rayon;
        look[2] = position[2] + Math.cos(teta) * rayon;

        mat4.lookAt(position, look, [0, 1, 0], mvMatrix);*/
        
        //stack.push(mat4.create(mvMatrix));
        
        pt.draw([bv.buffer, bt.buffer, bi.buffer], tt, pMatrix, mvMatrix, look);

        sky.draw(pt, pMatrix, mvMatrix, [-150, 0, -150]);
        
        ter.draw(ptl, pMatrix, mvMatrix, [-150, -125, -150]);
    }, 100);
});