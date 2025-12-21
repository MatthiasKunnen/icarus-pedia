# Game data
The data contained in this directory is extracted from the game files.

The game's original copyright applies to this data.

## Updating the data
1. Using the UnrealPak cli, unpack the `data.pak`.
   `UnrealPak "PATH/TO/data.pak" "gamedata/data_pak" -extract`
1. Run `yarn run run:tool tools/summarize/summarize-game-data.ts 2>&1 | tee game-data-summarize-output.txt` summarize the data.

## Textures
1. Open FModel
1. Set _Archive Directory_ to the Icarus game files
1. Choose an _Output Directory_
1. Under _Archives_, set _Loading mode_ to _All_ and click _Load_
1. Navigate down to `Icarus/Content/Assets/2DArt/UI`
1. Right click and select `Save Folder's Packages Textures (.png)`.
   This could take a couple of minutes and generates around 500 MB of output.
1. Copy the `UI` folder in `fmodel_ouput_path/Exports/Icarus/Content/Assets/2DArt` to `gamedata\UI` 
1. Run `yarn run run:tool tools/summarize/sync-icons.ts`.
1. Run the `parallel` command as shown in the output of sync-icons in linux/wsl.

The 2DArt was previously (at 3398ea1d16bb8fb66dd9bf3f79a4f3ee939a9947) under s15 but was noted to be split on 2024-07-05 into multiple paks (s17/...).
