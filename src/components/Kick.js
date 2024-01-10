import * as Tone from "tone";
// import { useState } from "react";
import { RangeInput, Box } from "grommet";

const synth = new Tone.MembraneSynth().toDestination();
function playSynth() {
  console.log("kick triggered");
  synth.triggerAttackRelease("C1", "8n");
}

const [pitch, setPitch] = React.useState(1);

const Kick = () => {
  

  const setKick = e => {
    console.log(e)
    console.log(pitch, setPitch);
    // setPitch(pitch.target.value)
}
  return (
    <>
      <button onClick={playSynth}>Kick</button>
      <Box align="center" width="medium">

     <RangeInput
        title="Set Kick Pitch"
        min={0.5}
        max={10}
        step={0.1}
        value={1}
        onChange={setKick()}
      /> 
          </Box>
    </>
  );
};

export default Kick;

/* <RangeInput
        Title="Select range value"
        min={0.5}
        max={10}

        value={pitch}
        onChange={onChange}
      /> */