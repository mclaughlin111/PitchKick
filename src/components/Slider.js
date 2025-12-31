import { RangeInput, Box, Text } from "grommet";

const Slider = ({
  parameter,
  setParameter,
  minValue,
  maxValue,
  stepValue,
  controlName,
}) => {
  const handleSliderChange = (event) => {
    setParameter(parseFloat(event.target.value));
  };

  return (
    <Box
      align="left"
      direction="row"
      margin={{ bottom: "small", top: "medium" }}
      responsive
    >
      <Text margin={{ right: "small" }}>{controlName}</Text>
      <div className="parameter">
        <Text weight={300} margin={{ right: "small" }}>
          {parameter}
        </Text>
      </div>

      <RangeInput
        string={"control"}
        title="Set Kick Pitch"
        min={minValue}
        max={maxValue}
        step={stepValue}
        value={parameter}
        color={"#FFF"}
        onChange={handleSliderChange}
        margin={{ right: "small" }} // Constant right margin for the slider
      />
      <Text weight={300} margin={{ left: "small" }}>
        {maxValue}
      </Text>
    </Box>
  );
};

export default Slider;
