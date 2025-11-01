import { Box, Button, Text } from "grommet";
import { FormNext, FormPrevious } from "grommet-icons";
import React from "react";

export const SelectBPM = ({ bpm, setBPM }) => {
  return (
    <>
      <Box flex="row" align="center" pad="xxsmall">
        <Button onClick={() => setBPM(bpm - 10)}>
          <FormPrevious />{" "}
        </Button>
        <Text size="small" weight="normal">
          {bpm}
        </Text>
        <Button onClick={() => setBPM(bpm + 10)}>
          <FormNext />{" "}
        </Button>
      </Box>
    </>
  );
};
