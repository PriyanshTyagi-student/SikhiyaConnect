import { Plugins } from '@capacitor/core';
const { ZipPlugin } = Plugins;
export class Zip {
    zip(options, progress) {
        return new Promise((resolve, reject) => {
            ZipPlugin.zip(options, (data, error) => {
                if (!error) {
                    if (!data.completed) {
                        if (progress) {
                            progress({
                                value: data.progress
                            });
                        }
                    }
                    else {
                        resolve({
                            value: data.path
                        });
                    }
                }
                else {
                    reject(error);
                }
            });
        });
    }
    unZip(options, progress) {
        return new Promise((resolve, reject) => {
            ZipPlugin.unZip(options, (data, error) => {
                if (!error) {
                    if (!data.completed) {
                        if (progress) {
                            progress({
                                value: data.progress
                            });
                        }
                    }
                    else {
                        resolve({
                            value: data.path
                        });
                    }
                }
                else {
                    reject(error);
                }
            });
        });
    }
}
//# sourceMappingURL=plugin.js.map