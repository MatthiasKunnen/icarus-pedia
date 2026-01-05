import type {RefWithDataTable} from './common.interface.js';
import type {DataTable} from '../util/datatable.js';

/**
 * See _Traits/D_Processing.json_.
 * Maps _ItemStatic.Processing_ > _this.Name_.
 */
export type ProcessingDataTable = DataTable<ProcessingFileRow>;

export interface ProcessingFileRow {
    Name: string;
    /**
     * Maps to _ProcessorRecipes_.
     */
    DefaultRecipeSet?: RefWithDataTable;
    RequiresEnergy: boolean;
    bRequiresShelter: boolean;
    AutoSelectRecipe: boolean;
    ManualActivation: boolean;
    QueueSize: number;
    MaxMilliwattage: number;
    EffectedByPlayerStats: boolean;
    SendOutputDirectlyToPlayer: boolean;
    AutoTurnOffDeviceWhileNotProcessing: boolean;
}
