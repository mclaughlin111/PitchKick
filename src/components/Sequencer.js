import { CheckBox, Box } from "grommet";

const Sequencer = () => {
  const pattern = Array(8).fill(Boolean);
  console.log(pattern.length);

  return (
    <>
      <Box direction="row">
        {pattern.map((step) => (
          <div key={step}>
            <CheckBox />
          </div>
        ))}
      </Box>
    </>
  );
};

export default Sequencer;
