function initShaders(gl) {
    // Vertex Shader
    let vertexShaderSource = `
        attribute vec4 aPosition;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main(void) {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
        }
    `;

    // Fragment Shader
    let fragmentShaderSource = `
        precision mediump float;
        void main(void) {
            gl_FragColor = vec4(0.8, 0.3, 0.3, 1.0); // Set color to red-ish
        }
    `;

    // Compile and link shaders
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Check if program was linked successfully
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Failed to link shader program:', gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    gl.useProgram(shaderProgram);

    // Get attribute and uniform locations
    shaderProgram.aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    shaderProgram.uModelMatrix = gl.getUniformLocation(shaderProgram, "uModelMatrix");
    shaderProgram.uViewMatrix = gl.getUniformLocation(shaderProgram, "uViewMatrix");
    shaderProgram.uProjectionMatrix = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");

    return shaderProgram;
}