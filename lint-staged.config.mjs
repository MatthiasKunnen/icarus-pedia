function mapFilenames(filenames) {
    return filenames.map(filename => `"${filename}"`).join(' ');
}

export default {
    '**/*.ts': (filenames) => [
        `yarn run lint:ts --fix --cache ${mapFilenames(filenames)}`,
        // `yarn run compile:ts`,
    ],
};
