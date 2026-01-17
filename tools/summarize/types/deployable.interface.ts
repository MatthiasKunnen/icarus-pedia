import type {DataTable} from '../util/datatable.js';

export type DeployableDataTable = DataTable<DeployableRow>;

export interface DeployableRow {
    Name: string;
    EffectedByWeather?: boolean;
    bForceShowShelterIcon?: boolean;
    bMustBeOutside?: boolean;
}

