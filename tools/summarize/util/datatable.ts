interface DataTableInput<T, Defaults> {
    RowStruct: string;
    Defaults?: Defaults;
    Rows: Array<T>;
}

export class DataTableIdMap<Value> {
    constructor(
        private readonly map: Map<string, Value>,
    ) {
    }

    get(key: string): Value | undefined {
        return this.map.get(key.toLowerCase());
    }

    entries(): IterableIterator<[key: string, value: Value]> {
        return this.map.entries();
    }
}

export class DataTable<
    T extends {Name: string},
    Defaults = Record<string, unknown>,
> {
    readonly Rows: Array<T>;
    readonly RowStruct: string;

    private readonly defaults: Defaults | undefined;
    /**
     * maps the name to the index in the rows.
     */
    private readonly map = new Map<string, number>();

    constructor(dataTable: DataTableInput<T, Defaults>) {
        this.Rows = dataTable.Rows;
        this.RowStruct = dataTable.RowStruct;
        this.defaults = dataTable.Defaults;
        let i = 0;
        for (const row of dataTable.Rows) {
            this.map.set(row.Name.toLowerCase(), i);
            i++;
        }
    }

    /**
     * Creates a new case-insensitive Map with a key-value pair for each row in this data table.
     * The value is the name of the data row. The key is the value returned from keyFn.
     * If keyFn returns undefined, the row is skipped.
     */
    mapKeyFrom(
        keyFn: (item: T) => string | undefined,
        cardinality: '1',
    ): DataTableIdMap<string>;
    mapKeyFrom(
        keyFn: (item: T) => string | undefined,
        cardinality: 'many',
    ): DataTableIdMap<Array<string>>;
    mapKeyFrom(
        keyFn: (item: T) => string | undefined,
        cardinality: '1' | 'many',
    ): DataTableIdMap<Array<string> | string> {
        const m = cardinality === '1'
            ? {type: '1', map: new Map<string, string>()} as const
            : {type: 'many', map: new Map<string, Array<string>>()} as const;

        for (const row of this.Rows) {
            const key = keyFn(row)?.toLowerCase();
            if (key === undefined) {
                continue;
            }

            switch (m.type) {
                case '1':
                    if (m.map.has(key)) {
                       throw new Error(`Duplicate key '${key}' for DataTable=${
                           this.RowStruct} row.Name=${row.Name} with cardinality 1`);
                    } else {
                        m.map.set(key, row.Name);
                    }
                    break;
                case 'many': {
                    const val = m.map.get(key);
                    if (val === undefined) {
                        m.map.set(key, [row.Name]);
                    } else {
                        val.push(row.Name);
                    }
                    break;
                }
            }
        }

        return new DataTableIdMap<any>(m.map);
    }

    get(name: string): T | undefined {
        const rowIndex = this.map.get(name.toLowerCase());
        if (rowIndex === undefined) {
            return undefined;
        }

        return this.Rows[rowIndex];
    }
}
