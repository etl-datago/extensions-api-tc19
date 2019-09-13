// Wrap everything in an anonymous function to avoid polluting the global namespace
(async () => {

    class OurExt {
        // Avoid globals
        constructor(private _$: JQueryStatic) { }

        // This is the entry point into the extension.
        public async initialize() {

            // Start with initialization
            tableau.extensions.initializeAsync();
        }
    }

    console.log('Initializing OurExt extension.');
    await new OurExt($).initialize();
})();
