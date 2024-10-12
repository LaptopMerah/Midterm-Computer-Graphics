"use strict";

var MidtermGrafkom = function () {
  var canvas;
  var gl;

  var numPositions = 108;

  var positionsArray = [];
  var colorsArray = [];

  const A = (1 + Math.sqrt(5)) / 2; // The golden ratio
  const B = 1 / A;

  var vertices = [
    vec4(1, 1, 1, 1.0),
    vec4(1, 1, -1, 1.0),
    vec4(1, -1, 1, 1.0),
    vec4(1, -1, -1, 1.0),
    vec4(-1, 1, 1, 1.0),
    vec4(-1, 1, -1, 1.0),
    vec4(-1, -1, 1, 1.0),
    vec4(-1, -1, -1, 1.0),
    vec4(0, B, A, 1.0),
    vec4(0, B, -A, 1.0),
    vec4(0, -B, A, 1.0),
    vec4(0, -B, -A, 1.0),
    vec4(B, A, 0, 1.0),
    vec4(B, -A, 0, 1.0),
    vec4(-B, A, 0, 1.0),
    vec4(-B, -A, 0, 1.0),
    vec4(A, 0, B, 1.0),
    vec4(A, 0, -B, 1.0),
    vec4(-A, 0, B, 1.0),
    vec4(-A, 0, -B, 1.0),
  ];

  for (var i = 0; i < vertices.length; i++) {
    vertices[i][0] /= 2; // Scale the x component
    vertices[i][1] /= 2; // Scale the y component
    vertices[i][2] /= 2; // Scale the z component
  }

  var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0), // black
    vec4(1.0, 0.0, 0.0, 1.0), // red
    vec4(1.0, 1.0, 0.0, 1.0), // yellow
    vec4(0.0, 1.0, 0.0, 1.0), // green
    vec4(0.0, 0.0, 1.0, 1.0), // blue
    vec4(1.0, 0.0, 1.0, 1.0), // magenta
    vec4(0.0, 1.0, 1.0, 1.0), // cyan
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(0.5, 0.5, 0.5, 1.0), // gray
    vec4(1.0, 0.5, 0.0, 1.0), // orange
    vec4(0.5, 0.0, 0.5, 1.0), // purple
    vec4(0.5, 1.0, 0.5, 1.0), // light green
    vec4(0.5, 0.5, 1.0, 1.0), // light blue
    vec4(1.0, 0.5, 1.0, 1.0), // pink
    vec4(0.0, 0.5, 1.0, 1.0), // sky blue
    vec4(1.0, 1.0, 0.5, 1.0), // light yellow
    vec4(0.0, 1.0, 0.5, 1.0), // teal
    vec4(0.5, 0.0, 0.0, 1.0), // dark red
    vec4(0.0, 0.5, 0.0, 1.0), // dark green
    vec4(0.0, 0.0, 0.5, 1.0), // dark blue
  ];

  var near = 0.3;
  var far = 3.0;
  var radius = 2.0;
  var theta = 0.0;
  var phi = 0.0;
  var dr = (5.0 * Math.PI) / 180.0;

  var fovy = 60.0; // Field-of-view in Y direction angle (in degrees)
  var aspect; // Viewport aspect ratio

  var modelViewMatrixLoc, projectionMatrixLoc;
  var modelViewMatrix, projectionMatrix;
  var eye;
  const at = vec3(0.0, 0.0, 0.0);
  const up = vec3(0.0, 1.0, 0.0);

  function dedocahedron(a, b, c, d, e) {
    positionsArray.push(vertices[a]);
    positionsArray.push(vertices[b]);
    positionsArray.push(vertices[c]);
    positionsArray.push(vertices[a]);
    positionsArray.push(vertices[c]);
    positionsArray.push(vertices[d]);
    positionsArray.push(vertices[a]);
    positionsArray.push(vertices[e]);
    positionsArray.push(vertices[d]);

    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
    colorsArray.push(vertexColors[a]);
  }

  init();

  function colorDodecahedron() {
    // Membentuk dodecahedron menggunakan pentagon()
    // Setiap wajah pentagonal didefinisikan oleh 5 vertex dari vertices array

    dedocahedron(0, 16, 2, 10, 8); // Wajah 1
    dedocahedron(0, 8, 4, 14, 12); // Wajah 2
    dedocahedron(16, 17, 1, 12, 0); // Wajah 3
    dedocahedron(1, 9, 11, 3, 17); // Wajah 4
    dedocahedron(1, 12, 14, 5, 9); // Wajah 5
    dedocahedron(2, 13, 15, 6, 10); // Wajah 6
    dedocahedron(13, 3, 17, 16, 2); // Wajah 7
    dedocahedron(3, 11, 7, 15, 13); // Wajah 8
    dedocahedron(4, 8, 10, 6, 18); // Wajah 9
    dedocahedron(14, 5, 19, 18, 4); // Wajah 10
    dedocahedron(5, 19, 7, 11, 9); // Wajah 11
    dedocahedron(15, 7, 19, 18, 6); // Wajah 12
  }

  function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext("webgl2");
    if (!gl) alert("WebGL 2.0 isn't available");
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect = canvas.width / canvas.height;

    gl.clearColor(0.0, 0.0, 0.0, 0.3);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorDodecahedron();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    // buttons for viewing parameters

    document.getElementById("Button1").onclick = function () {
      near *= 1.1;
      far *= 1.1;
    };
    document.getElementById("Button2").onclick = function () {
      near *= 0.9;
      far *= 0.9;
    };
    document.getElementById("Button3").onclick = function () {
      radius *= 2.0;
    };
    document.getElementById("Button4").onclick = function () {
      radius *= 0.5;
    };
    document.getElementById("Button5").onclick = function () {
      theta += dr;
    };
    document.getElementById("Button6").onclick = function () {
      theta -= dr;
    };
    document.getElementById("Button7").onclick = function () {
      phi += dr;
    };
    document.getElementById("Button8").onclick = function () {
      phi -= dr;
    };

    render();
  }

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(theta)
    );
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    requestAnimationFrame(render);
  }
};
MidtermGrafkom();
