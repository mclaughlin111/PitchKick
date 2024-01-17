import { RangeInput, Box, Text } from "grommet";

const Slider = ({ parameter, setParameter, minValue, maxValue, stepValue, controlName }) => {

    const handleSliderChange = (event) => {
        console.log("slider at" + event)
        setParameter(event.target.value)
    }

    
    return ( <Box  align="center" direction="row"  margin={{ bottom: "small", top: "medium"}}>
<Text margin={{ right: "small" }}>{controlName}</Text>
<Text weight={300}   margin={{ right: "medium" }}>{parameter}</Text>
    <RangeInput
    string={"control"}
       title="Set Kick Pitch"
       min={minValue}
       max={maxValue}
       step={stepValue}
       value={parameter}
       color={"#FFF"}
       onChange={handleSliderChange}
     /> 
   <Text weight={300} margin={{ left: "small" }}>{maxValue}</Text>
         </Box> );
}
 
export default Slider;