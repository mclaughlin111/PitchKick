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

const gainToDb = (gain) => (gain <= 0 ? -Infinity : Tone.gainToDb(gain));

const HiHat = React.forwardRef((props, ref) => {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pitch, setPitch] = useState(6500);
  const [decay, setDecay] = useState(0.08);
  const [metallicness, setMetallicness] = useState(0.55);
  const [level, setLevel] = useState(0.75);

  const noiseRef = useRef(null);
  const filterRef = useRef(null);
  const metalRef = useRef(null);

  const prepareSynth = useCallback(() => {
    if (noiseRef.current && filterRef.current && metalRef.current) {
      return true;
    }

    if (typeof AudioBuffer === "undefined") {
      return false;
    }

    filterRef.current = new Tone.Filter({
      frequency: pitch,
      type: "highpass",
      Q: 1,
    }).toDestination();

    noiseRef.current = new Tone.NoiseSynth({
      noise: {
        type: "white",
      },
      envelope: {
        attack: 0.001,
        decay,
        sustain: 0,
        release: 0.01,
      },
    }).connect(filterRef.current);

    metalRef.current = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay,
        release: 0.01,
      },
      harmonicity: 4,
      modulationIndex: 24,
      resonance: pitch,
      octaves: 1.2,
    }).toDestination();

    return true;
  }, [decay, pitch]);

  useEffect(() => {
    return () => {
      noiseRef.current?.dispose();
      filterRef.current?.dispose();
      metalRef.current?.dispose();
      noiseRef.current = null;
      filterRef.current = null;
      metalRef.current = null;
    };
  }, []);

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

  const playSynth = useCallback(
    (time) => {
      if (Tone.context.state !== "running" || !prepareSynth()) {
        return;
      }

      const metalAmount = Math.min(Math.max(metallicness, 0), 1);
      const levelAmount = Math.min(Math.max(level, 0), 1);
      const duration = Math.max(0.01, decay);

      filterRef.current.frequency.value = pitch;
      noiseRef.current.envelope.decay = duration;
      noiseRef.current.volume.value = gainToDb(
        levelAmount * (0.75 - metalAmount * 0.35),
      );

      metalRef.current.envelope.decay = duration * 0.85;
      metalRef.current.harmonicity = 2 + metalAmount * 7;
      metalRef.current.modulationIndex = 12 + metalAmount * 70;
      metalRef.current.resonance = 1800 + metalAmount * 4800;
      metalRef.current.octaves = 0.8 + metalAmount * 2.6;
      metalRef.current.volume.value = gainToDb(
        levelAmount * (0.08 + metalAmount * 0.7),
      );

      noiseRef.current.triggerAttackRelease(duration, time);
      metalRef.current.triggerAttackRelease(pitch, duration, time, metalAmount);
    },
    [decay, metallicness, level, pitch, prepareSynth],
  );

  const triggerFromUI = useCallback(async () => {
    if (!prepareSynth()) {
      return;
    }

    const canPlay = await resumeAudio();
    if (!canPlay) {
      return;
    }
    playSynth();
  }, [prepareSynth, resumeAudio, playSynth]);

  useImperativeHandle(ref, () => ({
    playSynth,
    prepareSynth,
  }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "KeyD" && !isKeyPressed) {
        setIsKeyPressed(true);
        triggerFromUI();
      }
    };
    const handleKeyUp = (event) => {
      if (event.code === "KeyD") {
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
    <Box
      align="center"
      className="instrument-panel"
      pad="small"
      responsive={false}
    >
      <Tip
        dropProps={{ align: { left: "right" } }}
        content={"Trigger with D"}
        plain
        pad="small"
      >
        <Button
          className="instrument-trigger"
          label="Hi-hat"
          onClick={triggerFromUI}
          primary
          size="small"
        />
      </Tip>
      <Slider
        parameter={pitch}
        setParameter={setPitch}
        minValue={1000}
        maxValue={9000}
        stepValue={100}
        controlName="Pitch"
      />
      <Slider
        parameter={decay}
        setParameter={setDecay}
        minValue={0.01}
        maxValue={0.3}
        stepValue={0.01}
        controlName="Decay"
      />
      <Slider
        parameter={metallicness}
        setParameter={setMetallicness}
        minValue={0}
        maxValue={1}
        stepValue={0.01}
        controlName="Metallic"
      />
      <Slider
        compact
        parameter={level}
        setParameter={setLevel}
        minValue={0}
        maxValue={1}
        stepValue={0.01}
        controlName="Level"
      />
    </Box>
  );
});

export default React.memo(HiHat);
