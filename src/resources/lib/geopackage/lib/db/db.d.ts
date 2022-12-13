/// <reference types="node" />
import { DBAdapter } from './dbAdapter';
export declare class Db {
    private static adapterCreator;
    static registerDbAdapter(adapter: new (path: string | Buffer | Uint8Array | undefined) => DBAdapter): void;
    static create(path?: string | Buffer | Uint8Array | undefined): DBAdapter;
}
