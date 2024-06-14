Documentation for the JSON format used to decribe a pallet visualization.
View demo.js for concrete examples.

Format: $PARAMETER_NAME [$GERMAN_PARAMETER_NAME] ($DATATYPE; [$EXPECTED_VALUES]): $DESCRIPTION

PALLET_DESCRIPTION: Describes a full pallet visualization
- farbe_rand (string; color as hexcode): Color of the outline
- farbe_oben (string; color as hexcode): Color of upper/lower side (for stacked packets)
- farbe_vorne (string; color as hexcode): Color of front/back side (for stacked packets)
- farbe_seite (string; color as hexcode): Color of left/right side (for stacked packets)
- initaleAnsicht (string; "XY", "YZ", "XZ", "XYZ"): Initial viewing direction (either from the side or isometric)
- lage (any): Draw only layers with this ID. Leave empty to draw all layers
- lagen (array of LAYER_DESCRIPTION): Description of the layers on the pallet

LAYER_DESCRIPTION: Describes a single layer in the pallet
- id (any): ID of this layer
- spiegel_x (bool): Mirror layer in the x direction (in the 2D coordinate system)
- spiegel_y (bool): Mirror layer in the y direction (in the 2D coordinate system)
- koords (array of PACKET_COORDINATES): Description of the 2D layout of the layer

PACKET_COORDINATES: Describes the 2D dimensions of a packet in a pallet layer. See example image for the coordinate system used.
- lid: ID of this packer
- x: x-coor of the upper left corner (in 2D space, correspondes to long side of the pallet)
- y: y-coor of the upper left corner (in 2D space, correspondes to small side of the pallet)
- breite_x: length of the packet in x direction
- breite_y: length of the packet in y direction
- hoehe: Height of this packet (expected to be the same for all packets in the same layer)
