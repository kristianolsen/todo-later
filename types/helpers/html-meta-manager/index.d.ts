/**
 * Copyright (c) IBM, Corp. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
interface ImageMetaOptions {
    url: string;
    alt?: string;
    width?: string;
    height?: string;
}
export interface MetaOptions {
    title?: string;
    titleTemplate?: string | null;
    description?: string | null;
    image?: ImageMetaOptions | null;
    url?: string;
}
export declare const updateMeta: (options: MetaOptions) => void;
export {};
