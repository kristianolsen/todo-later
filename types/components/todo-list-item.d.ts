/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { LitElement } from "lit";
/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class TodoListItem extends LitElement {
  static styles: import("lit").CSSResult;
  constructor();
  /**
   * The name to say "Hello" to.
   */
  label: string;
  checked: boolean;
  repeated: boolean;
  edit: boolean;
  swipe: boolean;
  isSwiping: boolean;
  mouseOrigin: number;
  startSwipe(evt: PointerEvent): void;
  private completing;
  private deleting;
  private postponing;
  private marginOffset;
  private dragged;
  endSwipe(evt: PointerEvent): void;
  detectMouse(evt: PointerEvent): void;
  private editingName;
  private itemNameInput;
  private updateName;
  render(): import("lit-html").TemplateResult<1>;
}
declare global {
  interface HTMLElementTagNameMap {
    "todo-list-item": TodoListItem;
  }
}
