"use strict";

var MidtermGrafkom = function () {
  var canvas;
  var gl;

  var numPositions = 108;

  var positionsArray = [];
  var normalsArray = [];
  var colorsArray = [];

  var objectPositionX = 0.0; // Current X position of the object
  var objectPositionY = 0.0; // Current Y position of the object
  var isMovingX = false; // Track if the cube is moving along X
  var isMovingY = false; // Track if the cube is moving along Y
  var speedX = 0.01; // Default speed for X movement
  var speedY = 0.01; // Default speed for Y movement
  var canvasBoundary = 3.0;

  const A = (1 + Math.sqrt(5)) / 2;
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
    vertices[i][0] /= 4; // Scale the x component
    vertices[i][1] /= 4; // Scale the y component
    vertices[i][2] /= 4; // Scale the z component
  }

  var objectColor = vec4(1.0, 1.0, 1.0, 0.0);

  var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
  var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
  var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

  var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
  var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
  var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
  var materialShininess = 20.0;

  var ambientColor, diffuseColor, specularColor;
  var modelViewMatrix, projectionMatrix;
  var viewerPos;
  var program;
  var aspect;

  let timerInterval;
  const waktuInterval = 100;
  var gravitasi = 0.025;
  var gayaGesek;
  var koefGesek = 0.01;
  var accelerationX = 0.0;
  var accelerationY = 0.0;

  var xAxis = 0;
  var yAxis = 1;
  var zAxis = 2;
  var axis = 0;
  var theta = vec3(0, 0, 0);

  var thetaLoc;

  var flag = false;

  init();

  function dedocahedron(a, b, c, d, e) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = normalize(vec3(normal));

    positionsArray.push(vertices[a]);
    positionsArray.push(vertices[b]);
    positionsArray.push(vertices[c]);
    positionsArray.push(vertices[a]);
    positionsArray.push(vertices[c]);
    positionsArray.push(vertices[d]);
    positionsArray.push(vertices[a]);
    positionsArray.push(vertices[e]);
    positionsArray.push(vertices[d]);

    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);
    normalsArray.push(normal);

    colorsArray.push(objectColor);
    colorsArray.push(objectColor);
    colorsArray.push(objectColor);
    colorsArray.push(objectColor);
    colorsArray.push(objectColor);
    colorsArray.push(objectColor);
    colorsArray.push(objectColor);
    colorsArray.push(objectColor);
    colorsArray.push(objectColor);
  }

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
    aspect = canvas.width / canvas.height;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.3);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorDodecahedron();

    numPositions = positionsArray.length;

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0);

    projectionMatrix = ortho(-aspect, aspect, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("ButtonX").onclick = function () {
      axis = xAxis;
    };
    document.getElementById("ButtonY").onclick = function () {
      axis = yAxis;
    };
    document.getElementById("ButtonZ").onclick = function () {
      axis = zAxis;
    };
    document.getElementById("ButtonT").onclick = function () {
      flag = !flag;
    };

    document.getElementById("ambientColor").oninput = function (event) {
      var lightAmbient = hexToRGBA(event.target.value);
      ambientProduct = mult(lightAmbient, materialAmbient);
      gl.uniform4fv(
        gl.getUniformLocation(program, "uAmbientProduct"),
        ambientProduct
      );
    };

    document.getElementById("diffuseColor").oninput = function (event) {
      var lightDiffuse = hexToRGBA(event.target.value);
      diffuseProduct = mult(lightDiffuse, materialDiffuse);
      gl.uniform4fv(
        gl.getUniformLocation(program, "uDiffuseProduct"),
        diffuseProduct
      );
    };

    document.getElementById("specularColor").oninput = function (event) {
      var lightSpecular = hexToRGBA(event.target.value);
      specularProduct = mult(lightSpecular, materialSpecular);
      gl.uniform4fv(
        gl.getUniformLocation(program, "uSpecularProduct"),
        specularProduct
      );
    };

    document.getElementById("objectColor").oninput = function (event) {
      objectColor = hexToRGBA(event.target.value);
      gl.uniform4fv(
        gl.getUniformLocation(program, "uObjectColor"),
        objectColor
      );
    };

    document.getElementById("KoefGesek").oninput = function (event) {
      koefGesek = event.target.value;
    };

    document.getElementById("ButtonMoveX").onclick = function () {
      resetPosition();
      speedX = parseFloat(document.getElementById("speedX").value);
      isMovingX = true;
      startMoving();
    };

    document.getElementById("ButtonMoveY").onclick = function () {
      resetPosition();
      speedY = parseFloat(document.getElementById("speedY").value);
      isMovingY = true;
      startMoving();
    };

    document.getElementById("ButtonMoveDiagonal").onclick = function () {
      resetPosition();
      speedX = parseFloat(document.getElementById("speedX").value);
      speedY = parseFloat(document.getElementById("speedY").value);
      isMovingX = true;
      isMovingY = true;
      startMoving();
    };

    document.getElementById("lightX").oninput = function (event) {
      lightPosition[0] = event.target.value;
      updateLightPosition();
    };
    document.getElementById("lightY").oninput = function (event) {
      lightPosition[1] = event.target.value;
      updateLightPosition();
    };
    document.getElementById("lightZ").oninput = function (event) {
      lightPosition[2] = event.target.value;
      updateLightPosition();
    };

    gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      ambientProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      diffuseProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      specularProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uLightPosition"),
      lightPosition
    );
    gl.uniform4fv(gl.getUniformLocation(program, "uObjectColor"), objectColor);

    gl.uniform1f(
      gl.getUniformLocation(program, "uShininess"),
      materialShininess
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uProjectionMatrix"),
      false,
      flatten(projectionMatrix)
    );

    window.addEventListener("resize", function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      aspect = canvas.width / canvas.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
      projectionMatrix = ortho(-aspect, aspect, -1, 1, -100, 100);
      gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "uProjectionMatrix"),
        false,
        flatten(projectionMatrix)
      );
    });
    console.log("Ambient:", ambientProduct);
    console.log("Diffuse:", diffuseProduct);
    console.log("Specular:", specularProduct);
    console.log("Object Color:", objectColor);

    render();
  }

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag) theta[axis] += 2.0;

    modelViewMatrix = mat4();

    modelViewMatrix = mult(
      modelViewMatrix,
      translate(objectPositionX, objectPositionY, 0)
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[xAxis], vec3(0.2, 0, 0))
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[yAxis], vec3(0, 0.2, 0))
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[zAxis], vec3(0, 0, 0.2))
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uModelViewMatrix"),
      false,
      flatten(modelViewMatrix)
    );

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    requestAnimationFrame(render);
  }

  function updateLightPosition() {
    gl.uniform4fv(
      gl.getUniformLocation(program, "uLightPosition"),
      lightPosition
    );
  }

  function hexToRGBA(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    return vec4(r, g, b, 1.0); // Return RGBA as vec4
  }

  function startMoving() {
    if (speedX >= 0) {
      gayaGesek = -Math.abs(koefGesek * gravitasi); // Gaya gesek negatif jika speedX positif
    } else if (speedX < 0) {
      gayaGesek = Math.abs(koefGesek * gravitasi); // Gaya gesek positif jika speedX negatif
    }
    timerInterval = setInterval(
      () => perbaruiKecepatan(speedX, speedY, gayaGesek, gravitasi),
      waktuInterval
    );
  }
  function resetPosition() {
    objectPositionX = 0.0;
    objectPositionY = 0.0;
    isMovingX = false; // Stop X movement
    isMovingY = false;
    clearInterval(timerInterval);
    accelerationX = 0.0;
    accelerationY = 0.0;
    gayaGesek = 0;
  }

  function perbaruiKecepatan(speedX, speedY, gayaGesek, gravitasi) {
    if (isMovingX) {
      // Hitung akselerasi dengan mengurangi gaya gesek dari speedX
      accelerationX += (speedX + gayaGesek);

      // Update posisi objek berdasarkan akselerasi
      objectPositionX += accelerationX;

      // Reset posisi jika melewati batas
      if (Math.abs(objectPositionX) > canvasBoundary) {
        resetPosition(); // Reset jika keluar batas
      }
    }

    if (isMovingY && speedY != 0) {
      // Hitung akselerasi dengan menambah gravitasi
      accelerationY += gravitasi;

      // Update posisi objek dengan mengurangi akselerasi dari speedY
      objectPositionY += (speedY - accelerationY);

      // Reset posisi jika melewati batas
      if (Math.abs(objectPositionY) > canvasBoundary) {
        resetPosition(); // Reset jika keluar batas
      }
      render();
    }
  }
};
MidtermGrafkom();
