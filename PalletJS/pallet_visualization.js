// HELPERS

function isNum(value) {
  return typeof value === 'number';
}

class Mat {
  constructor(n, m){
    if(n < 1 || m < 1 || !Number.isInteger(n) || !Number.isInteger(m)) {
      throw new Error('Invalid size for a matrix!');
    }

    this.n = n;
    this.m = m;

    this._M = Array(n).fill(0).map(x => Array(m).fill(0))
  }

  plus(other){
    if(other instanceof Mat){
      if(this.n != other.n || this.m != other.m){
        throw new Error('Other does not match required dimension!');
      }
      
      let result = new Mat(this.n, this.m);

      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.m; c++) {
          result._M[r][c] = this._M[r][c] + other._M[r][c];
        }
      }

      return result;

    }
    else if(isNum(other)) {
      let result = new Mat(this.n, this.m);

      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.m; c++) {
          result._M[r][c] = this._M[r][c] + other;
        }
      }

      return result;
    }

    throw new Error('Other is of unknown type!');
  }

  minus(other){
    if(other instanceof Mat){
      if(this.n != other.n || this.m != other.m){
        throw new Error('Other does not match required dimension!');
      }
      
      let result = new Mat(this.n, this.m);

      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.m; c++) {
          result._M[r][c] = this._M[r][c] - other._M[r][c];
        }
      }

      return result;

    }
    else if(isNum(other)) {
      let result = new Mat(this.n, this.m);

      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.m; c++) {
          result._M[r][c] = this._M[r][c] - other;
        }
      }

      return result;
    }

    throw new Error('Other is of unknown type!');

  }

  times(other){
    if(other instanceof Mat){
      if(this.m != other.n){
        throw new Error('Matrices do not have correct dimensions to be multiplied!');
      }
      
      let result = new Mat(this.n, other.m);

      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < other.m; c++) {
          for (let k = 0; k < this.m; k++) {
            result._M[r][c] += this._M[r][k] * other._M[k][c];
          }
        }
      }

      return result;
    }

    else if(isNum(other)) {
      let result = new Mat(this.n, this.m);

      for (let r = 0; r < this.n; r++) {
        for (let c = 0; c < this.m; c++) {
          result._M[r][c] = this._M[r][c] * other;
        }
      }

      return result;
    }

    throw new Error('Other is of unknown type!');
  }

  max(other) {
    if(!(other instanceof Mat)){
      throw new Error('Other is not a matrix!');
    }
    if(this.n != other.n || other.m != this.m){
      throw new Error('Matrices do not have correct dimensions for maximum!');
    }

    let result = new Mat(this.n, this.m);

    for (let r = 0; r < this.n; r++) {
      for (let c = 0; c < this.m; c++) {
        result._M[r][c] = Math.max(this._M[r][c], other._M[r][c]);
      }
    }

    return result;
  }

  min(other) {
    if(!(other instanceof Mat)){
      throw new Error('Other is not a matrix!');
    }
    if(this.n != other.n || other.m != this.m){
      throw new Error('Matrices do not have correct dimensions for minimum!');
    }

    let result = new Mat(this.n, this.m);

    for (let r = 0; r < this.n; r++) {
      for (let c = 0; c < this.m; c++) {
        result._M[r][c] = Math.min(this._M[r][c], other._M[r][c]);
      }
    }

    return result;
  }

  to_webgl_array() {
    let ret = [];
      for (let c = 0; c < this.m; c++) {
        for (let r = 0; r < this.n; r++) {
          ret.push(this._M[r][c]);
      }
    }
  
    return ret;
  }

  // Stuff specific to vectors

  isVec() {
    return this.m == 1;
  }

  normalize() {
    if(!this.isVec()) {
      throw new Error('Normalization not available for this matrix!');
    }

    let result = new Mat(this.n, 1);
    let length = 0;

    for (let i = 0; i < this.n; i++) {
      length += this._M[i][0]*this._M[i][0]
    }

    length = Math.sqrt(length);

    for (let i = 0; i < this.n; i++) {
      result._M[i][0] = this._M[i][0]/length;
    }

    return result;
  }

  dot(other) {
    if(!this.isVec()) {
      throw new Error('Dot product not available for this matrix!');
    }
    if(!(other instanceof Mat) || !other.isVec()) {
      throw new Error('Other is not a vector, cannot compute dot product!');
    }
    if(this.n != other.n) {
      throw new Error('Dimensions do not match, cannot compute dot product!');
    }

    let result = 0;

    for (let i = 0; i < this.n; i++) {
      result += this._M[i][0]*other._M[i][0]
    }
    
    return result
  }

  cross(other) {
    if(!this.isVec()) {
      throw new Error('Cross product not available for this matrix (not a vector)!');
    }
    if(this.n != 3) {
      throw new Error('Cross product not available for this matrix (not 3 dimensional)!');
    }

    if(!(other instanceof Mat) || !other.isVec()) {
      throw new Error('Other is not a vector, cannot compute cross product!');
    }
    if(this.n != other.n) {
      throw new Error('Dimensions do not match, cannot compute cross product!');
    }

    let result = new Mat(3, 1);

    for (let i = 0; i < 3; i++) {
      result._M[i][0] = this._M[(i+1)%3]*other._M[(i+2)%3] - this._M[(i+2)%3]*other._M[(i+1)%3];
    }

    return result;
  }

  x(){
    if(!this.isVec()) {
      throw new Error('Normalization not available for this matrix!');
    }

    return this._M[0][0];
  }

  y(){
    if(!this.isVec()) {
      throw new Error('Normalization not available for this matrix!');
    }

    if(this.n < 2) {
      throw new Error('Vector does not contain this member!');
    }

    return this._M[1][0];
  }

  z(){
    if(!this.isVec()) {
      throw new Error('Normalization not available for this matrix!');
    }

    if(this.n < 3) {
      throw new Error('Vector does not contain this member!');
    }

    return this._M[2][0];
  }

  w(){
    if(!this.isVec()) {
      throw new Error('Normalization not available for this matrix!');
    }

    if(this.n < 4) {
      throw new Error('Vector does not contain this member!');
    }

    return this._M[3][0];
  }

  get_array() {
    if(this.isVec()) {
      let ret = [];
      for (let i = 0; i < this.n; i++) {
        ret.push(this._M[i][0]);
      }
      return ret;
    }

    return this._M;
  }
}

function identity_mat(n) {
  let I = new Mat(n, n)
  for (let i = 0; i < n; i++) I._M[i][i] = 1;

  return I
}

function vec2(x, y) {
  let v = new Mat(2, 1);
  v._M[0][0] = x;
  v._M[1][0] = y;

  return v;
}

function vec3(x, y, z) {
  let v = new Mat(3, 1);
  v._M[0][0] = x;
  v._M[1][0] = y;
  v._M[2][0] = z;

  return v;
}

function vec3_from_vec4(vec4_to_reduce) {
  // TODO: Check for correct type
  let v = new Mat(3, 1);
  v._M[0][0] = vec4_to_reduce.x();
  v._M[1][0] = vec4_to_reduce.y();
  v._M[2][0] = vec4_to_reduce.z();

  return v;
}

function vec4(x, y, z, w) {
  let v = new Mat(4, 1);
  v._M[0][0] = x;
  v._M[1][0] = y;
  v._M[2][0] = z;
  v._M[3][0] = w;

  return v;
}



class Plane {
  constructor(center, normal){
    this.center = center;
    this.normal = normal.normalize();
  }

  in_front(p){
    let x = p.minus(this.center);
    return x.dot(this.normal);
  }
}

// Geometric Primitives
class Ray {
  constructor(start_vec, dir_vec) {
    this.origin = start_vec;
    this.direction = dir_vec;
  }

  intersect_plane(plane) {
    const denom = plane.normal.dot(this.direction);
    if (Math.abs(denom) > 1e-9){
      const t = (plane.center.minus(this.origin)).dot(plane.normal) / denom;
      if (t >= 0) return t;
    }

    return -1;
  }
}



// MAIN

class GBox {
  constructor(length, width, height, transform, colorFront, colorSide, colorTop) {
    /*
    * length, width, height \in R_{+} : Determines size
    * color in \in R^3: Determines color to draw box with
    * transform \in SE3 : Determines transformation from object space to world space
    */
    this.length = length;
    this.width = width;
    this.height = height;

    this.colorFront = colorFront;
    this.colorSide = colorSide;
    this.colorTop = colorTop;

    this.transform = transform; 
  }

  get_faces(WTC=identity_mat(4)){
    // Retrieve world space coordinates of the eight corners and apply additional (world-to-cam) transform
    let OTC = WTC.times(this.transform);

    let c0 = OTC.times(vec4(this.length, this.height, this.width, 1));
    let c1 = OTC.times(vec4(0, this.height, this.width, 1));
    let c2 = OTC.times(vec4(0, this.height,0, 1));
    let c3 = OTC.times(vec4(this.length, this.height, 0, 1));

    let c4 = OTC.times(vec4(this.length, 0, this.width, 1));
    let c5 = OTC.times(vec4(0, 0, this.width, 1));
    let c6 = OTC.times(vec4(0, 0, 0, 1));
    let c7 = OTC.times(vec4(this.length, 0, 0, 1));


    let corners = [c0, c1, c2, c3, c4, c5, c6, c7];
    let faces = [
      [0, 1, 2, 3], // Top
      [4, 5, 6, 7], // Bot
      [0, 3, 7, 4], // Front
      [1, 2, 6, 5], // Back
      [0, 1, 5, 4], // Right
      [3, 2, 6, 7] // Left
    ]
    let normals = [
      OTC.times(vec4(0, 1, 0, 0)),
      OTC.times(vec4(0, -1, 0, 0)),
      OTC.times(vec4(1, 0, 0, 0)),
      OTC.times(vec4(-1, 0, 0, 0)),
      OTC.times(vec4(0, 0, 1, 0)),
      OTC.times(vec4(0, 0, -1, 0)),
    ]
    let colors = [
      this.colorTop,
      this.colorTop,
      this.colorFront,
      this.colorFront,
      this.colorSide,
      this.colorSide,
    ]

    return [corners, faces, normals, colors];
  }

  translate(t) {
    let T = identity_mat(4);

    for (let i = 0; i < 3; i++) {
      T._M[i][3] = t._M[i][0];
    }
    
    this.transform = this.transform.times(T);
  }

}

class Camera {
  constructor(pos, left, right, bot, top, near, far) {
    this.pos = pos;

    this.lookDir = vec3(0, 0, 1);
    this.up = vec3(0, 1, 0);
    this.side = this.lookDir.cross(this.up);
    this.up = this.side.cross(this.lookDir);

    // Defines a viewbox
    this.left = left;
    this.right = right;
    this.bot = bot;
    this.top = top;
    this.near = near;
    this.far = far;

    // Additional scale in x-y direction (for large views)
    this.scale = 1.;
  }

  moveTo(pos) {
    this.pos = pos;
  }

  lookAt(point, up = vec3(0, 1, 0)) {
    this.up = up;

    this.lookDir = (point.minus(this.pos)).normalize();
    this.side = this.lookDir.cross(this.up).normalize();;
    this.up = this.side.cross(this.lookDir).normalize();;
  }

  getWTCMat() {
    let R = identity_mat(4);
    

    for (let i = 0; i < 3; i++) {
      R._M[0][i] = this.side._M[i][0];
    }
    for (let i = 0; i < 3; i++) {
      R._M[1][i] = this.up._M[i][0];
    }
    for (let i = 0; i < 3; i++) {
      R._M[2][i] = this.lookDir._M[i][0];
    }

    let T = identity_mat(4); 

    for (let i = 0; i < 3; i++) {
      T._M[i][3] = -this.pos._M[i][0];
    }



    return R.times(T);
  }

  getOrthoMat(){
    let orthoMath = identity_mat(4);

    orthoMath._M[0][0] = 2/(this.right - this.left) * this.scale;
    orthoMath._M[1][1] = -2/(this.top - this.bot) * this.scale;
    orthoMath._M[2][2] = 2/(this.far - this.near); // depth

    orthoMath._M[0][3] = (this.left + this.right) / (this.left - this.right);
    orthoMath._M[1][3] = (this.bot + this.top) / (this.bot - this.top);
    orthoMath._M[2][3] = (this.near + this.far) / (this.near - this.far);

    return orthoMath;
  }
}

class Renderer {
  constructor(canvas, render_settings = {}) {
    // TODO: Render Settings
    this.settings = render_settings;
    this.fill_default_settings();

    this.canvas = canvas;
    this.gl = null;
    this.canvasCTX = null;

    // Attempt to init webgl
    this.init_webgl(canvas);

    if(this.canvasCTX === null) {
      // TODO: Throw error
    }

  }


  fill_default_settings(){
    if(!this.settings.hasOwnProperty('light_dir')) this.settings.light_dir = vec3(-1, -1, 1); 
    if(!this.settings.hasOwnProperty('line_color')) this.settings.line_color = vec3(0, 0, 0);
  }

  // Initializes webgl
  init_webgl(canvas) {
    if(this.gl === null){
      console.log(canvas);
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

    // TODO: Throw error
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


class OrbitControl {
  constructor(pivot_point, azimuth_initial, polar_initial, distance_inital, camera) {
    this.pivot_point = pivot_point;
    this.azimuth = azimuth_initial; // Horizontal angle 0 - 2PI
    this.polar = polar_initial; // Vertical angle  0 - PI
    this.distance = distance_inital; // Distance to object (only important for )
    this.base_scale = 1.; // Additional base scaling in x-y direction, calculate according to pallet height

    this.max_scale_multipler = 2.;
    this.min_scale_multipler = 0.1;
    this.current_scale_multipler = 1.;

    this.camera = camera;
  }

  calculate_base_scale(pallet_height) {
    const ref_value = Math.max(pallet_height, 1200);
    this.base_scale = 1200/ref_value;
    console.log(this.base_scale);
  }

  orient_camera(){
    let eps = 1e-4
    let cam_pos = vec3(Math.sin(this.polar)*Math.cos(this.azimuth), Math.cos(this.polar), Math.sin(this.polar)*Math.sin(this.azimuth)).normalize().times(this.distance);
    let cam_up = vec3(0, -1, 0);

    if(this.polar < eps || this.polar > Math.PI - eps){
      cam_up = (vec3(Math.cos(this.azimuth), 0, Math.sin(this.azimuth)).times(this.distance)).normalize();
    }

    this.camera.moveTo(cam_pos.plus(this.pivot_point));
    this.camera.lookAt(this.pivot_point, cam_up);
    this.camera.scale = this.base_scale*this.current_scale_multipler;
  }

  move_vertical(delta) {
    this.polar += delta
    if(this.polar < 0) this.polar = 0;
    if(this.polar > Math.PI) this.polar = Math.PI;
    this.orient_camera()
  }

  move_horizontal(delta) {
    this.azimuth = (this.azimuth+delta) % (2*Math.PI)
    this.orient_camera()
  }

  change_scale(delta) {
    this.current_scale_multipler += delta;
    if(this.current_scale_multipler < this.min_scale_multipler) 
      this.current_scale_multipler = this.min_scale_multipler;
    if(this.current_scale_multipler > this.max_scale_multipler) 
      this.current_scale_multipler = this.max_scale_multipler;
    this.orient_camera()
  }

}


class PalletLayer {
  constructor(layer_id, coor_list, coor_ids) {
    this.layer_id = layer_id;
    this.coor_ids = coor_ids;
    this.coor_list = [];

    this.bb_min = vec2(1000000, 1000000);
    this.bb_max = vec2(-1000000, -1000000);
    this.height = -1;

   

    for (let i = 0; i < coor_list.length; i++) {
      
      if(this.height != -1 && this.height != coor_list[i][4]){
        // TODO: Throw error
      }

      this.height = coor_list[i][4];

      let pos = vec2(coor_list[i][0], coor_list[i][1]);
      let size = vec2(coor_list[i][2], coor_list[i][3]);  // w, d
      this.coor_list.push([pos, size]);

      this.bb_min = this.bb_min.min(pos);
      this.bb_min = this.bb_min.min(pos.plus(size));

      this.bb_max = this.bb_max.max(pos);
      this.bb_max = this.bb_max.max(pos.plus(size));
    }

    this.bb_size = this.bb_max.minus(this.bb_min);

    // No geometry (this class only represents a plan for layer)
  }

}

class Pallet {
  constructor(stack, pallet_base=[], stack_meta={}, pallet_settings={}) {
    // Stack info
    this.stack_height = 0;
    this.stack = stack; 
    this.stack_meta = stack_meta;

    // Base info
    this.base_height = 0;
    this.base = pallet_base;

    // Settings
    this.settings = pallet_settings;
    this.fill_default_settings();
    
    // Geometry of the full pallet
    this.total_height = 0;
    this.boxes = [];

    this.calculate_geometry();
  }

  fill_default_settings(){ 
    // General settings
    if(!this.settings.hasOwnProperty('color_box_front')) this.settings.color_box_front = vec3(1, 0, 0);
    if(!this.settings.hasOwnProperty('color_box_side')) this.settings.color_box_side = vec3(0, 1, 0);
    if(!this.settings.hasOwnProperty('color_box_top')) this.settings.color_box_top = vec3(0, 0, 1);

    if(!this.settings.hasOwnProperty('color_base')) this.settings.color_base = vec3(213, 176, 124).times(1./255.);
    
    if(!this.settings.hasOwnProperty('draw_base')) this.settings.draw_base = true;
    if(!this.settings.hasOwnProperty('ignored_layers')) this.settings.ignored_layers = [];

    // Settings for each layer
    for (let i = 0; i < this.stack.length; i++) {
      let layer_id = this.stack[i].layer_id;
      if(!this.stack_meta.hasOwnProperty(layer_id)) this.stack_meta[layer_id] = {};
    }

    for (const layer_id in this.stack_meta) {
      if(!this.stack_meta[layer_id].hasOwnProperty('mirror_x')) this.stack_meta[layer_id].mirror_x = false;
      if(!this.stack_meta[layer_id].hasOwnProperty('mirror_y')) this.stack_meta[layer_id].mirror_y = false;
    }

    console.log(this.stack_meta);
  
  }

  _get_stack_height(stack) {
    let height = 0;
    
    for (const layer_idx in stack) {
      const layer = stack[layer_idx];
      if (this.settings.ignored_layers.includes(layer.layer_id)) continue;

      height += stack[layer_idx].height;
    }

    return height;
  }

  _get_base_geometry() {
    let base_geometry = [];
    let running_height = 0;
    for (const layer_idx in this.base) {
      const layer = this.base[layer_idx];

      for (const coor_idx in layer.coor_list) {
        const coor = layer.coor_list[coor_idx];
        let box_pos = coor[0];
        let box_size = coor[1];

        let box = new GBox(box_size.x(), box_size.y(), layer.height, identity_mat(4),  
                         this.settings.color_base, this.settings.color_base, this.settings.color_base);

        box.translate(vec3(box_pos.x(), running_height, box_pos.y())); // Move relative to first box
        box.translate(vec3(-layer.bb_size.x()/2, -this.total_height/2, -layer.bb_size.y()/2,)) // Make 0, 0, 0 center of pallet

        base_geometry.push(box);
      }

      running_height += layer.height;
    }

    return base_geometry;
  }

  _get_stack_geometry() {
    let stack_geometry = [];
    let running_height = this.base_height;

    for (const layer_idx in this.stack) {
      const layer = this.stack[layer_idx];
      const layer_meta = this.stack_meta[layer.layer_id];

      if (this.settings.ignored_layers.includes(layer.layer_id)) continue;

      for (const coor_idx in layer.coor_list) {
        const coor = layer.coor_list[coor_idx];
        let box_pos = coor[0];
        let box_size = coor[1];


        // TODO: Check and include mirroring

        const box_size_x = box_size.x();
        const box_size_y = box_size.y();

        const box_pos_x = layer_meta.mirror_x ? layer.bb_size.x() - box_pos.x() - box_size_x : box_pos.x();
        const box_pos_y = layer_meta.mirror_y ? layer.bb_size.y() - box_pos.y() - box_size_y : box_pos.y();

        let box = new GBox(box_size_x, box_size_y, layer.height, identity_mat(4),  
                           this.settings.color_box_front, this.settings.color_box_side, this.settings.color_box_top);

        box.translate(vec3(box_pos_x, running_height, box_pos_y)); // Move relative to first box
        box.translate(vec3(-layer.bb_size.x()/2, -this.total_height/2, -layer.bb_size.y()/2,)) // Make 0, 0, 0 center of pallet

        stack_geometry.push(box);
      }

      running_height += layer.height;
    }

    return stack_geometry;
  }

  
  calculate_geometry(){
    this.base_height = this.settings.draw_base ? this._get_stack_height(this.base) : 0;
    this.stack_height = this._get_stack_height(this.stack);

    this.total_height = this.base_height+this.stack_height;

    const base_geometry = this.settings.draw_base ? this._get_base_geometry() : [];
    const stack_geometry = this._get_stack_geometry();

    this.boxes = base_geometry.concat(stack_geometry);
  }
}


class PalletVisualizer {
  constructor(pallet, renderer, settings = {}) {
    // TODO: Settings
    // Data Storage
    this.pallet = pallet;
    // Rendering 
    this.renderer = renderer;

    this.settings = settings;
    this.fill_default_settings();

    this.camera = new Camera(
      this.settings.cam_init_pos,
      this.settings.cam_left,
      this.settings.cam_right,
      this.settings.cam_bot,
      this.settings.cam_top,
      this.settings.cam_near,
      this.settings.cam_far);

    this.orbitControls = new OrbitControl(
      this.settings.orbit_pivot, 
      this.settings.orbit_init_azimuth, 
      this.settings.orbit_init_polar, 
      this.settings.orbit_init_distance, 
      this.camera);

    this.orbitControls.calculate_base_scale(pallet.total_height);
    this.orbitControls.orient_camera();
  }

  fill_default_settings(){ 
    // Camera settings
    if(!this.settings.hasOwnProperty('cam_init_pos')) this.settings.cam_init_pos = vec3(0, 0, 0);
    if(!this.settings.hasOwnProperty('cam_left')) this.settings.cam_left = -1000;
    if(!this.settings.hasOwnProperty('cam_right')) this.settings.cam_right = 1000;
    if(!this.settings.hasOwnProperty('cam_bot')) this.settings.cam_bot = -1000;
    if(!this.settings.hasOwnProperty('cam_top')) this.settings.cam_top = 1000;
    if(!this.settings.hasOwnProperty('cam_near')) this.settings.cam_near = -5000;
    if(!this.settings.hasOwnProperty('cam_far')) this.settings.cam_far = 5000;


    // Orbit Control Settings
    if(!this.settings.hasOwnProperty('orbit_pivot')) this.settings.orbit_pivot = vec3(0, 0, 0);
    if(!this.settings.hasOwnProperty('orbit_init_azimuth')) this.settings.orbit_init_azimuth = Math.PI/4;
    if(!this.settings.hasOwnProperty('orbit_init_polar')) this.settings.orbit_init_polar = Math.PI/4;
    if(!this.settings.hasOwnProperty('orbit_init_distance')) this.settings.orbit_init_distance = 1500;
 
  }


  drawPallet() {
    this.renderer.render(this.pallet.boxes, this.camera);
  }

}



canvas = document.getElementById('canvasMain');

var dragging = false;
var last_mouse_pos = null;


canvas.width = window.innerWidth-20;
canvas.height = window.innerHeight-20;




function generate_pallet_visualizer(pallet_json, canvas) {
  let stack = []
  let stack_meta = []
  let ignore_stacks = []
  console.log(pallet_json);

  pallet_json["lagen"].forEach(layer_desc => {
      

      const coor_ids = [];
      const coors = [];

      layer_desc["koords"].forEach(coor_desc => {
        coor_ids.push(coor_desc["lfg"]);
        coors.push([coor_desc["x"], coor_desc["y"], coor_desc["breite_x"], coor_desc["breite_y"], coor_desc["hoehe"]]);
      });


      const layer = new PalletLayer(layer_desc["id"], coors, coor_ids);
      const layer_meta = {
        mirror_x: layer_desc["spiegel_x"], 
        mirror_y: layer_desc["spiegel_y"] 
      }

      if(pallet_json["lage"] != "" && pallet_json["lage"] != layer_desc["id"]) ignore_stacks.push(layer_desc["id"])
      

      stack.push(layer);
      stack_meta[layer_desc["id"]] = layer_meta;
  });
  
  function convert_hexcol_to_vec(hexcol) {
    // #RRGGBB => 
    const RR = parseInt(hexcol.substring(1, 3), 16)/255;
    const GG = parseInt(hexcol.substring(3, 5), 16)/255;
    const BB = parseInt(hexcol.substring(5, 7), 16)/255;

    return vec3(RR, GG, BB);
  }


  const box_color_front = convert_hexcol_to_vec(pallet_json.farbe_vorne);
  const box_color_side = convert_hexcol_to_vec(pallet_json.farbe_seite);
  const box_color_top = convert_hexcol_to_vec(pallet_json.farbe_oben);


  let BASE_LOW = new PalletLayer("BASE_LOW", [[0, 0, 145, 800, 100], 
                                [527.5, 0, 145, 800, 100],  
                                [1055.0, 0, 145, 800, 100]]);
  let BASE_TOP = new PalletLayer("BASE_TOP", [[0, 0, 1200, 145, 44], 
                                  [0, 187.5, 1200, 100, 44],
                                  [0, 327.5, 1200, 145, 44],  
                                  [0, 512.5, 1200, 100, 44],
                                  [0, 655, 1200, 145, 44],]);
  let pallet_base = [BASE_LOW, BASE_TOP];


  const pallet_settings = {
    'color_box_front': box_color_front,
    'color_box_side': box_color_side,
    'color_box_top': box_color_top,
    'ignored_layers': ignore_stacks
  }


  let orbit_init_azimuth = Math.PI/4;
  let orbit_init_polar = Math.PI/4;

  if(pallet_json["initaleAnsicht"] == 'XY'){
    orbit_init_azimuth = 0;
    orbit_init_polar = 0;
  }

  if(pallet_json["initaleAnsicht"] == 'YZ'){
    orbit_init_azimuth = 0;
    orbit_init_polar = Math.PI/2;
  }

  if(pallet_json["initaleAnsicht"] == 'XZ'){
    orbit_init_azimuth = Math.PI/2;
    orbit_init_polar = Math.PI/2;
  }

  const visualizer_settings = {
    'orbit_init_azimuth':  orbit_init_azimuth,
    'orbit_init_polar': orbit_init_polar
  }

  const renderer_settings = {
    'line_color': convert_hexcol_to_vec(pallet_json.farbe_rand)
  }

  const pallet = new Pallet(stack, pallet_base, stack_meta, pallet_settings)
  const renderer = new Renderer(canvas, renderer_settings);
  const visualizer = new PalletVisualizer(pallet, renderer, visualizer_settings);

  return visualizer;
}

function attachEventListners(html_canvas, pallet_visualizer) {
  html_canvas.addEventListener("mousedown", (event) => {
    dragging = true;
  });
  
  html_canvas.addEventListener("mouseup", (event) => {
    dragging = false;
    last_mouse_pos = null;
  });
  
  
  html_canvas.addEventListener("mousemove", (event) => {
    if(!dragging) return
  
    if(last_mouse_pos === null) {
      last_mouse_pos = vec2(event.layerX, event.layerY)
      return;
    }
    let new_mouse_pos = vec2(event.layerX, event.layerY);
  
    let delta = new_mouse_pos.minus(last_mouse_pos)
  
    pallet_visualizer.orbitControls.move_vertical(-delta.y()/20)
    pallet_visualizer.orbitControls.move_horizontal(-delta.x()/20)
    pallet_visualizer.drawPallet();
    

    last_mouse_pos = new_mouse_pos
  });
  
  html_canvas.addEventListener("mouseleave", function (event) {
    dragging = false;
    last_mouse_pos = null;
  });


  html_canvas.addEventListener("wheel", function (event) {
    pallet_visualizer.orbitControls.change_scale(-event.deltaY/75)
    pallet_visualizer.drawPallet();
  });
}



/*
BASE_LOW = new PalletLayer("BASE_LOW", [[0, 0, 145, 800, 100], 
                                [527.5, 0, 145, 800, 100],  
                                [1055.0, 0, 145, 800, 100]])
BASE_TOP = new PalletLayer("BASE_TOP", [[0, 0, 1200, 145, 44], 
                                [0, 187.5, 1200, 100, 44],
                                [0, 327.5, 1200, 145, 44],  
                                [0, 512.5, 1200, 100, 44],
                                [0, 655, 1200, 145, 44],])


L0 = new PalletLayer("L0", [[0, 0, 500, 700, 200], [500, 0, 500, 700, 200]])
L1 = new PalletLayer("L1", [[0, 0, 500, 700, 200], [500, 0, 500, 700, 200]])
L2 = new PalletLayer("L2", [[0, 0, 500, 700, 200], [500, 0, 500, 700, 200]])
L3 = new PalletLayer("L3", [[0, 0, 500, 700, 200], [500, 0, 500, 700, 200]])
L4 = new PalletLayer("L4", [[0, 0, 500, 700, 200], [500, 0, 500, 700, 200]])
L5 = new PalletLayer("L5", [[0, 0, 200, 200, 200], [200, 0, 100, 100, 200]])


let pallet_base = [BASE_LOW, BASE_TOP]
P = new Pallet([L0, L1, L2, L3, L4], pallet_base=pallet_base);
renderer = new Renderer(canvas);
visualize = new PalletVisualizer(P, renderer, canvasCTX);
*/


var test_102 = `{
  "farbe_rand": "#000000", 
  "farbe_oben": "#00FF00",
  "farbe_vorne": "#0000FF",
  "farbe_seite": "#FF0000",
  "initaleAnsicht": "XYZ",
  "lage": "",
  "lagen": [  
      {
        "id": "abc",
        "spiegel_x": false,
        "spiegel_y": false,
        "koords": [
          { "lfd": 1, "x": 0,   "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },  
          { "lfd": 2, "x": 400, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },
          { "lfd": 3, "x": 800, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  }
        ] 
      },
      {
        "id": "abc2",
        "spiegel_x": false,
        "spiegel_y": false,
        "koords": [
          { "lfd": 1, "x": 0,   "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },  
          { "lfd": 2, "x": 400, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },
          { "lfd": 3, "x": 800, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  }
        ] 
      },
      {
        "id": "abc3",
        "spiegel_x": false,
        "spiegel_y": false,
        "koords": [
          { "lfd": 1, "x": 0,   "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },  
          { "lfd": 2, "x": 400, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },
          { "lfd": 3, "x": 800, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  }
        ] 
      },
      {
        "id": "abc4",
        "spiegel_x": false,
        "spiegel_y": false,
        "koords": [
          { "lfd": 1, "x": 0,   "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },  
          { "lfd": 2, "x": 400, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },
          { "lfd": 3, "x": 800, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  }
        ] 
      },
      {
        "id": "abc5",
        "spiegel_x": false,
        "spiegel_y": false,
        "koords": [
          { "lfd": 1, "x": 0,   "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },  
          { "lfd": 2, "x": 400, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },
          { "lfd": 3, "x": 800, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  }
        ] 
      }
  ]
}`


var test_104 = `{
  "farbe_rand": "#000000", 
  "farbe_oben": "#00FF00",
  "farbe_vorne": "#0000FF",
  "farbe_seite": "#FF0000",
  "initaleAnsicht": "XYZ",
  "lage": "abc",
  "lagen": [  
      {
        "id": "abc",
        "spiegel_x": true,
        "spiegel_y": false,
        "koords": [
          { "lfd": 1, "x": 0,   "y": 0, "breite_x": 310, "breite_y": 500,  "hoehe": 400  },  
          { "lfd": 2, "x": 345, "y": 0, "breite_x": 310, "breite_y": 500,  "hoehe": 400  },
          { "lfd": 3, "x": 690, "y": 0, "breite_x": 310, "breite_y": 500,  "hoehe": 400  },
          { "lfd": 4, "x": 0, "y": 500, "breite_x": 500, "breite_y": 310,  "hoehe": 400  },
          { "lfd": 5, "x": 500, "y": 500, "breite_x": 500, "breite_y": 310,  "hoehe": 400  }
        ] 
      },
      {
        "id": "abc2",
        "spiegel_x": false,
        "spiegel_y": false,
        "koords": [
          { "lfd": 1, "x": 0,   "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },  
          { "lfd": 2, "x": 400, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  },
          { "lfd": 3, "x": 800, "y": 0, "breite_x": 400, "breite_y": 610,  "hoehe": 400  }
        ] 
      }
  ]
}`

var test_124 = `{
  "farbe_rand": "#000000", 
  "farbe_oben": "#00FF00",
  "farbe_vorne": "#0000FF",
  "farbe_seite": "#FF0000",
  "initaleAnsicht": "XYZ",
  "lage": "abc",
  "lagen": [  
      {
        "id": "abc",
        "spiegel_x": false,
        "spiegel_y": false,
        "koords": [
          { "lfd": 1, "x": 0,   "y": 0, "breite_x": 500, "breite_y": 140,  "hoehe": 400  },  
          { "lfd": 2, "x": 0, "y": 140, "breite_x": 500, "breite_y": 140,  "hoehe": 400  },
          { "lfd": 3, "x": 500, "y": 0, "breite_x": 140, "breite_y": 500,  "hoehe": 400  },
          { "lfd": 4, "x": 640, "y": 0, "breite_x": 140, "breite_y": 500,  "hoehe": 400  },
          { "lfd": 5, "x": 780, "y": 0, "breite_x": 140, "breite_y": 500,  "hoehe": 400  },
          { "lfd": 6, "x": 920, "y": 0, "breite_x": 140, "breite_y": 500,  "hoehe": 400  },
          { "lfd": 7, "x": 1060, "y": 0, "breite_x": 140, "breite_y": 500,  "hoehe": 400  },
          { "lfd": 8, "x": 0, "y": 280, "breite_x": 140, "breite_y": 500,  "hoehe": 400  },
          { "lfd": 9, "x": 140, "y": 500, "breite_x": 500, "breite_y": 140,  "hoehe": 400  },
          { "lfd": 10, "x": 140, "y": 640, "breite_x": 500, "breite_y": 140,  "hoehe": 400  },
          { "lfd": 11, "x": 700, "y": 500, "breite_x": 500, "breite_y": 140,  "hoehe": 400  },
          { "lfd": 12, "x": 700, "y": 640, "breite_x": 500, "breite_y": 140,  "hoehe": 400  }
        ] 
      }
  ]
}`

const json_obj = JSON.parse(test_124);
var visualizer = generate_pallet_visualizer(json_obj, canvas)
attachEventListners(canvas, visualizer)


visualizer.drawPallet();


