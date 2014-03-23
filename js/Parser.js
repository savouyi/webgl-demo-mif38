
var Parse = {};

Parse.obj = function (str) {
    var o = {
        v: [],
        t: [],
        n: [],
        i: []
    };

    var v = [];
    var t = [];
    var n = [];
    var f = [];

    var minx = null, miny = null, minz = null;
    var maxx = null, maxy = null, maxz = null;

    var l = str.split('\n');

    console.log(l);

    for (var i = 0; i < l.length; i++) {
        if (l[i][0] == 'v' && l[i][1] == ' ') {
            var p = l[i].split(' ');
            var x = parseFloat(p[1]);
            var y = parseFloat(p[2]);
            var z = parseFloat(p[3]);
            v.push([x, y, z]);
            // bouding box
            if (minx == null) {
                minx = maxx = x;
                miny = maxy = y;
                minz = maxz = z;
            }

            if (minx > x) minx = x;
            if (miny > y) miny = y;
            if (minz > z) minz = z;

            if (maxx < x) maxx = x;
            if (maxy < y) maxy = y;
            if (maxz < z) maxz = z;
        }
        else if (l[i][0] == 'v' && l[i][1] == 't') {
            var p = l[i].split(' ');
            var x = parseFloat(p[1]);
            var y = parseFloat(p[2]);
            t.push([x, y]);
        }
        else if (l[i][0] == 'v' && l[i][1] == 'n') {
            var p = l[i].split(' ');
            var x = parseFloat(p[1]);
            var y = parseFloat(p[2]);
            var z = parseFloat(p[3]);
            n.push([x, y, z]);
        }
        else if (l[i][0] == 'f' && l[i][1] == ' ') {
            var p = l[i].split(' ');

            for (var j = 1; j < 4; j++) {
                var b = p[j].split('/');
                var x = parseInt(b[0] - 1);
                var y = parseInt(b[1] - 1);
                var z = parseInt(b[2] - 1);

                f.push([x, y, z]);
            }
        }
    }

    console.log(v);
    console.log(t);
    console.log(n);
    console.log(f);
    console.log(minx + ' ' + miny + ' ' + minz + ' ' + maxx + ' ' + maxy + ' ' + maxz);

    for (var k = 0; k < f.length; k++) {
        var vv = f[k][0];
        var tt = f[k][1];
        var nn = f[k][2];
    }
};