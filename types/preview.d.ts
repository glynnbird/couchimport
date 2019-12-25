import { Config } from './index';

declare module preview {
    type UrlPreviewCallback = (err: Error, data: any, delimiter: '?' | '\t' | ',') => void;
    function url(u: string, opts: never, callback: UrlPreviewCallback): void;

    type StreamPreviewCallback = (err: any, data: any, delimiter: any) => void;
    function stream(rs: any, callback: StreamPreviewCallback): void;
    function stream(rs: any, opts: Config, callback: StreamPreviewCallback): void;

    function file(filename: string, callback: StreamPreviewCallback): void;
    function file(filename: string, opts: Config, callback: StreamPreviewCallback): void;
}

declare module "preview" {
    export = preview;
}