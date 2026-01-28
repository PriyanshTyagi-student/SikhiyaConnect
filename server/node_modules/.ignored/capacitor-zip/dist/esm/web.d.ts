import { WebPlugin } from '@capacitor/core';
import { IZip, ZipOptions, UnZipOptions } from './definitions';
export declare class ZipPluginWeb extends WebPlugin implements IZip {
    constructor();
    zip(options: ZipOptions): Promise<any>;
    unZip(options: UnZipOptions): Promise<any>;
}
declare const ZipPlugin: ZipPluginWeb;
export { ZipPlugin };
