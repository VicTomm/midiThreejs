import Scene from "./Classes/Scene/index";
import types from "./Types/index";

(function () {
  "use strict";
  const scene = new Scene();
  let autoRotation = false;
  let randomColor = false;

  const {
    ADD_PARTICLES,
    EDIT_DISTANCE,
    SET_H,
    ROTATE_CAMERA_X,
    SET_S,
    ROTATE_PARTICLES_X,
    SET_L,
    ROTATE_PARTICLES_Z,
    ROTATE_PARTICLES_Y,
    ROTATE_CAMERA_Y,
    ROTATE_CAMERA_Z,
    AUTOROTATION,
    RANDOM_COLORS,
  } = types;

  function requestMidiAccess() {
    if ("requestMIDIAccess" in navigator) {
      return navigator.requestMIDIAccess().then((midiAccess) => {
        let midiOutput = null;
        const { outputs, inputs } = midiAccess;
        outputs.forEach((output) => {
          midiOutput = output;
        });
        return {
          inputs,
          midiOutput,
        };
      });
    }
  }

  function calculatePercentage(value, x) {
    return (value * 100) / x;
  }

  function handleNote(note, value) {
    switch (note) {
      case ADD_PARTICLES:
        scene.handleParticles(calculatePercentage(value, 70));
        break;
      case EDIT_DISTANCE:
        scene.setDistance(value * 10);
        break;
      case SET_H:
        scene.setH(calculatePercentage(value, 12700));
        break;
      case ROTATE_CAMERA_X:
        scene.onKnobMovementX(value * 1000 * 0.05);
        break;
      case SET_S:
        scene.setS(calculatePercentage(value, 12700));
        break;
      case ROTATE_PARTICLES_X:
        scene.addRotationX(value * 1000);
        break;
      case SET_L:
        scene.setL(calculatePercentage(value, 12700));
        break;
      case ROTATE_PARTICLES_Z:
        scene.addRotationZ(value * 1000);
        break;
      case ROTATE_PARTICLES_Y:
        scene.addRotationY(value * 1000);
        break;
      case ROTATE_CAMERA_Y:
        scene.onKnobMovementY(value * 500 * 0.05);
        break;
      case ROTATE_CAMERA_Z:
        scene.onKnobMovementZ(value * 500 * 0.05);
        break;
      default:
        console.log(note, value);
        break;
    }
  }

  function handleButtons(note) {
    switch (note) {
      case AUTOROTATION:
        autoRotation = !autoRotation;
        scene.activateAutoRotation(autoRotation);
        break;
      case RANDOM_COLORS:
        randomColor = !randomColor;
        scene.activateRandomColors(randomColor);
        break;
      default:
        console.log(note);
        break;
    }
  }

  function handleinputMessage(message, colors, midiOutput) {
    const command = message.data[0];
    const note = message.data[1];
    switch (command) {
      case 144:
        break;
      case 148:
        handleButtons(note);
        break;
      case 176:
        break;
      case 180:
        handleNote(note, message.data[2]);
        break;
      default:
        break;
    }
  }

  async function startMidi() {
    const access = await requestMidiAccess();
    if (access) {
      scene.initialize();
      animate();
      const { inputs, colors, midiOutput } = access;

      inputs.forEach((input) => {
        input.onmidimessage = (message) => {
          handleinputMessage(message, colors, midiOutput);
        };
      });
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    scene.render();
    scene.updateStats();
  }

  function onDocumentReady() {
    startMidi();
  }

  document.addEventListener("DOMContentLoaded", onDocumentReady);
})();
