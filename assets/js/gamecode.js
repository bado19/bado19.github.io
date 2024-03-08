async function init() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    // Create a canvas and configure WebGPU context
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('gpupresent');

    const swapChain = context.configureSwapChain({
        device,
        format: 'bgra8unorm'
    });

    // Vertex shader code
    const vertexShaderModule = device.createShaderModule({
        code: `
            [[stage(vertex)]]
            fn main([[location(0)]] position: vec2<f32>) -> [[builtin(position)]] vec4<f32> {
                return vec4<f32>(position, 0.0, 1.0);
            }`
    });

    // Fragment shader code
    const fragmentShaderModule = device.createShaderModule({
        code: `
            [[stage(fragment)]]
            fn main() -> [[location(0)]] vec4<f32> {
                return vec4<f32>(1.0, 0.0, 0.0, 1.0); // Red color
            }`
    });

    // Define the render pipeline
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: vertexShaderModule,
            entryPoint: 'main'
        },
        fragment: {
            module: fragmentShaderModule,
            entryPoint: 'main',
            targets: [{
                format: 'bgra8unorm'
            }]
        },
        primitive: {
            topology: 'triangle-list'
        }
    });

    // Create a command encoder
    const commandEncoder = device.createCommandEncoder();

    // Get the current texture from the swap chain
    const textureView = swapChain.getCurrentTexture().createView();

    // Define render pass descriptor
    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }, // Clear color to black
            storeOp: 'store'
        }]
    };

    // Begin render pass
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    // Set the pipeline for the render pass
    passEncoder.setPipeline(pipeline);

    // Draw the triangle
    passEncoder.draw(3, 1, 0, 0);

    // End render pass
    passEncoder.endPass();

    // Submit the command encoder
    device.queue.submit([commandEncoder.finish()]);
}

export default init;
