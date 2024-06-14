General Documentation

Usage

To visualize a pallet, create a PalletVisualizer object by supplying it with an instance of Pallet (the pallet to visualize), an instance of Renderer (the renderer to use) and optional settings (mostly used to initialize the camera).
Afterwards, calling .drawPallet() will visualize the Pallet as it currently appears when viewed by the internally stored camera.

For a simple interface, you can provide the function generate_pallet_visualizer() with a JSON description of the pallet (see demo.js and JSON_FORMAT_DOC) and a HTML canvas object to render on. This will create a corresponding PalletVisualizer object. A version of the function that accepts german parameter names in the JSON is also supplied (generate_pallet_visualizer_german()).

To enable interactivity, use the function attachEventListners() to attach EventListners to your canvas used to modify the state of the given PalletVisualizer object.

For example JSON pallet descriptions and usage of the above mentioned functions, you can view demo.js.


File Structure

The files contained within the repo are

math_helper.js: vectors/matrices
webgl_helper.js: webgl helper class
representations.js: Modelling of the pallet
camera.js: Camera providing necessary matrices for rendering
renderer.js: Shaders/Renderer used for visualization
visualization.js: Full pallet visualization
demo.js: Examples for usage


The dependencies between the files and classes are visualized in the images below:
