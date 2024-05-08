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
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

// Function to initialize the shader program
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

// Function to compile a shader
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

// Function to initialize buffers for the pyramid
function initPyramidBuffers(gl) {
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

    return {
        position: positionBuffer,
        numVertices: positions.length / 3
    };
}

// Function to initialize buffers for the terrain
function initTerrainBuffers(gl) {
    const positions = [
        -5.0, -1.0, -2.0,
        -2.0, -1.0,  2.0,
         2.0, -1.0,  2.0,

         2.0, -1.0,  2.0,
         2.0, -1.0, -2.0,
        -2.0, -1.0, -2.0,
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        numVertices: positions.length / 3
    };
}

// Function to create a pyramid object
function createPyramid(position) {
    return {
        type: 'pyramid',
        position: position,
        link: 'https://example.com/pyramid-link' // Add link property if needed
    };
}

// Function to create a terrain object
function createTerrain(position, size) {
    return {
        type: 'terrain',
        position: position,
        size: size,
        link: 'https://example.com/terrain-link' // Add link property if needed
    };
}

// Create an array of objects using the functions
const objects = [
    createPyramid([1.0, -10.0, 0.0]),

    createPyramid([1.0, -1.0, 0.0]),
    createTerrain([2.0, 0.0, 0.0], 5.0)
];

// Function to draw the scene
function drawScene(gl, programInfo, objects, position, rotation, pyramidBuffers, terrainBuffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, 100.0);

    for (const object of objects) {
        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, position);
        mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 1, 0]);

        let objectBuffers;
        if (object.type === 'pyramid') {
            objectBuffers = pyramidBuffers;
        } else if (object.type === 'terrain') {
            objectBuffers = terrainBuffers;
        } else {
            console.error('Unknown object type:', object.type);
            continue;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, objectBuffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.useProgram(programInfo.program);
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

        const objectVertexCount = objectBuffers.numVertices;
        gl.drawArrays(gl.TRIANGLES, 0, objectVertexCount);
    }
}

let anima = 1;
let requestId;
let rot = 0.01;

// Main function
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

    const pyramidBuffers = initPyramidBuffers(gl);
    const terrainBuffers = initTerrainBuffers(gl);

    // Initialize position and rotation
    let position = [0.0, 0.0, -5.0];
    let rotation = 0;

    // Function to update position and rotation based on key events
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
            case 'p':
                anima = (anima + 1) % 2; // Toggle animation
                if (anima === 1) {
                    animate();
                } else {
                    cancelAnimationFrame(requestId);
                }
                break;
            case 'e':
                rot -= 0.001; // Decrease rotation speed
                break;
            case 'r':
                rot += 0.001; // Increase rotation speed
                break;
        }
    }

    // Function to animate the scene
    function animate() {
        rotation += rot; // Update rotation
        drawScene(gl, programInfo, objects, position, rotation, pyramidBuffers, terrainBuffers);
        requestId = requestAnimationFrame(animate);
    }

    // Event listener for keydown events
    document.addEventListener('keydown', (event) => {
        updatePosition(event.key);
    });

    // Function to render the scene
    function render() {
        drawScene(gl, programInfo, objects, position, rotation, pyramidBuffers, terrainBuffers);
        if (anima === 1) {
            requestId = requestAnimationFrame(render);
        }
    }

    // Start animation or rendering based on the initial state of `anima`
    if (anima === 1) {
        animate();
    } else {
        render();
    }
}

// Call the main function when the window loads
window.onload = main;
