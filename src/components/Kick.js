import * as Tone from "tone";
import Slider from "./Slider";
import { useState, useEffect } from "react";



const Kick = () => {

  const [pitch, setPitch] = useState(15); // state for pitch
  const synth = new Tone.MembraneSynth().toDestination(); // setup Tone Membrane Drum Synthesis Synth with user audio output .toDestination()

// Trigger Synth 
function playSynth() {
  Tone.start()
  console.log("kick triggered");
  synth.triggerAttackRelease(pitch, "8n");
}

useEffect(() => {
  const handleKeyPress = (event) => {
    // Check if the pressed key is the 'k' key (key code 13)
    console.log(event.code)
    if (event.code === "KeyK") {
      playSynth();
    }
  };
  // event listener for a keydown keypress that triggers function inside useEffect
  window.addEventListener("keydown", handleKeyPress);
  // Detach the event listener when the component unmounts
  return () => {
    window.removeEventListener("keydown", handleKeyPress);
  };
}, ); // Add pitch to the dependency array if it's used inside the useEffect

  return (
    <>

      <button onClick={playSynth}>Kick</button>
      <Slider parameter={pitch} setParameter={setPitch} controlName="Pitch"/> 

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