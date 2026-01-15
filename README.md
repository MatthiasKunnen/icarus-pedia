# [IcarusPedia](https://icaruspedia.gametools.cloud/)
IcarusPedia is a website dedicated to information on the game Icarus
([View on Steam](https://store.steampowered.com/app/1149460/ICARUS/)).
It contains information such as crafting recipes, stats, and comparisons.
It predates, and aims to contain more information than, the game's internal field guide.

Information is compiled straight from the game files in order to stay up-to-date.

View IcarusPedia on <https://icaruspedia.gametools.cloud/>.

## Why does it exist
IcarusPedia is both meant to be an accurate, helpful, and up-to-date resource for players as well as technical challenge for myself in making it fast, static only and UX friendly.
To that order, the website is developed in Svelte 5, and is compiled to static HTML files. The interactivity enabled by Svelte is loaded in after the content is already displayed, enabling a fast experience for users.

## Development

### Updating game data
The gamedata and textures are extracted from the game files.
See [gamedata/README.md](./gamedata/README.md).

## TODO
- [ ] Why are workshop backpacks usable false?
- [ ] Add tag based crafting support, introduced in week 213, 2026-01-01
- [ ] Add groups; ammo, attachments
- [ ] Add more content and buttons to items on landingspage
- [ ] Add big food/consumable comparison table
- [ ] Add numbers from D_Armour to armour pieces
- [ ] Add armor sets
- [ ] Add effected by weather from D_Deployable
- [ ] Maybe make a simple calculator?
- [ ] Smaller icons and font on mobile
- [ ] Add required tech tree item
- [ ] Show prospects, exotics min and max, and maybe, the todos,
      example: Tier3_RiverLands_Stockpile_0
- [ ] Add farm reward info for crops D_FarmingSeeds links to D_FarmingRewards
- [x] Why are the following items not in the list of items?
  - spoiled plants
  - meat
  - yeast

  Maybe because we need to show items that are used in craftable recipes. 
