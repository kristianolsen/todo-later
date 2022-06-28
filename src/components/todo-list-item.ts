/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { classMap } from "lit-html/directives/class-map.js";
import './todo-item-editor';
import {TodoItemEditor} from "./todo-item-editor";

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("todo-list-item")
export class TodoListItem extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
    }

    .item {
      color: black;
      height: auto;
      min-height: 40px;
      xline-height: 2;
      padding: 8px 20px;
      z-index: 2;
      vborder-bottom: 1px solid grey;
      position: relative;
      background: white;
      transition: background-color 1s;
    }

    #before {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      line-height: 40px;
      text-align: left;
      padding: 8px 20px;
    }

    .itemd:before {
      content: "\\2714";
      left: -100px;
    }

    .itemc.deleting:after {
      content: "\\2718 Delete";
      right: -100px;
    }

    .itemc:after {
      content: "\\21d2 Postpone";
      right: -100px;
    }

    .item:not(.completed):not(.completing) {
      vborder-bottom: 1px solid grey;
    }

    .item.completing {
      text-decoration: line-through;
      cbackground-color: green;
    }

    .item.completed {
      xopacity: 0.5;
      color: grey;
      text-decoration: line-through;
      xbackground-color: #323232;
    }

    .item.deleting {
      background-color: #323232;
    }

    .item svg {
      width: 15px;
      height: 15px;
    }
    .item svg:nth-child(2) {
      margin-left: 15px;
    }
    .item svg path {
      fill: white;
    }

    .itemx {
      background-color: #e3252c;
    }
  `;

  /**
   * The name to say "Hello" to.
   */
  @property({ type: String })
  label = "";

  @property({ type: Boolean, reflect: true })
  checked = false;
  @property({ type: Boolean, reflect: true })
  repeated = false;

  @state()
  private completing = false;
  @state()
  private deleting = false;

  private showEdit() {
      this.todoItemEditor.editItem(this.label, this.repeated);
  }

    @query('todo-item-editor')
    todoItemEditor!: TodoItemEditor;

    todoItemEditorCloseHandler(e: CustomEvent) {
        console.log(e);

        if (e.detail.label !== this.label) {
            this.label = e.detail.label;
            this.dispatchEvent(
                new CustomEvent("name-changed", {
                    bubbles: true,
                    composed: true,
                    detail: { name: this.label },
                })
            );
        }

        if (e.detail.repeated !== this.repeated) {
            this.repeated = e.detail.repeated;
            this.dispatchEvent(
                new CustomEvent("repeated-changed", {
                    bubbles: true,
                    composed: true,
                    detail: { repeated: this.repeated },
                })
            );
        }

    }

    override render() {
    const opacity = this.repeated ? "1.0" : "0.2";

    return html`
        <todo-item-editor @close=${this.todoItemEditorCloseHandler}></todo-item-editor>
      <div
        class="item overlay ${classMap({
          completing: this.completing,
          completed: this.checked,
          deleting: this.deleting,
        })}"
      >
       <span @click=${() => (this.showEdit())}>
              ${this.label}</span
            > 

        <span
          @click=${() => {
            this.repeated = !this.repeated;
            this.dispatchEvent(
              new CustomEvent("repeated-changed", {
                bubbles: true,
                composed: true,
                detail: { repeated: this.repeated },
              })
            );
          }}
          style="float: right; opacity: ${opacity}; margin-right: 28px;"
          >&#128257;</span
        >
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "todo-list-item": TodoListItem;
  }
}
