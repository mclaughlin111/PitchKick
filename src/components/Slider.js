import { RangeInput, Box, Text } from "grommet";

const Slider = ({
  parameter,
  setParameter,
  minValue,
  maxValue,
  stepValue,
  controlName,
  compact = false,
}) => {
  const handleSliderChange = (event) => {
    setParameter(parseFloat(event.target.value));
  };

  return (
    <Box
      align="center"
      className={compact ? "slider-row slider-row-compact" : "slider-row"}
      direction="row"
      margin={{ bottom: "xxsmall", top: "xsmall" }}
      responsive={false}
    >
      <Text className="slider-label" margin={{ right: "xsmall" }} size="xsmall">
        {controlName}
      </Text>
      <div className="parameter">
        <Text margin={{ right: "xsmall" }} size="xsmall" weight={300}>
          {parameter}
        </Text>
      </div>

      <RangeInput
        className="slider-input"
        string={"control"}
        title={`Set ${controlName}`}
        min={minValue}
        max={maxValue}
        step={stepValue}
        value={parameter}
        color={"#FFF"}
        onChange={handleSliderChange}
        margin={{ right: "xsmall" }}
      />
      <Text
        className="slider-max"
        margin={{ left: "xsmall" }}
        size="xsmall"
        weight={300}
      >
        {maxValue}
      </Text>
    </Box>
  );
};

export default Slider;
