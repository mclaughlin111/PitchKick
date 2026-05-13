# [PitchKick](https://tommcl.co.uk/pitchkick/)

Kick Drum Synthesis Experiment using Tone.js

## Server Rsync

Build the latest production files before syncing:

```sh
npm run build
```

Preview the files that would be copied to the server:

```sh
rsync -rvn build/ root@68.183.35.230:/var/www/tommcl.co.uk/public_html/pitch-seq/
```

Deploy the contents of the local `build` folder to the server:

```sh
rsync -rv build/ root@68.183.35.230:/var/www/tommcl.co.uk/public_html/pitch-seq/
```

Notes:

- `-r` copies directories recursively.
- `-v` prints the files being transferred.
- `-n` is a dry run, so it previews changes without copying files.
- The trailing slash in `build/` means rsync copies the contents of `build`, not the folder itself.
- Only add `--delete` if `/var/www/tommcl.co.uk/public_html/pitch-seq/` is dedicated to this app and should exactly mirror `build/`.
