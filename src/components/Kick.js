import * as Tone from "tone";
import Slider from "./Slider";
import { useState, useEffect } from "react";
import { Box, Button, Tip } from "grommet";

const Kick = () => {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pitch, setPitch] = useState(15); // state for pitch
  const [length, setLength] = useState(1); // state for pitch
  const [decay, setDecay] = useState(0.2); // state for pitch
  const synth = new Tone.MembraneSynth().toDestination();
  // setup Tone Membrane Drum Synthesis Synth with user audio output .toDestination()

  // Trigger Synth
  function playSynth() {
    Tone.start();
    console.log("kick triggered");
    synth.triggerAttackRelease(pitch, length);
    synth.pitchDecay = decay;
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the pressed key is the 'k' key (key code 13)
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


    // event listener for a keydown keypress that triggers function inside useEffect
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Detach the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isKeyPressed, playSynth]); // Add pitch to the dependency array if it's used inside the useEffect

  return (
    <>
      <Box>
        <Tip
          dropProps={{ align: { left: "right" } }}
          content={"Trigger with K"}
          plain
        >
          <Button primary label="Kick" onClick={playSynth} />
        </Tip>
      </Box>
      {/* slider for pitch */}
      <Slider
        parameter={pitch}
        setParameter={setPitch}
        minValue={2}
        maxValue={200}
        stepValue={1}
        controlName="Pitch"
      />
      {/* slider for decay */}
      <Slider
        parameter={decay}
        setParameter={setDecay}
        minValue={0}
        maxValue={0.5}
        stepValue={0.1}
        controlName="Decay"
      />
      {/* slider for length */}
      <Slider
        parameter={length}
        setParameter={setLength}
        minValue={0}
        maxValue={1}
        stepValue={0.01}
        controlName="Length"
      />
    </>
  );
};

export default Kick;
