// Webgl shaders + utils

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

// Create shader program
function build_gl_shader(shadertext, gl_context, gl_shader_type) {
    let shader = gl_context.createShader(gl_shader_type);
    gl_context.shaderSource(shader, shadertext);

    gl_context.compileShader(shader);
    if(!gl_context.getShaderParameter(shader, gl_context.COMPILE_STATUS)){
      console.error("ERROR compiling shader", gl_context.getShaderInfoLog(shader));
    }

    return shader;
}

class GL_PROGRAM {
    constructor(gl_context, shadertext_vertex, shadertext_fragment){
        this.gl_context = gl_context;
        
        // Build shaders
        this.shader_vertex = build_gl_shader(shadertext_vertex, gl_context, gl_context.VERTEX_SHADER);
        this.shader_fragment = build_gl_shader(shadertext_fragment, gl_context, gl_context.FRAGMENT_SHADER);
        
        // Create program
        let program = gl_context.createProgram();
        gl_context.attachShader(program, this.shader_vertex);
        gl_context.attachShader(program, this.shader_fragment);
        gl_context.linkProgram(program);
    
        if(!gl_context.getProgramParameter(program, gl_context.LINK_STATUS)){
            console.error("ERROR linking program", gl_context.getProgramInfoLog(program));
        }
        
        gl_context.validateProgram(program);
        if(!gl_context.getProgramParameter(program, gl_context.VALIDATE_STATUS)){
            console.error("ERROR validating program", gl_context.getProgramInfoLog(program));
        }

        this.program = program;

        // Create buffers
        this.array_buffer = gl_context.createBuffer();
        this.index_buffer = gl_context.createBuffer();
    }

    set_array_buffer(buffer_data, usage){
        this.gl_context.bindBuffer(this.gl_context.ARRAY_BUFFER, this.array_buffer);
        this.gl_context.bufferData(this.gl_context.ARRAY_BUFFER, buffer_data, usage);
        this.gl_context.bindBuffer(this.gl_context.ARRAY_BUFFER, null);
    }

    set_index_buffer(buffer_data, usage){
        this.gl_context.bindBuffer(this.gl_context.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        this.gl_context.bufferData(this.gl_context.ELEMENT_ARRAY_BUFFER, buffer_data, usage);
        this.gl_context.bindBuffer(this.gl_context.ELEMENT_ARRAY_BUFFER, null);
    }

    set_attribute(name, size, type, normalized, stride, offset){
        let location = this.gl_context.getAttribLocation(this.program, name);

        this.gl_context.bindBuffer(this.gl_context.ARRAY_BUFFER, this.array_buffer);

        this.gl_context.vertexAttribPointer(location, size, type, normalized, stride, offset);
        this.gl_context.enableVertexAttribArray(location);

        this.gl_context.bindBuffer(this.gl_context.ARRAY_BUFFER, null);
    }

    set_uniform_mat4fv(name, mat_webgl, transpose=false){
        let location = this.gl_context.getUniformLocation(this.program, name);

        this.gl_context.uniformMatrix4fv(location, transpose, mat_webgl);
    }

    set_uniform_3fv(name, vec_gl){
        let location = this.gl_context.getUniformLocation(this.program, name);
        
        this.gl_context.uniform3fv(location, vec_gl);
    }

    use(){
        this.gl_context.useProgram(this.program);
    }

    draw(primitive_type, count, type, offset){
        this.gl_context.bindBuffer(this.gl_context.ARRAY_BUFFER, this.array_buffer);
        this.gl_context.bindBuffer(this.gl_context.ELEMENT_ARRAY_BUFFER, this.index_buffer);

        this.gl_context.drawElements(primitive_type, count, type, offset);

        this.gl_context.bindBuffer(this.gl_context.ARRAY_BUFFER, null);
        this.gl_context.bindBuffer(this.gl_context.ELEMENT_ARRAY_BUFFER, null);
    }

   
}