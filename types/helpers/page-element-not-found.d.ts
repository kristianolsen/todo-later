/**
 * Copyright (c) IBM, Corp. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { PageElement } from "./page-element.js";
export declare const pageNotFoundMeta: {
  title: string;
  description: null;
  image: null;
};
export declare class PageElementNotFound extends PageElement {
  connectedCallback(): void;
  disconnectedCallback(): void;
}
