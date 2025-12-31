import { Button, Box } from "grommet";

export const Start = ({ playing, onToggle }) => {
  return (
    <Box margin="none" pad="none" align="end" height="min-content">
      <Button
        margin="none"
        pad="none"
        plain
        size="medium"
        label={playing ? "Stop" : "Start"}
        onClick={onToggle}
      />
    </Box>
  );
};
