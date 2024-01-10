import { RangeInput, Box, Text } from "grommet";

const Slider = ({ parameter, setParameter, controlName }) => {

    const handleSliderChange = (event) => {
        console.log("slider at" + event)
        setParameter(event.target.value)
    }

    
    return ( <Box align="center" width="small" margin="medium">
<Text margin={{ bottom: "small" }}>{controlName}</Text>
    <RangeInput
       title="Set Kick Pitch"
       min={2}
       max={150}
       step={0.5}
       value={parameter}
       onChange={handleSliderChange}
     /> 
         </Box> );
}
 
export default Slider;