# Architecture rules
- Keep Studio camera presets and cutaway calculations in a shared pure module; this makes framing and visibility independently testable.
- Keep workspace view controls out of saved scene data; camera and drawer choices are navigation state, not room content.
- Use actual Studio renders for template thumbnails; previews must reflect the room shells users receive.- Keep room-shape rules (L-shaped cut-out, floor area, placement clamping) in a shared pure module; 3D, drag-drop and exports must agree on the same footprint.
