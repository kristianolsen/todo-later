/**
 * Copyright (c) IBM, Corp. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export declare const setMetaTag: (
  attributeName: string,
  attributeValue: string,
  content: string
) => void;
export declare const removeMetaTag: (
  attributeName: string,
  attributeValue: string
) => void;
export declare const setLinkTag: (rel: string, href: string) => void;
