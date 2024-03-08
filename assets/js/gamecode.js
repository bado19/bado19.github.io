 // Vertex shader program
 const vsSource = `
 attribute vec4 aVertexPosition;

 uniform mat4 uModelViewMatrix;
 uniform mat4 uProjectionMatrix;

 void main() {
     gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
 }
`;

// Fragment shader program
const fsSource = `
 void main() {
     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
 }
`;


function initShaderProgram(gl, vsSource, fsSource) {
 const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
 const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

 const shaderProgram = gl.createProgram();
 gl.attachShader(shaderProgram, vertexShader);
 gl.attachShader(shaderProgram, fragmentShader);
 gl.linkProgram(shaderProgram);

 if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
     console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
     return null;
 }

 return shaderProgram;
}

function loadShader(gl, type, source) {
 const shader = gl.createShader(type);
 gl.shaderSource(shader, source);
 gl.compileShader(shader);

 if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
     console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
     gl.deleteShader(shader);
     return null;
 }

 return shader;
}

function initBuffers(gl) {
 const positions = [
     // Base of the pyramid
     -0.5, -0.5,  0.5,
      0.5, -0.5,  0.5,
      0.5, -0.5, -0.5,

     -0.5, -0.5,  0.5,
      0.5, -0.5, -0.5,
     -0.5, -0.5, -0.5,

     // Front face
     -0.5, -0.5,  0.5,
      0.5, -0.5,  0.5,
      0.0,  0.5,  0.0,

     // Right face
      0.5, -0.5,  0.5,
      0.5, -0.5, -0.5,
      0.0,  0.5,  0.0,

     // Back face
      0.5, -0.5, -0.5,
     -0.5, -0.5, -0.5,
      0.0,  0.5,  0.0,

     // Left face
     -0.5, -0.5, -0.5,
     -0.5, -0.5,  0.5,
      0.0,  0.5,  0.0,
 ];

 const positionBuffer = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

 const numVertices = positions.length / 3; // Calculate number of vertices (each vertex has 3 components)

 return {
     position: positionBuffer,
     numVertices: numVertices
 };
}

function drawScene(gl, programInfo, buffers, position) {
 gl.clearColor(0.0, 0.0, 0.0, 1.0);
 gl.clearDepth(1.0);
 gl.enable(gl.DEPTH_TEST);
 gl.depthFunc(gl.LEQUAL);

 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

 const projectionMatrix = mat4.create();
 mat4.perspective(projectionMatrix, Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

 const modelViewMatrix = mat4.create();
 mat4.translate(modelViewMatrix, modelViewMatrix, position);

 gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
 gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
 gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

 gl.useProgram(programInfo.program);
 gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
 gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

 const vertexCount = buffers.numVertices; // Number of vertices for the pyramid
 gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

function main() {
 const canvas = document.querySelector('#glCanvas');
 const gl = canvas.getContext('webgl');

 if (!gl) {
     console.error('Unable to initialize WebGL. Your browser may not support it.');
     return;
 }

 const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

 const programInfo = {
     program: shaderProgram,
     attribLocations: {
         vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
     },
     uniformLocations: {
         projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
         modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
     },
 };

 const buffers = initBuffers(gl);

 // Initialize position
 let position = [0.0, 0.0, -5.0];

 // Function to update pyramid position
 function updatePosition(key) {
     switch (key) {
         case 'ArrowUp':
             position[1] += 0.1; // Move up
             break;
         case 'ArrowDown':
             position[1] -= 0.1; // Move down
             break;
         case 'ArrowLeft':
             position[0] -= 0.1; // Move left
             break;
         case 'ArrowRight':
             position[0] += 0.1; // Move right
             break;
     }
 }

 // Event listener for key presses
 document.addEventListener('keydown', (event) => {
     updatePosition(event.key);
     drawScene(gl, programInfo, buffers, position);
 });

 function render() {
     drawScene(gl, programInfo, buffers, position);
     requestAnimationFrame(render);
 }

 render();
}

window.onload = main;