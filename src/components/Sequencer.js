import React, { useCallback } from "react";

const Sequencer = ({ sequence, setSequence, activeStep }) => {
  const handleChange = useCallback(
    (idx, checked) => {
      const newSequence = [...sequence];
      newSequence[idx] = checked ? 1 : 0;

      requestAnimationFrame(() => {
        setSequence(newSequence);
      });
    },
    [sequence, setSequence]
  );

  return (
    <div className="sequencer">
      {sequence.map((step, idx) => (
        <input
          style={
            idx === activeStep
              ? {
                  backgroundColor: "grey",
                  scale: "0.98",
                }
              : {}
          }
          key={idx}
          type="checkbox"
          checked={step === 1}
          onChange={(e) => handleChange(idx, e.target.checked)}
        />
      ))}
    </div>
  );
};

export default React.memo(Sequencer);
