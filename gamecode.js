async function init() {
    const canvas = document.getElementById('canvas');
    
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    const context = canvas.getContext('gpupresent');

    const swapChainFormat = 'bgra8unorm';
    const swapChain = context.configureSwapChain({
        device,
        format: swapChainFormat
    });

    const vertexShaderModule = device.createShaderModule({
        code: `
            [[stage(vertex)]]
            fn main([[location(0)]] position: vec2<f32>) -> [[builtin(position)]] vec4<f32> {
                return vec4<f32>(position, 0.0, 1.0);
            }`
    });

    const fragmentShaderModule = device.createShaderModule({
        code: `
            [[stage(fragment)]]
            fn main() -> [[location(0)]] vec4<f32> {
                return vec4<f32>(1.0, 0.0, 0.0, 1.0);
            }`
    });

    const pipeline = device.createRenderPipeline({
        vertex: {
            module: vertexShaderModule,
            entryPoint: 'main'
        },
        fragment: {
            module: fragmentShaderModule,
            entryPoint: 'main',
            targets: [{
                format: swapChainFormat
            }]
        },
        primitive: {
            topology: 'triangle-list'
        }
    });

    const commandEncoder = device.createCommandEncoder();
    const textureView = swapChain.getCurrentTexture().createView();

    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
            storeOp: 'store'
        }]
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.endPass();

    device.queue.submit([commandEncoder.finish()]);
}

export default init;
