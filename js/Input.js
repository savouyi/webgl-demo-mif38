
var K = {
    '37': false,
    '38': false,
    '39': false,
    '40': false
};

K.haut      = K[38];
K.bas       = K[40];
K.gauche    = K[37];
K.droite    = K[39];

var M = {
    '1': false,
    '2': false,
    '3': false,

    x: null,
    y: null,
    mx: 0,
    my: 0
};

$(function () {
    $('body').keydown(function (e) {
        K[e.which] = true;
    });

    $('body').keyup(function (e) {
        K[e.which] = false;
    });

    // souris

    var x, y;

    $('body').mousedown(function (e) {
        M[e.which] = true;
        M.x = M.mx = e.pageX;
        M.y = M.my = e.pageY;
    });

    $('body').mouseup(function (e) {
        M[e.which] = false;
    });

    $('body').mousemove(function (e) {
        if (M[1])
        {
            M.mx = e.pageX;
            M.my = e.pageY;
        }
    });

    /*setInterval(function () {
        console.log(M[1] + ' ' + M[3] + ' ' + x + ' ' + y);
    }, 1000);*/
});

var Camera = function (pos, look, vmat)
{
    this.teta = 0;
    this.phi = 0;

    this.pos = pos;
    this.look = look;
    this.vmat = vmat;

    this.forward = [1, 0, 0];
    this.left = [0, 0, 1];

    this.update = function () {
        var o = this;
        var teta = o.teta;
        var phi = o.phi;

        var _forward = o.forward;
        var _left = o.left;

        if (M[1]) {
            o.teta += (M.mx - M.x) * 0.5;
            o.phi += (M.my - M.y) * 0.5;

            if (o.phi > 89)
                o.phi = 89;
            else if (o.phi < -89)
                o.phi = -89;

            M.x = M.mx;
            M.y = M.my;
        }

        var ppp = 2;

        if (K[37]) { // gauche
            o.look[0] -= o.left[0] * ppp;
            o.look[2] -= o.left[2] * ppp;
        }
        if (K[38]) { // haut
            o.look[0] -= o.forward[0] * ppp;
            o.look[2] -= o.forward[2] * ppp;
        }
        if (K[39]) { // droite
            o.look[0] += o.left[0] * ppp;
            o.look[2] += o.left[2] * ppp;
        }
        if (K[40]) { // bas
            o.look[0] += o.forward[0] * ppp;
            o.look[2] += o.forward[2] * ppp;
        }

        var r_temp = Math.cos(o.phi * 3.14 / 180);

        o.forward[1] = Math.sin(o.phi * 3.14 / 180); // z
        o.forward[0] = r_temp * Math.cos(o.teta * 3.14 / 180); // x
        o.forward[2] = r_temp * Math.sin(o.teta * 3.14 / 180); // y

        vec3.cross([0.0, 1.0, 0.0], o.forward, o.left);
        vec3.normalize(o.left);

        o.pos[0] = o.look[0] + o.forward[0] * 10;
        o.pos[1] = o.look[1] + o.forward[1] * 10;
        o.pos[2] = o.look[2] + o.forward[2] * 10;

        mat4.lookAt(o.pos, o.look, [0, 1, 0], o.vmat);
    }
};