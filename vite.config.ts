import path from 'node:path';

import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

const datafile = 'tools/summarize/summarized-data.json';

export default defineConfig({
    plugins: [
        sveltekit(),
        {
            name: 'summarized-data-change',
            handleHotUpdate({file, server}) {
                if (!file.endsWith(datafile)) {
                    return;
                }

                const module = server.moduleGraph.getModuleById(
                    path.normalize(file),
                );
                if (module === undefined) {
                    console.error(`Could not find ${file} to invalidate module`);
                    return;
                }
                server.moduleGraph.invalidateModule(module);
                server.ws.send({type: 'full-reload'});
            },
        },
    ],
});
