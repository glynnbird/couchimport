import { file, url, stream } from "./preview";
import { Options } from 'csv-parse';
import { default as transformer, MetaObject } from "./transformer";
import { Stream } from 'stream';

declare module couchimport {
    type CouchImportCallback = (err: any, data: { total: number, totalFailed: number }) => void;
    type CouchExportCallback = (err: any, data: never) => void;

    interface Config {
        url?: string;
        database?: string;
        delimiter?: Options['delimiter'];
        type?: 'json' | 'jsonl' | 'text';
        buffer?: number;
        jsonpath?: string;
        transform?: transformer;
        meta?: MetaObject;
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

    const previewCSVFile = file;
    const previewURL = url;
    const previewStream = stream;
}

declare module "couchimport" {
    export = couchimport;
}