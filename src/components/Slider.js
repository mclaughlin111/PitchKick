import { RangeInput, Box, Text } from "grommet";

const Slider = ({ parameter, setParameter, minValue, maxValue, stepValue, controlName }) => {

    const handleSliderChange = (event) => {
        console.log("slider at" + event)
        setParameter(event.target.value)
    }

    
    return ( <Box  align="center" direction="row" width="small" margin="medium">
<Text margin={{ right: "small" }}>{controlName}</Text>
<Text weight={300}>{parameter}</Text>
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
   <Text weight={300}>{maxValue}</Text>
         </Box> );
}
 
export default Slider;