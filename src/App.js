import SynthContainer from './containers/SynthContainer';
import { TbWaveSine } from "react-icons/tb";

function App() {
  return (
    <div className="synthContainer">
    
      <h1>Pitch-Kick <span><TbWaveSine /></span></h1>
      <SynthContainer />
    </div>
  );
}

export default App;
