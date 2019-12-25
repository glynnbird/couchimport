import { Transform } from "stream";

declare module transformer {
    type MetaObject = {};
    function transform(func: (data: {}, meta: MetaObject) => {}, meta: MetaObject): Transform;

    export = transform
}
