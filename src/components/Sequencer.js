import { CheckBox, Box } from "grommet";

const Sequencer = ({ sequence, setSequence }) => {
  return (
    <>
      <Box direction="row">
        {sequence.map((step) => (
          <div key={step} id={step}>
            <CheckBox onClick={setSequence} />
          </div>
        ))}
      </Box>
    </>
  );
};

export default Sequencer;
