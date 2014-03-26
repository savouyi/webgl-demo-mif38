
var Parse = {};

Parse.obj = function (gl, str) {
    var o = {
        v: [],
        t: [],
        n: [],
        i: [],

        bv: [],
        bt: [],
        bn: [],
        bi: [],

        nb: 0
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
                var x = parseInt(b[0]) - 1;
                var y = parseInt(b[1]) - 1;
                var z = parseInt(b[2]) - 1;

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
        var h = k - parseInt(k / 65534) * 65534;
        var vv = f[k][0];
        var tt = f[k][1];
        var nn = f[k][2];

        o.i.push(h);
        o.v.push(v[vv][0]); o.v.push(v[vv][1]); o.v.push(v[vv][2]);
        o.t.push(t[tt][0]); o.t.push(t[tt][1]);
        o.n.push(n[nn][0]); o.n.push(n[nn][1]); o.n.push(n[nn][2]);

        if (h == 65534) { // max pour index
            
            o.bv.push(new BUFFER(gl, o.v, 3, false));
            o.bt.push(new BUFFER(gl, o.t, 2, false));
            o.bn.push(new BUFFER(gl, o.n, 3, false));
            o.bi.push(new BUFFER(gl, o.i, 1, true));

            o.nb++;

            o.i.clear();
            o.v.clear();
            o.t.clear();
            o.n.clear();
        }
    }

    o.bv.push(new BUFFER(gl, o.v, 3, false));
    o.bt.push(new BUFFER(gl, o.t, 2, false));
    o.bn.push(new BUFFER(gl, o.n, 3, false));
    o.bi.push(new BUFFER(gl, o.i, 1, true));

    o.nb++;

    return o;
};