import React, { useState, useRef, useEffect, useCallback } from "react";
import Kick from "../components/Kick";
import Snare from "../components/Snare";
import Sequencer from "../components/Sequencer";
import { Start } from "../components/Start";
import * as Tone from "tone";
import { Box, Grommet } from "grommet";
import { SelectBPM } from "../components/SelectBPM";
import { custom } from "../theme";

const SynthContainer = () => {
  const [playing, setPlaying] = useState(false);
  const [BPM, setBPM] = useState(120);
  const [kickPattern, setKickPatternState] = useState([1, 0, 0, 0, 1, 0, 0, 0]);
  const [snarePattern, setSnarePatternState] = useState([
    0, 0, 0, 0, 1, 0, 0, 0,
  ]);
  const [activeStep, setActiveStep] = useState(0);

  const kickRef = useRef(null);
  const snareRef = useRef(null);
  const kickSeqRef = useRef(null);
  const snareSeqRef = useRef(null);

  useEffect(() => {
    Tone.Transport.bpm.value = BPM;
  }, [BPM]);

  useEffect(() => {
    const handleStateChange = (state) => {
      console.info(`[AudioContext] state=${state}`);
    };

    console.info(`[AudioContext] initial=${Tone.context.state}`);
    Tone.context.on("statechange", handleStateChange);

    const handleTransportStart = (time) => {
      console.info(`[Transport] start time=${time}`);
    };
    const handleTransportStop = (time) => {
      console.info(`[Transport] stop time=${time}`);
    };
    const handleTransportPause = (time) => {
      console.info(`[Transport] pause time=${time}`);
    };

    Tone.Transport.on("start", handleTransportStart);
    Tone.Transport.on("stop", handleTransportStop);
    Tone.Transport.on("pause", handleTransportPause);

    return () => {
      Tone.context.off("statechange", handleStateChange);
      Tone.Transport.off("start", handleTransportStart);
      Tone.Transport.off("stop", handleTransportStop);
      Tone.Transport.off("pause", handleTransportPause);
    };
  }, []);

  useEffect(() => {
    const resumeOnGesture = async () => {
      if (Tone.context.state === "running") {
        return;
      }
      try {
        await Tone.start();
      } catch (error) {
        console.warn("AudioContext start was blocked:", error);
      }
    };

    window.addEventListener("pointerdown", resumeOnGesture);
    window.addEventListener("keydown", resumeOnGesture);

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };
  }, []);

  const setKickPattern = useCallback((newPattern) => {
    setKickPatternState(newPattern);
    if (kickSeqRef.current) {
      kickSeqRef.current.events = newPattern;
    }
  }, []);

  const setSnarePattern = useCallback((newPattern) => {
    setSnarePatternState(newPattern);
    if (snareSeqRef.current) {
      snareSeqRef.current.events = newPattern;
    }
  }, []);

  // Modified sequence creation effect
  useEffect(() => {
    kickSeqRef.current = new Tone.Sequence(
      (time, step) => {
        if (step === 1 && kickRef.current) {
          kickRef.current.playSynth(time);
        }
      },
      kickPattern,
      "16n"
    ).start(0);

    snareSeqRef.current = new Tone.Sequence(
      (time, step) => {
        if (step === 1 && snareRef.current) {
          snareRef.current.playSynth(time);
        }
      },
      snarePattern,
      "16n"
    ).start(0);

    return () => {
      kickSeqRef.current?.dispose();
      snareSeqRef.current?.dispose();
      Tone.Transport.stop();
    };
  }, [kickRef, snareRef]);

  useEffect(() => {
    let index = 0;
    const updateVisual = (time) => {
      const stepIndex = index;
      index = (index + 1) % kickPattern.length;
      Tone.Draw.schedule(() => {
        setActiveStep(stepIndex);
      }, time);
    };

    // Schedule UI updates on the draw thread to avoid blocking audio scheduling.
    const visualId = Tone.Transport.scheduleRepeat(updateVisual, "16n");

    return () => {
      Tone.Transport.clear(visualId);
    };
  }, [kickPattern.length]);

  const handleStartStop = useCallback(async () => {
    if (!playing) {
      if (Tone.context.state !== "running") {
        try {
          await Tone.start();
        } catch (error) {
          console.warn("AudioContext start was blocked:", error);
          return;
        }
      }
      Tone.Transport.start("+0.05");
      setPlaying(true);
      return;
    }

    Tone.Transport.stop();
    setPlaying(false);
    setActiveStep(0);
  }, [playing]);
  return (
    <>
      <Grommet theme={custom}>
        <Box
          flex={false}
          direction="row"
          pad="small"
          align="center"
          justify="left"
          height="min-content"
        >
          <SelectBPM bpm={BPM} setBPM={setBPM} />
          <Start playing={playing} onToggle={handleStartStop} />
        </Box>
        {/* 
        <Sequencer
          sequence={kickPattern}
          setSequence={setKickPattern}
          activeStep={activeStep}
        /> */}
        <Sequencer
          sequence={snarePattern}
          setSequence={setSnarePattern}
          activeStep={activeStep}
        />

        <Box direction="row">
          {/* <Kick ref={kickRef} /> */}
          <Snare ref={snareRef} />
        </Box>
      </Grommet>
    </>
  );
};

export default SynthContainer;
