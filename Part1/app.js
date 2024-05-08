
const box_verts = [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0],	
                   [0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]]

const box_faces = [{verts: [0, 3, 2, 1], color: [0, 0, 1]}, // Bottom side	                   
                   {verts: [4, 5, 6, 7], color: [0, 0, 1]}, // Top side
                   {verts: [0, 1, 5, 4], color: [0, 1, 0]}, // Left side
                   {verts: [2, 3, 7, 6], color: [0, 1, 0]}, // Right side
                   {verts: [0, 4, 7, 3], color: [1, 0, 0]}, // Back side
                   {verts: [1, 2, 6, 5], color: [1, 0, 0]}] // Front side

const shadertext_boxes_vertex =`
  precision mediump float;

  attribute vec4 vertPosition;
  attribute vec3 vertColor;

  uniform mat4 object_to_world;
  uniform mat4 world_to_cam;
  uniform mat4 cam_to_view;


  varying vec3 fragColor;

  void main() {
      fragColor = vertColor;
      gl_Position = cam_to_view * world_to_cam * object_to_world * vertPosition;
  }
`

const shadertext_boxes_fragment =`
  precision mediump float;

  varying vec3 fragColor;

  void main(){
      gl_FragColor = vec4(fragColor, 1.0);
  }
 `
function build_gl_shader(shadertext, gl_ctx, gl_shader_type) {
    // Create a WebGLShader object
    let shader = gl_ctx.createShader(gl_shader_type);
    
    // Load and compile Shader
    gl_ctx.shaderSource(shader, shadertext);
    gl_ctx.compileShader(shader);

    return shader;
}

// Setup the Canvas and get WebGL Context
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;
const gl_ctx = canvas.getContext("webgl");

// Build Shaders
const shader_vertex = build_gl_shader(shadertext_boxes_vertex, gl_ctx, gl_ctx.VERTEX_SHADER);
const shader_fragment = build_gl_shader(shadertext_boxes_fragment, gl_ctx, gl_ctx.FRAGMENT_SHADER);

// Create and enable program
const program = gl_ctx.createProgram();
gl_ctx.attachShader(program, shader_vertex);
gl_ctx.attachShader(program, shader_fragment);
gl_ctx.linkProgram(program);
gl_ctx.useProgram(program);

// Setup depth testing
gl_ctx.enable(gl_ctx.DEPTH_TEST);
gl_ctx.depthFunc(gl_ctx.LEQUAL);




let vert_counter = 0;
let vert_array = [];
let indices_array = [];

box_faces.forEach(face_obj => {
  console.log(face_obj.color)
  for(let i = 0; i < 4; i++) 
    vert_array.push(...box_verts[face_obj.verts[i]], 1, ...face_obj.color);

    indices_array.push(vert_counter, vert_counter+1, vert_counter+2);
    indices_array.push(vert_counter+2, vert_counter+3, vert_counter);

  vert_counter += 4;
});


// Fill Array and Index Buffer

const array_buffer = gl_ctx.createBuffer();
const index_buffer = gl_ctx.createBuffer();

// Set Attributes

let attr_locs = {
  vertPosition: gl_ctx.getAttribLocation(program, 'vertPosition'),
  vertColor: gl_ctx.getAttribLocation(program, 'vertColor')
}

gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, array_buffer);

gl_ctx.bufferData(gl_ctx.ARRAY_BUFFER, new Float32Array(vert_array),  gl_ctx.STATIC_DRAW);

// Position
gl_ctx.vertexAttribPointer(attr_locs.vertPosition, 4, gl_ctx.FLOAT, false, 7 *  Float32Array.BYTES_PER_ELEMENT, 0);
gl_ctx.enableVertexAttribArray(attr_locs.vertPosition);

// Color
gl_ctx.vertexAttribPointer(attr_locs.vertColor, 3, gl_ctx.FLOAT, false, 7 *  Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
gl_ctx.enableVertexAttribArray(attr_locs.vertColor);

gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, null);

// Set Attributes Index Buffer

gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, index_buffer);
gl_ctx.bufferData(gl_ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_array),  gl_ctx.STATIC_DRAW);
gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, null);


// Set Uniforms

const object_to_world = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  -5, -3, 0, 1
]

const world_to_cam = [
  -0.816, 0, -0.408, 0,
  0.166464, -0.83232, -0.332928, 0,
  0.408, 0.408, -0.816, 0,
  -2, -2, 4, 1
]

const cam_to_view = [
  1/3, 0, 0, 0,
  0, -1/3, 0, 0,
  0, 0, 1/1000, 0,
  0, 0, 0, 1
]

let uf_locs = {
  object_to_world: gl_ctx.getUniformLocation(program, 'object_to_world'),
  world_to_cam: gl_ctx.getUniformLocation(program, 'world_to_cam'),
  cam_to_view: gl_ctx.getUniformLocation(program, 'cam_to_view')
}

gl_ctx.uniformMatrix4fv(uf_locs.object_to_world, false, object_to_world);
gl_ctx.uniformMatrix4fv(uf_locs.world_to_cam, false, world_to_cam);
gl_ctx.uniformMatrix4fv(uf_locs.cam_to_view, false, cam_to_view);



// Draw
const smallest_canvas_side = Math.min(canvas.width, canvas.height);
gl_ctx.viewport(0, 0, smallest_canvas_side, smallest_canvas_side);

gl_ctx.clearColor(1.0, 1.0, 1.0, 1.0);
gl_ctx.clear(gl_ctx.COLOR_BUFFER_BIT | gl_ctx.DEPTH_BUFFER_BIT);


gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, array_buffer);
gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, index_buffer);

gl_ctx.drawElements(gl_ctx.TRIANGLES, indices_array.length, gl_ctx.UNSIGNED_SHORT, 0);

gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, null);
gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, null);

