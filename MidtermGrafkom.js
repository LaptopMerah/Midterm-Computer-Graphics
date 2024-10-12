"use strict";

var MidtermGrafkom = function () {
  var canvas;
  var gl;

  var numPositions = 36;

  var positionsArray = [];
  var normalsArray = [];
  var colorsArray = [];

  //?
  var objectPositionX = 0.0; // Current X position of the object
  var objectPositionY = 0.0; // Current Y position of the object
  var targetPositionX = 3; // Target X position for movement
  var targetPositionY = 3; // Target Y position for movement
  var isMovingX = false; // Track if the cube is moving along X
  var isMovingY = false; // Track if the cube is moving along Y
  var speedX = 0.01; // Default speed for X movement
  var speedY = 0.01; // Default speed for Y movement
  var canvasBoundary = 3.0; 

  var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
  ];

  var objectColor = vec4(1.0, 1.0, 1.0, 0.0);

  var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
  var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
  var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

  var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
  var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
  var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
  var materialShininess = 20.0;

  var ctm;
  var ambientColor, diffuseColor, specularColor;
  var modelViewMatrix, projectionMatrix;
  var viewerPos;
  var program;
  var aspect;

  var xAxis = 0;
  var yAxis = 1;
  var zAxis = 2;
  var axis = 0;
  var theta = vec3(0, 0, 0);

  var thetaLoc;

  var flag = false;

  init();

  function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    normal = vec3(normal);

    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    colorsArray.push(objectColor);
    positionsArray.push(vertices[b]);
    normalsArray.push(normal);
    colorsArray.push(objectColor);
    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    colorsArray.push(objectColor);
    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    colorsArray.push(objectColor);
    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    colorsArray.push(objectColor);
    positionsArray.push(vertices[d]);
    normalsArray.push(normal);
    colorsArray.push(objectColor);
  }

  function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
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

    colorCube();

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

    //?
    document.getElementById("ButtonMoveX").onclick = function () {
      speedX = parseFloat(document.getElementById("speedX").value); // Get speed from input
      if (!isMovingX) { // Start movement only if it's not already moving
        isMovingX = true;
      }
    };
    
    // Button to start Y movement with input speed
    document.getElementById("ButtonMoveY").onclick = function () {
      speedY = parseFloat(document.getElementById("speedY").value); // Get speed from input
      if (!isMovingY) { // Start movement only if it's not already moving
        isMovingY = true;
      }
    };
    
    // Button to start diagonal movement (both X and Y) with the speeds from input fields
    document.getElementById("ButtonMoveDiagonal").onclick = function () {
      speedX = parseFloat(document.getElementById("speedX").value); // Get speed from input
      speedY = parseFloat(document.getElementById("speedY").value); // Get speed from input
      if (!isMovingX && !isMovingY) { // Start movement only if it's not already moving
        isMovingX = true;
        isMovingY = true;
      }
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

    render();
  }

  //?

  function resetPosition() {
    objectPositionX = 0.0;
    objectPositionY = 0.0;
    isMovingX = false;     // Stop X movement
    isMovingY = false;  
  }
  

  function moveObjectX() {
    objectPositionX += speedX; // Move the object along X
  
    if (objectPositionX > canvasBoundary || objectPositionX < -canvasBoundary) {
      resetPosition(); // Reset the object if it moves off the canvas
      isMovingX = false; // Stop X movement
    }
  }
  
  // Function to move object along the Y axis and check boundaries
  function moveObjectY() {
    objectPositionY += speedY; // Move the object along Y
  
    if (objectPositionY > canvasBoundary || objectPositionY < -canvasBoundary) {
      resetPosition(); // Reset the object if it moves off the canvas
      isMovingY = false; // Stop Y movement
    }
  }
  
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag) theta[axis] += 2.0;

    if (isMovingX) moveObjectX();
    if (isMovingY) moveObjectY();

    modelViewMatrix = mat4();

    modelViewMatrix = mult(
      modelViewMatrix, 
      translate(objectPositionX, objectPositionY, 0));

    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[xAxis], vec3(1, 0, 0))
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[yAxis], vec3(0, 1, 0))
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[zAxis], vec3(0, 0, 1))
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
};
MidtermGrafkom();
