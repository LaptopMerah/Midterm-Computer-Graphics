let gl, shaderProgram;
let shape = 'cube';
let acceleration = { x: 0.0, y: 0.0, z: 0.0 };
let velocity = { x: 0.0, y: 0.0, z: 0.0 };
let position = { x: 0.0, y: 0.0, z: 0.0 };
let lastTime = 0;

function main() {
    const canvas = document.getElementById('glcanvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // Function to handle resizing the canvas and updating the viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
      
    // Event listener to trigger canvas resize on window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize shaders
    shaderProgram = initShaders(gl);

    // Set up buffers for the shape (Cube by default)
    let currentShapeBuffer = createCubeBuffer();

    // Handle UI input for shape change
    document.getElementById("shape").addEventListener("change", (event) => {
        shape = event.target.value;
        if (shape === "cube") {
            currentShapeBuffer = createCubeBuffer();
        } else if (shape === "prism") {
            currentShapeBuffer = createPrismBuffer();
        } else if (shape === "dodecahedron") {
            currentShapeBuffer = createDodecahedronBuffer();
        }
    });

    // Apply force when button is clicked
    document.getElementById("applyForce").addEventListener("click", () => {
        acceleration = { x: 0.5, y: 1.0, z: 0.0 }; // Example force applied
    });

    function render() {
        // Clear canvas and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Apply physics (update velocity, position based on acceleration)
        applyPhysics();

        // Update camera based on input
        updateCamera();

        // Draw the selected shape
        drawShape(currentShapeBuffer);

        requestAnimationFrame(render); // Continue the render loop
    }

    render();
}

// Create buffer for Cube
function createCubeBuffer() {
    const vertices = createCube();
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    return vertexBuffer;
}

// Create buffer for Prism
function createPrismBuffer() {
    const vertices = createPrism();
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    return vertexBuffer;
}

// Create buffer for Dodecahedron
function createDodecahedronBuffer() {
    const vertices = createDodecahedron();
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    return vertexBuffer;
}

// Apply basic physics to object (Newton's second law)
function applyPhysics() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Update velocity with acceleration
    velocity.x += acceleration.x * deltaTime;
    velocity.y += acceleration.y * deltaTime;
    velocity.z += acceleration.z * deltaTime;

    // Update position with velocity
    position.x += velocity.x * deltaTime;
    position.y += velocity.y * deltaTime;
    position.z += velocity.z * deltaTime;

    // Reset acceleration (force only applied momentarily)
    acceleration = { x: 0.0, y: 0.0, z: 0.0 };
}

// Update the camera/view matrix to reflect object position
function updateCamera() {
    const modelMatrix = mat4.create(); // Using glMatrix for matrix operations
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    // Get camera values from UI
    const cameraX = parseFloat(document.getElementById("cameraX").value);
    const cameraY = parseFloat(document.getElementById("cameraY").value);
    const cameraZ = parseFloat(document.getElementById("cameraZ").value);

    // Update perspective projection with correct aspect ratio
    const aspectRatio = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projectionMatrix, Math.PI / 4, aspectRatio, 0.1, 100.0);

    // Set camera position based on input
    mat4.translate(viewMatrix, viewMatrix, [cameraX, cameraY, -cameraZ]);
    mat4.translate(modelMatrix, modelMatrix, [position.x, position.y, position.z]);

    // Pass updated matrices to shader
    gl.uniformMatrix4fv(shaderProgram.uModelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(shaderProgram.uViewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, projectionMatrix);
}

// Draw the selected shape
function drawShape(shapeBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
    gl.vertexAttribPointer(shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.aPosition);

    // Adjust vertexCount based on the shape
    const vertexCount = shape === 'cube' ? 36 : shape === 'prism' ? 18 : 60; // Adjust for each shape
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

return shaderProgram;


// Compile a shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create a cube's vertex positions
function createCube() {
    return new Float32Array([
        // Front face
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1, -1,  1,
         1,  1,  1,
        -1,  1,  1,
        // Back face
        -1, -1, -1,
        -1,  1, -1,
         1, -1, -1,
        -1,  1, -1,
         1,  1, -1,
         1, -1, -1,
        // Left face
        -1, -1, -1,
        -1, -1,  1,
        -1,  1,  1,
        -1, -1, -1,
        -1,  1,  1,
        -1,  1, -1,
        // Right face
         1, -1, -1,
         1,  1, -1,
         1, -1,  1,
         1, -1,  1,
         1,  1, -1,
         1,  1,  1,
        // Top face
        -1,  1, -1,
         1,  1, -1,
         1,  1,  1,
        -1,  1, -1,
         1,  1,  1,
        -1,  1,  1,
        // Bottom face
        -1, -1, -1,
        -1, -1,  1,
         1, -1, -1,
        -1, -1,  1,
         1, -1,  1,
         1, -1, -1
    ]);
}

// Create a triangular prism
function createPrism() {
    return new Float32Array([
        // Base
        -1, 0, 1,   // Vertex 1
         1, 0, 1,   // Vertex 2
         0, 0, -1,  // Vertex 3

        // Sides
        -1, 0, 1,   // Base vertex 1
         1, 0, 1,   // Base vertex 2
         0, 2, 0,   // Top vertex

        -1, 0, 1,   // Base vertex 1
         0, 0, -1,  // Base vertex 3
         0, 2, 0,   // Top vertex

         1, 0, 1,   // Base vertex 2
         0, 0, -1,  // Base vertex 3
         0, 2, 0,   // Top vertex
    ]);
}

// Create a dodecahedron (simplified)
function createDodecahedron() {
    const A = (1 + Math.sqrt(5)) / 2; // The golden ratio
  const B = 1 / A;

  return new Float32Array([
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
  ]);
}

main();
