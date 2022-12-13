/// <reference types="node" />
import { DBAdapter } from '../db/dbAdapter';
import { CanvasAdapter } from '../canvas/canvasAdapter';
export declare class Context {
    static isNode: boolean;
    static isBrowser: boolean;
    static isWebWorker: boolean;
    static initializeContext(): Promise<void>;
    /**
     * Registers the sqlite adapter. Will check for better-sqlite3 dependency before trying.
     * @private
     */
    private static registerSqliteAdapter;
    static setupNodeContext(): void;
    static setupBrowserContext(): void;
    static setupWebWorkerContext(): void;
    /**
     * Will attempt to register a custom context.
     * @param dbAdapter
     * @param canvasAdapter
     */
    static setupCustomContext(dbAdapter: new (path: string | Buffer | Uint8Array | undefined) => DBAdapter, canvasAdapter: new () => CanvasAdapter): void;
    static setupDefaultContext(): void;
}
