# Processing game data to usable format

## Notes

### Case sensitivity
The game performs case-insensitive lookup between data tables.
This is a pain as JS objects/maps are case-sensitive.
To address this, we use the `Rows[].Name` of the respective DataTable as the
authoritative source. Maps are kept to perform lowercase lookup. 

## Relations
1. ItemStatic.Processing -> Processing.Name (M:1)
1. Processing.DefaultRecipeSet -> RecipeSets.Name (1:1)
1. ProcessorRecipes.RecipeSets -> Processing.DefaultRecipeSet (M:M)
1. ProcessorRecipes.Inputs|Output.Element -> ItemStatic.Name|ItemTemplate.Name (M:1)
1. ProcessorRecipes.ResourceInputs|Outputs.Type -> Resources.Name (M:1)
1. ProcessorRecipes.Requirement -> Talent.Name (0..M:1)
1. ProcessorRecipes.CharacterRequirement -> CharacterFlags.Name (0..M:1)
1. ItemTemplate.ItemStaticData -> ItemStatic.Name (1:1)
1. ItemStatic.Name -> ItemTemplate.ItemStaticData (1:0..1) **Reverse lookup**
1. ItemStatic.Itemable -> Itemable.Name (0..1:1)
1. WorkshopItems.Item -> ItemTemplate.Name (M:1)
1. ItemTemplate.Name -> WorkshopItems.Item (1:0..1) **Reverse lookup**
1. Talents.Rewards.GrantedFlags -> CharacterFlags.Name
