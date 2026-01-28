import { WebPlugin } from '@capacitor/core';
export class ZipPluginWeb extends WebPlugin {
    constructor() {
        super({
            name: 'ZipPlugin',
            platforms: ['web']
        });
    }
    zip(options) {
        console.log(options);
        return Promise.resolve({});
    }
    unZip(options) {
        console.log(options);
        return Promise.resolve({});
    }
}
const ZipPlugin = new ZipPluginWeb();
export { ZipPlugin };
//# sourceMappingURL=web.js.map