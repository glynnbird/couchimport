import { Options } from 'csv-parse';
import { Stream, Transform } from 'stream';

declare module couchimport {
    type Delimiter = '?' | '\t' | ',';

    type ImportCallback = (err: Error, data: { total: number, totalFailed: number }) => void;
    type ExportCallback = (err: Error, data: never) => void;
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

    function importStream(rs: Stream, callback: ImportCallback): Transform;
    function importStream(rs: Stream, opts: Config, callback: ImportCallback): Transform;

    function importFile(filename: string, callback: ImportCallback): Transform;
    function importFile(filename: string, opts: Config, callback: ImportCallback): Transform;

    function exportStream(ws: Stream, callback: ExportCallback): void;
    function exportStream(ws: Stream, opts: Config, callback: ExportCallback): void;

    function exportFile(filename: string, callback: ExportCallback): void;
    function exportFile(filename: string, opts: Config, callback: ExportCallback): void;

    function previewURL(u: string, opts: never, callback: UrlPreviewCallback): void;

    function previewStream(rs: Stream, callback: StreamPreviewCallback): void;
    function previewStream(rs: Stream, opts: Config, callback: StreamPreviewCallback): void;

    function previewCSVFile(filename: string, callback: StreamPreviewCallback): void;
    function previewCSVFile(filename: string, opts: Config, callback: StreamPreviewCallback): void;
}

declare module "couchimport" {
    export = couchimport;
}
