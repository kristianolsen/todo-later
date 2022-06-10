/**
 * Copyright (c) IBM, Corp. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { PageElementNotFound } from '../helpers/page-element-not-found.js';
export declare class PageNotFound extends PageElementNotFound {
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
    meta(): {
        title: string;
        description: null;
        image: null;
    };
}
