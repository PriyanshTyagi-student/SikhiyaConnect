import { IZip, UnZipOptions, ZipOptions } from './definitions';
export declare class Zip implements IZip {
    zip(options: ZipOptions, progress?: Function): Promise<any>;
    unZip(options: UnZipOptions, progress?: Function): Promise<any>;
}
