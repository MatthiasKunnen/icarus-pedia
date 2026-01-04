interface DataTableInput<T, Defaults> {
    RowStruct: string;
    Defaults?: Defaults;
    Rows: Array<T>;
}

export class DataTableIdMap {
    constructor(
        private readonly map: Map<string, string>,
    ) {
    }

    get(key: string): string | undefined {
        return this.map.get(key.toLowerCase());
    }
}

export class DataTable<
    T extends {Name: string},
    Defaults = Record<string, unknown>,
> {
    Rows: Array<T>;

    private readonly defaults: Defaults | undefined;
    /**
     * maps the name to the index in the rows.
     */
    private readonly map = new Map<string, number>();

    constructor(dataTable: DataTableInput<T, Defaults>) {
        this.Rows = dataTable.Rows;
        this.defaults = dataTable.Defaults;
        let i = 0;
        for (const row of dataTable.Rows) {
            this.map.set(row.Name.toLowerCase(), i);
            i++;
        }
    }

    createMap(keyFn: (item: T) => string | undefined): DataTableIdMap {
        const map = new Map<string, string>();
        for (const row of this.Rows) {
            const key = keyFn(row)?.toLowerCase();
            if (key === undefined) {
                continue;
            }
            map.set(key, row.Name);
        }
        return new DataTableIdMap(map);
    }

    get(name: string): T | undefined {
        const rowIndex = this.map.get(name.toLowerCase());
        if (rowIndex === undefined) {
            return undefined;
        }

        return this.Rows[rowIndex];
    }
}
