import { Options } from 'csv-parse';
import { Stream } from 'stream';

declare module couchimport {
    type Delimiter = '?' | '\t' | ',';

    type CouchImportCallback = (err: Error, data: { total: number, totalFailed: number }) => void;
    type CouchExportCallback = (err: Error, data: never) => void;
    type UrlPreviewCallback = (err: Error, data: any, delimiter: Delimiter) => void;
    type StreamPreviewCallback = (err: Error, data: any, delimiter: Delimiter) => void;

    export interface Config {
        url?: string;
        database?: string;
        delimiter?: Options['delimiter'];
        type?: 'json' | 'jsonl' | 'text';
        buffer?: number;
        jsonpath?: string;
        transform?: (data: any, meta: {}) => any;
        meta?: {};
        parallelism?: number;
        preview?: boolean;
        ignorefields?: string[];
        overwrite?: boolean;
    }

    function importStream(rs: Stream, callback: CouchImportCallback): void;
    function importStream(rs: Stream, opts: Config, callback: CouchImportCallback): void;

    function importFile(filename: string, callback: CouchImportCallback): void;
    function importFile(filename: string, opts: Config, callback: CouchImportCallback): void;

    function exportStream(ws: Stream, callback: CouchExportCallback): void;
    function exportStream(ws: Stream, opts: Config, callback: CouchExportCallback): void;

    function exportFile(filename: string, callback: CouchExportCallback): void;
    function exportFile(filename: string, opts: Config, callback: CouchExportCallback): void;

    function previewURL(u: string, opts: never, callback: UrlPreviewCallback): void;

    function previewStream(rs: Stream, callback: StreamPreviewCallback): void;
    function previewStream(rs: Stream, opts: Config, callback: StreamPreviewCallback): void;

    function previewCSVFile(filename: string, callback: StreamPreviewCallback): void;
    function previewCSVFile(filename: string, opts: Config, callback: StreamPreviewCallback): void;
}

declare module "couchimport" {
    export = couchimport;
}