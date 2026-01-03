export type CsvValue = number | string | undefined;

export class CsvWriter {
    private readonly rows: Array<Record<string, CsvValue>> = [];

    constructor(
        private readonly fieldSeparator = '\t',
    ) {
    }

    get(): string {
        const columns = new Map<string, number>();

        for (const row of this.rows) {
            for (const column of Object.keys(row)) {
                if (row[column] === undefined) {
                    continue;
                }
                const occurrences = columns.get(column);
                if (occurrences === undefined) {
                    columns.set(column, 1);
                } else {
                    columns.set(column, occurrences + 1);
                }
            }
        }

        const columnsOrdered: Array<{name: string; occurrences: number}> = [];
        for (const [name, occurrences] of columns.entries()) {
            columnsOrdered.push({name: name, occurrences: occurrences});
        }
        columnsOrdered.sort((a, b) => {
            if (a.occurrences > b.occurrences) {
                return -1;
            } else if (a.occurrences < b.occurrences) {
                return 1;
            }

            return a.name.localeCompare(b.name);
        });

        const lines = [
            Array.from(columnsOrdered.values())
                .map(c => c.name)
                .join(this.fieldSeparator),
        ];

        for (const row of this.rows) {
            const rowAdd: Array<string> = [];
            for (const column of columnsOrdered) {
                const value = row[column.name];
                if (value === undefined) {
                    rowAdd.push('');
                    continue;
                }
                rowAdd.push(row[column.name]?.toString() ?? '');
            }
            lines.push(rowAdd.join(this.fieldSeparator));
        }

        return lines.join('\n');
    }

    add(row: Record<string, CsvValue>) {
        this.rows.push(row);
    }
}
