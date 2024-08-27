import * as Tone from "tone";
import Slider from "./Slider";
import { useState, useEffect, useCallback } from "react";
import { Box, Button, Tip } from "grommet";

const Kick = () => {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pitch, setPitch] = useState(15);
  const [length, setLength] = useState(1);
  const [decay, setDecay] = useState(0.2);
  const synth = new Tone.MembraneSynth().toDestination();

  const playSynth = useCallback(() => {
    Tone.start();
    console.log("kick triggered");
    synth.triggerAttackRelease(pitch, length);
    synth.octaves = 8;
    synth.pitchDecay = decay;
  }, [pitch, length, decay, synth]);

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
    <>
      <Box align="center" pad="medium" responsive>
        <Tip
          dropProps={{ align: { left: "right" } }}
          content={"Trigger with K"}
          plain
          margin={{ left: "large" }}
          pad="small"
        >
          <Button primary label="Kick" onClick={playSynth} />
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
          minValue={0.01}
          maxValue={1}
          stepValue={0.01}
          controlName="Length"
        />
      </Box>
    </>
  );
};

export default Kick;
