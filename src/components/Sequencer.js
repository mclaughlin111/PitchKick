import React, { useCallback } from "react";

const STEPS_PER_GROUP = 4;

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

  const groups = [];
  for (let i = 0; i < sequence.length; i += STEPS_PER_GROUP) {
    groups.push(sequence.slice(i, i + STEPS_PER_GROUP));
  }

  return (
    <div className="sequencer">
      {groups.map((group, groupIdx) => (
        <div className="sequencer-group" key={groupIdx}>
          {group.map((step, idx) => {
            const stepIdx = groupIdx * STEPS_PER_GROUP + idx;

            return (
              <input
                style={
                  stepIdx === activeStep
                    ? {
                        backgroundColor: "grey",
                        scale: "0.98",
                      }
                    : {}
                }
                key={stepIdx}
                type="checkbox"
                checked={step === 1}
                onChange={(e) => handleChange(stepIdx, e.target.checked)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default React.memo(Sequencer);
