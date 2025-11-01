import React, { useState, useRef, useEffect } from "react";
import Kick from "../components/Kick";
import Snare from "../components/Snare";
import Sequencer from "../components/Sequencer";
import { Start } from "../components/Start";
import * as Tone from "tone";
import { Box, Grommet } from "grommet";
import { SelectBPM } from "../components/SelectBPM";

const SynthContainer = () => {
  const [playing, setPlaying] = useState(false);
  const [BPM, setBPM] = useState(120);
  const [kickPattern, setKickPattern] = useState([1, 0, 0, 0, 1, 0, 0, 0]);
  const [snarePattern, setSnarePattern] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [activeStep, setActiveStep] = useState(0);

  const kickRef = useRef(null);
  const snareRef = useRef(null);

  const custom = {
    checkBox: {
      check: {
        extend: `
          display: flex;
          align-items: center;
          justify-content: center;
        `,
      },
      icon: {
        size: "10px", // Adjust size if needed
      },
      toggle: {
        background: "none",
      },
    },
  };

  // Create Tone.Sequence for kick and snare as before.
  useEffect(() => {
    const kickSeq = new Tone.Sequence(
      (time, step) => {
        console.log(`Kick step triggered: ${step}`);
        if (step === 1 && kickRef.current) {
          kickRef.current.playSynth(time);
        }
      },
      kickPattern,
      "16n"
    ).start(0);

    const snareSeq = new Tone.Sequence(
      (time, step) => {
        console.log(`Snare step triggered: ${step}`);
        if (step === 1 && snareRef.current) {
          snareRef.current.playSynth(time);
        }
      },
      snarePattern,
      "16n"
    ).start(0);

    Tone.Transport.bpm.value = BPM;

    return () => {
      kickSeq.dispose();
      snareSeq.dispose();
      Tone.Transport.stop();
    };
  }, [kickPattern, snarePattern]);

  // Create a separate schedule to update activeStep visually.
  useEffect(() => {
    let index = 0;
    const updateVisual = (time) => {
      setActiveStep(index);
      index = (index + 1) % kickPattern.length; // assuming both patterns have the same length
    };

    // Schedule this callback on every 8th note.
    const visualId = Tone.Transport.scheduleRepeat(updateVisual, "16n");

    return () => {
      Tone.Transport.clear(visualId);
    };
  }, [kickPattern]);

  useEffect(() => {
    if (playing) {
      Tone.start(); // Ensure AudioContext is resumed
      Tone.Transport.start();
    } else {
      Tone.Transport.stop();
    }
  }, [playing]);

  return (
    <>
      <Grommet theme={custom}>
        <SelectBPM bpm={BPM} setBPM={setBPM} />
        <Sequencer
          sequence={kickPattern}
          setSequence={setKickPattern}
          activeStep={activeStep}
        />
        <Sequencer
          sequence={snarePattern}
          setSequence={setSnarePattern}
          activeStep={activeStep}
        />
        <Box direction="row">
          <Kick ref={kickRef} />
          <Snare ref={snareRef} />
        </Box>
        <Start playing={playing} setPlaying={setPlaying} />
      </Grommet>
    </>
  );
};

export default SynthContainer;
