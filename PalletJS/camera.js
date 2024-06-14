// Camera + Control
class Camera {
    constructor(pos, left, right, bot, top, near, far) {
      // Extrinsic Parameters
      this.pos = pos;
      this.lookDir = vec3(0, 0, 1);
      this.up = vec3(0, 1, 0);
      this.side = this.lookDir.cross(this.up);
      this.up = this.side.cross(this.lookDir);
  
      // Intrinsic Parameters. Defines a viewbox.
      this.left = left;
      this.right = right;
      this.bot = bot;
      this.top = top;
      this.near = near;
      this.far = far;
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
  