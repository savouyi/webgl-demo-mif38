
$(function () {
    var canvas = document.getElementById('demo');
    canvas.width = $(window).width();
    canvas.height = $(window).height();

    //Creation du contxt
    var context = new GL("demo");

    var prog = new PROGRAM.textureLight(context.gl, 'vertex-shader-light', 'fragment-shader-light');
    var text = new TEXTURE(context.gl, 'images/bamboo.png');
    var monkey = null;
    
    $.ajax({
        type: "GET",
        url: "data/monkey.html",
        dataType: 'text'
    })
    .done(function (msg) {
        monkey = Parse.obj(context.gl, msg);
        //alert("Data Saved: " + msg);
    });

    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();

    var camera = new Camera([10, -1, 0], [0, 0, 0], mvMatrix);

    //mise a jour
    setInterval(function () {

        //rendu
        context.gl.viewport(0, 0, context.gl.viewportWidth, context.gl.viewportHeight);
        context.gl.clear(context.gl.COLOR_BUFFER_BIT | context.gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, context.gl.viewportWidth / context.gl.viewportHeight, 0.001, 1000.0, pMatrix);

        mat4.identity(mvMatrix);

        camera.update();

        prog.drawParsed(monkey, text, pMatrix, mvMatrix, [0, 0, 0]);
    }, 100);
});