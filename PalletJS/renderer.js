// For Rendering the inside of boxes
var shadertext_boxes_inner_vertex =`
precision mediump float;

attribute vec4 vertPosition;
attribute vec3 vertColor;
attribute vec3 vertNormal; // In world space

uniform mat4 u_matrix;

varying vec3 fragColor;
varying vec3 fragNormal; // In world space

void main() {
    fragColor = vertColor;

    mat3 u_matrix_norm = mat3(u_matrix);
    fragNormal = u_matrix_norm * vertNormal;

    vec4 pos = u_matrix * vertPosition;
    if(false) {
        gl_Position = vec4(pos.xy/pos.z * 0.25, pos.z, pos.w);
    }
    else{
        gl_Position = vec4(pos.xy, pos.z, pos.w);
    }
}
`

var shadertext_boxes_inner_fragment =`
precision mediump float;

varying vec3 fragColor;
varying vec3 fragNormal; // In cam space

uniform vec3 lightDir;

void main(){
    gl_FragColor = vec4((0.5 * clamp(dot(-normalize(lightDir), normalize(fragNormal)), 0.0, 1.0) + 0.8) * fragColor, 1.0);
}
`

var shadertext_boxes_outline_vertex =`
precision mediump float;

attribute vec4 vertPosition;
attribute vec3 vertColor;
attribute vec3 vertNormal;

uniform mat4 u_matrix;

varying vec3 fragColor;
varying vec3 fragNormal;

void main() {
    fragColor = vertColor;
    fragNormal = vertNormal;
    vec4 pos = u_matrix * vertPosition;
    if(false) {
        gl_Position = vec4(pos.xy/pos.z * 0.25, pos.z-1e-4, pos.w);
    }
    else{
        gl_Position = vec4(pos.xy, pos.z-1e-4, pos.w);
    }
}
`

var shadertext_boxes_outline_fragment =`
precision mediump float;

varying vec3 fragColor;
varying vec3 fragNormal;

uniform vec3 outlineColor;
uniform vec3 lightDir;

void main(){
    gl_FragColor = vec4(outlineColor, 1.0);
}
`


// Renderer
class Renderer {
    constructor(canvas, render_settings = {}) {
      this.settings = render_settings;
      this.fill_default_settings();
  
      this.canvas = canvas;
      this.gl = null;
  
      // Attempt to init webgl
      this.init_webgl(canvas);
  
      if(this.gl === null) {
        throw new Error('Could not get a webgl context.');
      }
  
    }
  
  
    fill_default_settings(){
      if(!this.settings.hasOwnProperty('light_dir')) this.settings.light_dir = vec3(-1, -1, 1); 
      if(!this.settings.hasOwnProperty('line_color')) this.settings.line_color = vec3(0, 0, 0);
    }
  
    // Initializes webgl
    init_webgl(canvas) {
      if(this.gl === null){
        this.gl = canvas.getContext("webgl");
  
        if(!this.gl){
          console.log("Your browser does not support non-experimental WebGL");
          this.gl = canvas.getContext("experimental-webgl")
        }
        if(!this.gl){
          alert("Your browser does not support WebGL");
        }
      }
  
      this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
      // Seting up the program
  
      this.program_box_inner = new GL_PROGRAM(this.gl, shadertext_boxes_inner_vertex, shadertext_boxes_inner_fragment);
      this.program_box_outline = new GL_PROGRAM(this.gl, shadertext_boxes_outline_vertex, shadertext_boxes_outline_fragment);
  
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL);
    }
  
    // Render set of boxes onto assciated canvas
    render(boxes, camera) {
      if(this.gl !== null) {
        this.render_webgl(boxes, camera);
        return;
      }
  
      throw new Error('No valid method for rendering!');
    }
  
  
    // Render set of boxes onto assciated canvas with webgl (default)
    render_webgl(boxes, camera){
      // Load webgl
      this.gl.viewport(0, 0, Math.min(this.gl.canvas.width, this.gl.canvas.height), Math.min(this.gl.canvas.width, this.gl.canvas.height));
  
      this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  
      let vertCounter = 0;
      let vertices = [];
  
      let indices_inner = [];
      let indices_outline = [];
  
      let ortho_mat = camera.getOrthoMat();
      let wtc_math = camera.getWTCMat();
      let mat = ortho_mat.times(wtc_math);
      let mat_webgl = mat.to_webgl_array();
  
      boxes.forEach(box => {
        let temp = box.get_faces();
        let box_verts = temp[0];
        let box_faces = temp[1];
        let box_normals = temp[2];
        let box_colors = temp[3];
  
        for (let i = 0; i < 6; i++) {
          let face = box_faces[i];    
  
          for (let j = 0; j < 4; j++) {
            vertices.push(box_verts[face[j]].x(), box_verts[face[j]].y(), box_verts[face[j]].z(), 1.0);
            vertices.push(box_colors[i].x(), box_colors[i].y(), box_colors[i].z());
            vertices.push(box_normals[i].x(), box_normals[i].y(), box_normals[i].z());
          }
          
          indices_inner.push(vertCounter, vertCounter+1, vertCounter+2);
          indices_inner.push(vertCounter+2, vertCounter+3, vertCounter);
  
          indices_outline.push(vertCounter, vertCounter+1);
          indices_outline.push(vertCounter+1, vertCounter+2);
          indices_outline.push(vertCounter+2, vertCounter+3);
          indices_outline.push(vertCounter+3, vertCounter);
  
          vertCounter+=4;
        }
  
      });
  
      // Draw inner of boxes
      this.program_box_inner.use();
  
      this.program_box_inner.set_array_buffer(new Float32Array(vertices), this.gl.STATIC_DRAW);
      this.program_box_inner.set_index_buffer(new Uint16Array(indices_inner), this.gl.STATIC_DRAW);
  
      this.program_box_inner.set_attribute("vertPosition", 4, this.gl.FLOAT, false,  10 *  Float32Array.BYTES_PER_ELEMENT, 0);
      this.program_box_inner.set_attribute("vertColor", 3, this.gl.FLOAT, false,  10 *  Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
      this.program_box_inner.set_attribute("vertNormal", 3, this.gl.FLOAT, false,  10 *  Float32Array.BYTES_PER_ELEMENT, 7 * Float32Array.BYTES_PER_ELEMENT);
  
      this.program_box_inner.set_uniform_mat4fv("u_matrix", mat_webgl),
      this.program_box_inner.set_uniform_3fv("lightDir", this.settings.light_dir.to_webgl_array());
  
  
      this.program_box_inner.draw(this.gl.TRIANGLES, indices_inner.length, this.gl.UNSIGNED_SHORT, 0);
  
      // Draw outline of boxes
      this.program_box_outline.use();
  
      this.program_box_outline.set_array_buffer(new Float32Array(vertices), this.gl.STATIC_DRAW);
      this.program_box_outline.set_index_buffer(new Uint16Array(indices_outline), this.gl.STATIC_DRAW);
  
      this.program_box_outline.set_attribute("vertPosition", 4, this.gl.FLOAT, false,  10 *  Float32Array.BYTES_PER_ELEMENT, 0);
      this.program_box_outline.set_attribute("vertColor", 3, this.gl.FLOAT, false,  10 *  Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
      this.program_box_outline.set_attribute("vertNormal", 3, this.gl.FLOAT, false,  10 *  Float32Array.BYTES_PER_ELEMENT, 7 * Float32Array.BYTES_PER_ELEMENT);
  
      this.program_box_outline.set_uniform_mat4fv("u_matrix", mat_webgl),
      this.program_box_outline.set_uniform_3fv("outlineColor", this.settings.line_color.to_webgl_array());
      this.program_box_outline.set_uniform_3fv("lightDir", this.settings.light_dir.to_webgl_array());
  
  
      this.program_box_outline.draw(this.gl.LINES, indices_outline.length, this.gl.UNSIGNED_SHORT, 0);
    }
  
  }
  