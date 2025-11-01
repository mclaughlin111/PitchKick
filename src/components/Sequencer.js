import { CheckBox, Box } from "grommet";

const Sequencer = ({ sequence, setSequence, activeStep }) => {
  const handleChange = (idx, checked) => {
    const newSequence = [...sequence];
    newSequence[idx] = checked ? 1 : 0;
    setSequence(newSequence);
  };

  return (
    <Box direction="row">
      {sequence.map((step, idx) => (
        <div
          key={idx}
          style={
            idx === activeStep
              ? {
                  backgroundColor: "white",
                  scale: "0.9",
                }
              : {}
          }
        >
          <CheckBox
            checked={step === 1}
            onChange={(e) => handleChange(idx, e.target.checked)}
            icon={"-"}
          />
        </div>
      ))}
    </Box>
  );
};

export default Sequencer;
