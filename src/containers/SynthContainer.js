import React, { useState, useRef, useEffect } from "react";
import Kick from "../components/Kick";
import Sequencer from "../components/Sequencer";
import { Start } from "../components/Start";
import * as Tone from "tone";
import Snare from "../components/Snare";

const SynthContainer = () => {
  const [playing, setPlaying] = useState(false);
  const [kickPattern, setKickPattern] = useState([1, 0, 1, 0]);
  const [snarePattern, setSnarePattern] = useState([0, 0, 1, 0]);

  const kickRef = useRef(null);
  const snareRef = useRef(null);

  useEffect(() => {
    // Create a sequence for the kick
    const kickSeq = new Tone.Sequence(
      (time, step) => {
        console.log(`Kick step triggered: ${step}`);
        if (step === 1 && kickRef.current) {
          kickRef.current.playSynth(time);
        }
      },
      kickPattern,
      "8n"
    ).start(0);

    // Create a separate sequence for the snare
    const snareSeq = new Tone.Sequence(
      (time, step) => {
        console.log(`Snare step triggered: ${step}`);
        if (step === 1 && snareRef.current) {
          snareRef.current.playSynth(time);
        }
      },
      snarePattern,
      "8n"
    ).start(0);

    // Set the BPM for the transport
    Tone.Transport.bpm.value = 120;

    // Clean up both sequences and stop the transport when patterns change or component unmounts
    return () => {
      kickSeq.dispose();
      snareSeq.dispose();
      Tone.Transport.stop();
    };
  }, [kickPattern, snarePattern]);

  useEffect(() => {
    if (playing) {
      // Start the transport if playing
      Tone.start(); // Ensure the AudioContext is resumed
      Tone.Transport.start();
    } else {
      // Stop the transport if not playing
      Tone.Transport.stop();
    }
  }, [playing]);

  return (
    <>
      <Kick ref={kickRef} />
      <Snare ref={snareRef} />

      <Sequencer sequence={kickPattern} setSequence={setKickPattern} />
      <Start playing={playing} setPlaying={setPlaying} />
    </>
  );
};

export default SynthContainer;
