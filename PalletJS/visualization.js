// MAIN

// Main class
class PalletVisualizer {
  constructor(pallet, renderer, settings = {}) {
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


// Interface
function generate_pallet_visualizer_german(pallet_json, canvas) {
  let stack = []
  let stack_meta = []
  let ignore_stacks = []

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


// Interface
function generate_pallet_visualizer(pallet_json, canvas) {
  let stack = []
  let stack_meta = []
  let ignore_stacks = []
  console.log(pallet_json);

  pallet_json["layers"].forEach(layer_desc => {
      

      const coor_ids = [];
      const coors = [];

      layer_desc["coors"].forEach(coor_desc => {
        coor_ids.push(coor_desc["coor_id"]);
        coors.push([coor_desc["x"], coor_desc["y"], coor_desc["width_x"], coor_desc["width_y"], coor_desc["height"]]);
      });


      const layer = new PalletLayer(layer_desc["id"], coors, coor_ids);
      const layer_meta = {
        mirror_x: layer_desc["mirror_x"], 
        mirror_y: layer_desc["mirror_y"] 
      }

      if(pallet_json["layer"] != "" && pallet_json["layer"] != layer_desc["id"]) ignore_stacks.push(layer_desc["id"])
      

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


  const box_color_front = convert_hexcol_to_vec(pallet_json.color_front);
  const box_color_side = convert_hexcol_to_vec(pallet_json.color_side);
  const box_color_top = convert_hexcol_to_vec(pallet_json.color_top);


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

  if(pallet_json["initial_view"] == 'XY'){
    orbit_init_azimuth = 0;
    orbit_init_polar = 0;
  }

  if(pallet_json["initial_view"] == 'YZ'){
    orbit_init_azimuth = 0;
    orbit_init_polar = Math.PI/2;
  }

  if(pallet_json["initial_view"] == 'XZ'){
    orbit_init_azimuth = Math.PI/2;
    orbit_init_polar = Math.PI/2;
  }

  const visualizer_settings = {
    'orbit_init_azimuth':  orbit_init_azimuth,
    'orbit_init_polar': orbit_init_polar
  }

  const renderer_settings = {
    'line_color': convert_hexcol_to_vec(pallet_json.color_outline)
  }

  const pallet = new Pallet(stack, pallet_base, stack_meta, pallet_settings)
  const renderer = new Renderer(canvas, renderer_settings);
  const visualizer = new PalletVisualizer(pallet, renderer, visualizer_settings);

  return visualizer;
}

// vars for interactivity
var dragging = false;
var last_mouse_pos = null;

// Associated event listners
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






