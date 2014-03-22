
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

    setInterval(function () {
        console.log(M[1] + ' ' + M[3] + ' ' + x + ' ' + y);
    }, 1000);
});