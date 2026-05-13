import React, { useState, useRef, useEffect, useCallback } from "react";
import Kick from "../components/Kick";
import Snare from "../components/Snare";
import HiHat from "../components/HiHat";
import Sequencer from "../components/Sequencer";
import { Start } from "../components/Start";
import * as Tone from "tone";
import { Box, Grommet } from "grommet";
import { SelectBPM } from "../components/SelectBPM";
import { custom } from "../theme";

const SynthContainer = () => {
  const [playing, setPlaying] = useState(false);
  const [BPM, setBPM] = useState(120);
  const [kickPattern, setKickPatternState] = useState([
    1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
  ]);
  const [snarePattern, setSnarePatternState] = useState([
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  ]);
  const [hiHatPattern, setHiHatPatternState] = useState([
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
  ]);
  const [activeStep, setActiveStep] = useState(0);

  const kickRef = useRef(null);
  const snareRef = useRef(null);
  const hiHatRef = useRef(null);
  const loopRef = useRef(null);
  const stepIndexRef = useRef(0);
  const kickPatternRef = useRef(kickPattern);
  const snarePatternRef = useRef(snarePattern);
  const hiHatPatternRef = useRef(hiHatPattern);
  const patternLengthRef = useRef(
    Math.max(kickPattern.length, snarePattern.length, hiHatPattern.length),
  );
  const playingRef = useRef(playing);
  const resumePromiseRef = useRef(null);

  useEffect(() => {
    if (Tone.Transport.bpm) {
      Tone.Transport.bpm.value = BPM;
    }
  }, [BPM]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const stopSequencer = useCallback(() => {
    Tone.Transport.stop?.();
    playingRef.current = false;
    setPlaying(false);
    stepIndexRef.current = 0;
    setActiveStep(0);
  }, []);

  const resumeAudio = useCallback(async () => {
    if (Tone.context.state === "running") {
      return true;
    }

    if (!resumePromiseRef.current) {
      resumePromiseRef.current = Tone.start()
        .then(() => Tone.context.state === "running")
        .catch((error) => {
          console.warn("AudioContext start was blocked:", error);
          return false;
        })
        .finally(() => {
          resumePromiseRef.current = null;
        });
    }

    return resumePromiseRef.current;
  }, []);

  useEffect(() => {
    const handleStateChange = (state) => {
      console.info(`[AudioContext] state=${state}`);
      if (state !== "running" && playingRef.current) {
        stopSequencer();
      }
    };

    console.info(`[AudioContext] initial=${Tone.context.state}`);
    Tone.context.on?.("statechange", handleStateChange);

    const handleTransportStart = (time) => {
      console.info(`[Transport] start time=${time}`);
    };
    const handleTransportStop = (time) => {
      console.info(`[Transport] stop time=${time}`);
    };
    const handleTransportPause = (time) => {
      console.info(`[Transport] pause time=${time}`);
    };

    Tone.Transport.on?.("start", handleTransportStart);
    Tone.Transport.on?.("stop", handleTransportStop);
    Tone.Transport.on?.("pause", handleTransportPause);

    return () => {
      Tone.context.off?.("statechange", handleStateChange);
      Tone.Transport.off?.("start", handleTransportStart);
      Tone.Transport.off?.("stop", handleTransportStop);
      Tone.Transport.off?.("pause", handleTransportPause);
    };
  }, [stopSequencer]);

  useEffect(() => {
    const resumeOnGesture = () => {
      resumeAudio();
    };

    window.addEventListener("pointerdown", resumeOnGesture);
    window.addEventListener("keydown", resumeOnGesture);

    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };
  }, [resumeAudio]);

  const updatePatternLength = useCallback((kick, snare, hiHat) => {
    const length = Math.max(kick.length, snare.length, hiHat.length);
    patternLengthRef.current = length > 0 ? length : 1;
    if (stepIndexRef.current >= patternLengthRef.current) {
      stepIndexRef.current = 0;
    }
  }, []);

  const setKickPattern = useCallback(
    (newPattern) => {
      kickPatternRef.current = newPattern;
      setKickPatternState(newPattern);
      updatePatternLength(
        newPattern,
        snarePatternRef.current,
        hiHatPatternRef.current,
      );
    },
    [updatePatternLength],
  );

  const setSnarePattern = useCallback(
    (newPattern) => {
      snarePatternRef.current = newPattern;
      setSnarePatternState(newPattern);
      updatePatternLength(
        kickPatternRef.current,
        newPattern,
        hiHatPatternRef.current,
      );
    },
    [updatePatternLength],
  );

  const setHiHatPattern = useCallback(
    (newPattern) => {
      hiHatPatternRef.current = newPattern;
      setHiHatPatternState(newPattern);
      updatePatternLength(
        kickPatternRef.current,
        snarePatternRef.current,
        newPattern,
      );
    },
    [updatePatternLength],
  );

  useEffect(() => {
    if (typeof AudioBuffer === "undefined") {
      return undefined;
    }

    loopRef.current = new Tone.Loop((time) => {
      const length = patternLengthRef.current;
      if (!length || Tone.context.state !== "running") {
        return;
      }

      const stepIndex = stepIndexRef.current % length;
      const kickStep = kickPatternRef.current[stepIndex];
      const snareStep = snarePatternRef.current[stepIndex];
      const hiHatStep = hiHatPatternRef.current[stepIndex];

      if (kickStep === 1 && kickRef.current) {
        kickRef.current.playSynth(time);
      }

      if (snareStep === 1 && snareRef.current) {
        snareRef.current.playSynth(time);
      }

      if (hiHatStep === 1 && hiHatRef.current) {
        hiHatRef.current.playSynth(time);
      }

      Tone.Draw.schedule(() => {
        setActiveStep(stepIndex);
      }, time);

      stepIndexRef.current = (stepIndex + 1) % length;
    }, "16n").start(0);

    return () => {
      loopRef.current?.dispose();
      loopRef.current = null;
      Tone.Transport.stop?.();
    };
  }, []);

  const handleStartStop = useCallback(async () => {
    if (!playing) {
      if (
        !kickRef.current?.prepareSynth() ||
        !snareRef.current?.prepareSynth() ||
        !hiHatRef.current?.prepareSynth()
      ) {
        return;
      }

      const canPlay = await resumeAudio();
      if (!canPlay) {
        return;
      }

      Tone.Transport.start("+0.05");
      playingRef.current = true;
      setPlaying(true);
      return;
    }

    stopSequencer();
  }, [playing, resumeAudio, stopSequencer]);
  return (
    <>
      <Grommet theme={custom}>
        <Box
          className="transport-bar"
          flex={false}
          direction="row"
          pad="small"
          align="center"
          justify="start"
          height="min-content"
          responsive={false}
        >
          <SelectBPM bpm={BPM} setBPM={setBPM} />
          <Start playing={playing} onToggle={handleStartStop} />
        </Box>

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
        <Sequencer
          sequence={hiHatPattern}
          setSequence={setHiHatPattern}
          activeStep={activeStep}
        />

        <Box className="instrument-rack" direction="row" responsive={false}>
          <Kick ref={kickRef} />
          <Snare ref={snareRef} />
          <HiHat ref={hiHatRef} />
        </Box>
      </Grommet>
    </>
  );
};

export default SynthContainer;
