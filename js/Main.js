


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

    var cube = null;
    var skybox = null;
    var ocean = null;

    $.ajax({
        type: "GET",
        url: "data/cube.html",
        dataType: 'text'
    })
        .done(function (msg) {
            cube = Parse.obj(g.gl, msg);
            //alert("Data Saved: " + msg);
            console.log(cube);
        });

    $.ajax({
        type: "GET",
        url: "data/skydome.html",
        dataType: 'text'
    })
        .done(function (msg) {
            skybox = Parse.obj(g.gl, msg);
            //alert("Data Saved: " + msg);
            console.log(skybox + ' ' + typeof(skybox));
        });

    $.ajax({
        type: "GET",
        url: "data/mer.html",
        dataType: 'text'
    })
        .done(function (msg) {
            ocean = Parse.obj(g.gl, msg);
            //alert("Data Saved: " + msg);
        });


    var tt = new TEXTURE(g.gl, 'images/bamboo.png'); 
    var tsky = new TEXTURE(g.gl, 'images/skydome.png');
    var tmer = new TEXTURE(g.gl, 'images/t3.png');

    var angley = 0;
    var anglez = 0;
    var px = 10, py = 0, pz = 0;
    var tx = 0, ty = 0, tz = 0;
    var x = 0, y = 0, z = 0;
    var tty = 0.0;
    var sky = new SKYBOX(g.gl, 300, 'images/sky.png');
    var ter = new HEIGHTMAP(g.gl, 'images/hg.jpg', 'images/g1.jpg', 1, false, 256, 256);
    var mer = new MER(g.gl, [0, -10, 0], new TEXTURE(g.gl, 'images/t3.png'), tty);

    var position = [0, 35, 0];
    var look = [-40, 34, 40];
    var rayon = 10;
    var teta = 180;
    var phi = 35;

    var _forward = [0, 0, 0];
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

        //pt.drawParsed(cube, tt, pMatrix, mvMatrix, look);
        pt.drawParsed(skybox, tsky, pMatrix, mvMatrix, [0, 0, 0], [100, 100, 100]);
        ter.draw(ptl, pMatrix, mvMatrix, [-100, -5, -100]);

        ptm.drawParsed(ocean, tmer, pMatrix, mvMatrix, [0, 5, 0], [0.5,0.5,0.5]);
        //sky.draw(pt, pMatrix, mvMatrix, [-150, 0, -150]);
        


        //mer.draw(ptm, pMatrix, mvMatrix);

        tty += 0.5;

        //mer = new MER(g.gl, [0, -11, 0], new TEXTURE(g.gl, 'images/t3.png'), tty);
    }, 100);
});