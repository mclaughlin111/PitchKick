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

// Use forwardRef to allow the parent to access internal methods.
const Kick = React.forwardRef((props, ref) => {
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [pitch, setPitch] = useState(5);
  const [length, setLength] = useState(0.4);
  const [decay, setDecay] = useState(1.4);
  const [punch, setPunch] = useState(0.5);
  const [level, setLevel] = useState(0.8);

  const synth = useRef(null);
  const subSine = useRef(null);
  const subPunch = useRef(null);
  const punchSynth = useRef(null);
  const punchFilter = useRef(null);

  const configureSynth = useCallback(
    (kickSynth) => {
      const decaySeconds = Math.max(0.02, decay);
      const tailSeconds = Math.max(0.03, length);
      const decayIntensity = Math.min(Math.pow(decaySeconds / 1.8, 0.4), 1);
      const punchAmount = Math.min(Math.max(punch, 0), 1);
      const levelAmount = Math.min(Math.max(level, 0), 1);

      kickSynth.set({
        pitchDecay: 0.006 + decayIntensity * 0.54 + punchAmount * 0.05,
        octaves: 5 + decayIntensity * 11.5 + punchAmount * 1.4,
        envelope: {
          attack: 0.001,
          decay: decaySeconds,
          sustain: 0.02 + decayIntensity * 0.075,
          release: tailSeconds,
        },
      });
      kickSynth.volume.value = gainToDb(levelAmount);
    },
    [decay, length, level, punch],
  );

  const prepareSynth = useCallback(() => {
    if (!synth.current) {
      if (typeof AudioBuffer === "undefined") {
        return false;
      }

      synth.current = new Tone.PolySynth({
        voice: Tone.MembraneSynth,
        maxPolyphony: 8,
      }).toDestination();
    }

    if (!subSine.current) {
      subSine.current = new Tone.Synth({
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 0.002,
          decay: 0.25,
          sustain: 0.18,
          release: 0.18,
        },
      }).toDestination();
    }

    if (!subPunch.current) {
      subPunch.current = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 3.8,
        envelope: {
          attack: 0.001,
          decay: 0.05,
          sustain: 0,
          release: 0.015,
        },
      }).toDestination();
    }

    if (!punchFilter.current) {
      punchFilter.current = new Tone.Filter({
        frequency: 2600,
        type: "bandpass",
        Q: 6,
      }).toDestination();
    }

    if (!punchSynth.current) {
      punchSynth.current = new Tone.NoiseSynth({
        noise: {
          type: "white",
        },
        envelope: {
          attack: 0.0005,
          decay: 0.012,
          sustain: 0,
          release: 0.004,
        },
      }).connect(punchFilter.current);
    }

    configureSynth(synth.current);
    return true;
  }, [configureSynth]);

  useEffect(() => {
    if (synth.current) {
      configureSynth(synth.current);
    }
  }, [configureSynth]);

  useEffect(() => {
    return () => {
      synth.current?.dispose();
      subSine.current?.dispose();
      subPunch.current?.dispose();
      punchSynth.current?.dispose();
      punchFilter.current?.dispose();
      synth.current = null;
      subSine.current = null;
      subPunch.current = null;
      punchSynth.current = null;
      punchFilter.current = null;
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

      const levelAmount = Math.min(Math.max(level, 0), 1);
      const lowPitchWeight =
        1 - Math.min(Math.max((pitch - 18) / (50 - 18), 0), 1);
      const bodyDuration = Math.min(
        Math.max(0.06, length * 0.42 + decay * 0.16),
        0.55,
      );

      synth.current.triggerAttackRelease(pitch, bodyDuration, time);
      if (level > 0) {
        const subDuration = Math.max(
          length + decay * (0.55 + lowPitchWeight * 0.3),
          0.22,
        );
        const subLevel = Math.min(
          levelAmount * (0.55 + decay * 0.12 + lowPitchWeight * 0.3),
          1,
        );
        subSine.current.envelope.decay = Math.max(decay * 0.7, 0.16);
        subSine.current.envelope.sustain = 0.2 + lowPitchWeight * 0.2;
        subSine.current.envelope.release = Math.max(length * 1.1, 0.16);
        subSine.current.volume.value = gainToDb(subLevel);
        subSine.current.triggerAttackRelease(
          Math.max(pitch * (0.9 - lowPitchWeight * 0.08), 30),
          subDuration,
          time,
        );
      }
      if (punch > 0) {
        subPunch.current.set({
          pitchDecay: 0.008 + punch * 0.026,
          octaves: 3.4 + punch * 4.2,
          envelope: {
            attack: 0.001,
            decay: 0.026 + punch * 0.058,
            sustain: 0,
            release: 0.015,
          },
        });
        subPunch.current.volume.value = gainToDb(
          levelAmount * (0.08 + punch * 0.5),
        );
        subPunch.current.triggerAttackRelease(
          Math.max(pitch * (1.7 + punch * 1.2), 42),
          0.018 + punch * 0.028,
          time,
        );
        punchFilter.current.frequency.value = 1400 + punch * 5200;
        punchFilter.current.Q.value = 2 + punch * 10;
        punchSynth.current.volume.value = gainToDb(
          levelAmount * (0.02 + punch * 0.75),
        );
        punchSynth.current.envelope.decay = 0.004 + punch * 0.024;
        punchSynth.current.triggerAttackRelease(0.006 + punch * 0.018, time);
      }
    },
    [decay, length, level, pitch, punch, prepareSynth],
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

  // Expose playSynth to the parent component via the ref.
  useImperativeHandle(ref, () => ({
    playSynth,
    prepareSynth,
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
    <Box
      align="center"
      className="instrument-panel"
      pad="small"
      responsive={false}
    >
      <Tip
        dropProps={{ align: { left: "right" } }}
        content={"Trigger with A"}
        plain
        pad="small"
      >
        <Button
          className="instrument-trigger"
          label="Kick"
          onClick={triggerFromUI}
          primary
          size="small"
        />
      </Tip>
      <Slider
        parameter={pitch}
        setParameter={setPitch}
        minValue={2}
        maxValue={50}
        stepValue={1}
        controlName="Pitch"
      />
      <Slider
        parameter={decay}
        setParameter={setDecay}
        minValue={0.1}
        maxValue={1.8}
        stepValue={0.01}
        controlName="Decay"
      />
      <Slider
        parameter={length}
        setParameter={setLength}
        minValue={0.05}
        maxValue={1.4}
        stepValue={0.01}
        controlName="Length"
      />
      <Slider
        parameter={punch}
        setParameter={setPunch}
        minValue={0}
        maxValue={1}
        stepValue={0.01}
        controlName="Punch"
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

export default React.memo(Kick);
