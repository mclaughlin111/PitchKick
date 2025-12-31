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
  const [pitch, setPitch] = useState(60);
  const [length, setLength] = useState(0.3);
  const [decay, setDecay] = useState(0.23);

  // Create the synth once using useRef so it isn't re-instantiated on every render.
  const synth = useRef(
    new Tone.PolySynth({
      voice: Tone.MembraneSynth,
      maxPolyphony: 8,
    }).toDestination()
  );

  const resumeAudio = useCallback(async () => {
    if (Tone.context.state === "running") {
      return true;
    }
    try {
      await Tone.start();
      return Tone.context.state === "running";
    } catch (error) {
      console.warn("AudioContext start was blocked:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    synth.current.set({
      pitchDecay: 0.05,
      octaves: 1.5,
      envelope: {
        attack: 0.001,
        decay: decay,
        sustain: 0,
        release: 0.01,
      },
    });
  }, [decay]);

  const playSynth = useCallback(
    (time) => {
      if (Tone.context.state !== "running") {
        return;
      }

      const duration = Math.max(length, decay + 0.01);
      synth.current.triggerAttackRelease(pitch, duration, time);
    },
    [pitch, length, decay]
  );

  const triggerFromUI = useCallback(async () => {
    const canPlay = await resumeAudio();
    if (!canPlay) {
      return;
    }
    playSynth();
  }, [resumeAudio, playSynth]);

  // Expose playSynth to the parent component via the ref.
  useImperativeHandle(ref, () => ({
    playSynth,
  }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "KeyA" && !isKeyPressed) {
        setIsKeyPressed(true);
        triggerFromUI();
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "KeyA") {
        setIsKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isKeyPressed, triggerFromUI]);

  return (
    <Box align="center" pad="medium" responsive>
      <Tip
        dropProps={{ align: { left: "right" } }}
        content={"Trigger with A"}
        plain
        pad="small"
      >
        <Button primary label="Kick" onClick={triggerFromUI} size="small" />
      </Tip>
      <Slider
        parameter={pitch}
        setParameter={setPitch}
        minValue={20}
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
        minValue={0.05}
        maxValue={0.6}
        stepValue={0.01}
        controlName="Length"
      />
    </Box>
  );
});

export default React.memo(Kick);
