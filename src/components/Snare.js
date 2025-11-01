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

const Snare = React.forwardRef((props, ref) => {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pitch, setPitch] = useState(100);
  const [decay, setDecay] = useState(0.1);
  const [noiseLevel, setNoiseLevel] = useState(0.5);

  // Create both synths using useRef
  const membraneRef = useRef(
    new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
      },
    }).toDestination()
  );

  const noiseRef = useRef(
    new Tone.NoiseSynth({
      noise: {
        type: "white",
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0,
      },
    }).toDestination()
  );

  const playSynth = useCallback(
    (time) => {
      Tone.start();

      // Set the noise synth volume
      noiseRef.current.volume.value = Tone.gainToDb(noiseLevel);

      // Set membrane synth decay
      membraneRef.current.envelope.decay = decay;
      noiseRef.current.envelope.decay = decay * 0.5;

      // Trigger both synths
      membraneRef.current.triggerAttackRelease(pitch, "8n", time);
      noiseRef.current.triggerAttackRelease("8n", time);
    },
    [pitch, decay, noiseLevel]
  );

  useImperativeHandle(ref, () => ({
    playSynth,
  }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "KeyS" && !isKeyPressed) {
        setIsKeyPressed(true);
        playSynth();
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "KeyS") {
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
        content={"Trigger with S"}
        plain
        pad="small"
      >
        <Button
          primary
          label="Snare"
          onClick={() => playSynth()}
          size="small"
        />
      </Tip>
      <Slider
        parameter={pitch}
        setParameter={setPitch}
        minValue={10}
        maxValue={150}
        stepValue={1}
        controlName="Pitch"
      />
      <Slider
        parameter={decay}
        setParameter={setDecay}
        minValue={0.01}
        maxValue={0.5}
        stepValue={0.01}
        controlName="Decay"
      />
      <Slider
        parameter={noiseLevel}
        setParameter={setNoiseLevel}
        minValue={0}
        maxValue={1}
        stepValue={0.01}
        controlName="Noise Level"
      />
    </Box>
  );
});

export default Snare;
