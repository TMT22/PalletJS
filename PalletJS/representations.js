// Modelling the geometry of a Box
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
        T._M[i][3] += t._M[i][0];
      }
      
      this.transform = this.transform.times(T);
    }
  
  }
  
  // Modelling a Pallet
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
          throw new Error('All packets in the layer must have the same height!');
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
  