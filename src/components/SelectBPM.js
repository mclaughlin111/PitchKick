import { Box, Button, Text } from "grommet";
import {
  CaretLeftFill,
  CaretRightFill,
  FormNext,
  FormPrevious,
} from "grommet-icons";
import React from "react";

export const SelectBPM = ({ bpm, setBPM }) => {
  const adjustBPM = (amount) => {
    setBPM((currentBPM) => Math.max(1, currentBPM + amount));
  };

  return (
    <>
      <Box direction="row" align="center" gap="xsmall" pad="xxsmall">
        <Button
          a11yTitle="Decrease BPM by 10"
          className="bpm-button bpm-button-large-step"
          icon={<FormPrevious color="rgba(255, 255, 255, 0.48)" />}
          onClick={() => adjustBPM(-10)}
          plain
        />
        <Button
          a11yTitle="Decrease BPM by 1"
          className="bpm-button bpm-button-small-step"
          icon={<CaretLeftFill color="white" />}
          onClick={() => adjustBPM(-1)}
          plain
        />
        <Text
          className="bpm-value"
          size="small"
          textAlign="center"
          weight="normal"
        >
          {bpm}
        </Text>
        <Button
          a11yTitle="Increase BPM by 1"
          className="bpm-button bpm-button-small-step"
          icon={<CaretRightFill color="white" />}
          onClick={() => adjustBPM(1)}
          plain
        />
        <Button
          a11yTitle="Increase BPM by 10"
          className="bpm-button bpm-button-large-step"
          icon={<FormNext color="rgba(255, 255, 255, 0.48)" />}
          onClick={() => adjustBPM(10)}
          plain
        />
      </Box>
    </>
  );
};
