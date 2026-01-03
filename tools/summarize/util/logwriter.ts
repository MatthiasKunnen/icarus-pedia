import {createWriteStream, type WriteStream} from 'node:fs';

export class LogWriter {
    private readonly fileStream?: WriteStream;

    constructor(filePath?: string) {
        if (filePath !== undefined) {
            this.fileStream = createWriteStream(filePath, {
                flags: 'w',
            });
        }
    }

    print(message: string): void {
        process.stdout.write(message, 'utf-8');
        process.stdout.write('\n', 'utf-8');
        this.fileStream?.write(message, 'utf-8');
        this.fileStream?.write('\n', 'utf-8');
    }

    /**
     * Logs an error, flushes all streams, and exits the process.
     */
    async fatal(message: string): Promise<never> {
        this.print(`[FATAL] ${message}`);
        try {
            await this.flush();
        } finally {
            process.exit(1);
        }
    }

    /**
     * Ensures all buffered data is written to the underlying system.
     */
    async flush(): Promise<void> {
        const promises: Array<Promise<unknown>> = [
            new Promise<void>((resolve) => {
                process.stdout.write('\n', (err?: Error | null) => {
                    if (err != null) {
                        // eslint-disable-next-line no-console
                        console.log('Error flushing stdout buffer', err);
                    }
                    resolve();
                });
            }),
        ];
        const fileStream = this.fileStream;
        if (fileStream !== undefined) {
            promises.push(new Promise<void>((resolve) => {
                if (fileStream.writableLength === 0) {
                    resolve();
                    return;
                }

                fileStream.once('drain', resolve);
            }));
        }

        try {
            await Promise.allSettled(promises);
        } catch {
            // Ignore
        }
    }
}
