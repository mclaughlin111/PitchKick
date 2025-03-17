import { Button } from "grommet";

export const Start = ({ playing, setPlaying }) => {
  return (
    <Button
      margin={{ top: "medium" }}
      plain
      size="medium"
      label={playing ? "Stop" : "Start"}
      onClick={() => {
        setPlaying(!playing);
      }}
    />
  );
};
