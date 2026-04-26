# Simple Three.JS example application

Upwork Task Number: 35344135

## job_title

Simple Three.JS example application

## job_description

This project is to create a simple Three.JS website (not using React or any other framework). The goal is to make sure that the GLB we created can be color adjusted using Three.JS. The GLB is attached.

The website needs 5 colors (red, blue, green, orange, and yellow) at the bottom with the GLB rendered in the center of the page. Click on a layer of the GLB and then select a color at the bottom to change the layer's color. An example video: https://www.youtube.com/watch?v=njVsuqcM_4k

Clicking and holding the mouse should rotate the render. This does not need to be fancy. It should be kept as simple as possible. The AI file that created the GLB is included in case it is needed.

## criteria

- critical - Delivered solution is a plain HTML/JavaScript website using Three.js only, without React or other frontend frameworks.
- critical - Application loads and renders the provided GLB file centered on the page using Three.js.
- critical - UI displays five color options (red, blue, green, orange, yellow) and allows the user to apply a selected color to a clicked mesh or layer of the GLB model.
- critical - Rendered model can be rotated by clicking and dragging the mouse.
- critical - Application functions without requiring any server-side code and runs as a static website.

## Run

Open `index.html` through any static file server. For local testing:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`.
