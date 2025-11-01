import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import * as Tone from "tone";
import Slider from "./Slider";
import { Box, Button, Tip } from "grommet";

// Use forwardRef to allow the parent to access internal methods.
const Kick = React.forwardRef((props, ref) => {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pitch, setPitch] = useState(20);
  const [length, setLength] = useState(1);
  const [decay, setDecay] = useState(0.2);

  // Create the synth once using useRef so it isn't re-instantiated on every render.
  const synth = useRef(new Tone.MembraneSynth().toDestination());

  const playSynth = useCallback(
    (time) => {
      Tone.start(); // Ensure the AudioContext is resumed.
      console.log("kick triggered");
      // Trigger the synth using the scheduled time from Tone.js if available.
      synth.current.triggerAttackRelease(pitch, length, time);
      // Optionally adjust synth settings:
      synth.current.octaves = 8;
      synth.current.pitchDecay = decay;
    },
    [pitch, length, decay]
  );

  // Expose playSynth to the parent component via the ref.
  useImperativeHandle(ref, () => ({
    playSynth,
  }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "KeyK" && !isKeyPressed) {
        setIsKeyPressed(true);
        playSynth();
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "KeyK") {
        setIsKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isKeyPressed, playSynth]);

  return (
    <Box align="center" pad="medium" responsive>
      <Tip
        dropProps={{ align: { left: "right" } }}
        content={"Trigger with K"}
        plain
        pad="small"
      >
        <Button primary label="Kick" onClick={() => playSynth()} size="small" />
      </Tip>
      <Slider
        parameter={pitch}
        setParameter={setPitch}
        minValue={2}
        maxValue={200}
        stepValue={1}
        controlName="Pitch"
      />
      <Slider
        parameter={decay}
        setParameter={setDecay}
        minValue={0.01}
        maxValue={0.5}
        stepValue={0.05}
        controlName="Decay"
      />
      <Slider
        parameter={length}
        setParameter={setLength}
        minValue={0.5}
        maxValue={1}
        stepValue={0.01}
        controlName="Length"
      />
    </Box>
  );
});

export default Kick;
