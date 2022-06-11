/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import Sortable from "sortablejs";
import "./todo-list-item";

export interface List {
  id: string;
  name: string;
  items: ListItem[];
}
export interface ListItem {
  id: string;
  name: string;
  checked: boolean;
  later: boolean;
  repeated: boolean;
}

/**
 * An example element.
 *
 */
@customElement("todo-list")
export class TodoList extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 0;

      xbackground: #24292e;
      font-family: serif;
      line-height: 1.15;
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: transparent;
    }

    .list-group-item:first-child {
      border-top-left-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
    }
    .list-group-item {
      position: relative;
      display: block;
      padding: 0.75rem 1.25rem;
      margin-bottom: -1px;
      background-color: #fff;
      border: 1px solid rgba(0, 0, 0, 0.125);
    }

    .col {
      padding-right: 0;
      margin-right: 15px;
    }
    .list-group {
      display: -ms-flexbox;
      display: flex;
      -ms-flex-direction: column;
      flex-direction: column;
      padding-left: 0;
      margin-bottom: 0;
    }
    .col {
      -ms-flex-preferred-size: 0;
      flex-basis: 0;
      -ms-flex-positive: 1;
      flex-grow: 1;
      max-width: 100%;
    }
    .col,
    .col-1,
    .col-10,
    .col-11,
    .col-12,
    .col-2,
    .col-3,
    .col-4,
    .col-5,
    .col-6,
    .col-7,
    .col-8,
    .col-9,
    .col-auto,
    .col-lg,
    .col-lg-1,
    .col-lg-10,
    .col-lg-11,
    .col-lg-12,
    .col-lg-2,
    .col-lg-3,
    .col-lg-4,
    .col-lg-5,
    .col-lg-6,
    .col-lg-7,
    .col-lg-8,
    .col-lg-9,
    .col-lg-auto,
    .col-md,
    .col-md-1,
    .col-md-10,
    .col-md-11,
    .col-md-12,
    .col-md-2,
    .col-md-3,
    .col-md-4,
    .col-md-5,
    .col-md-6,
    .col-md-7,
    .col-md-8,
    .col-md-9,
    .col-md-auto,
    .col-sm,
    .col-sm-1,
    .col-sm-10,
    .col-sm-11,
    .col-sm-12,
    .col-sm-2,
    .col-sm-3,
    .col-sm-4,
    .col-sm-5,
    .col-sm-6,
    .col-sm-7,
    .col-sm-8,
    .col-sm-9,
    .col-sm-auto,
    .col-xl,
    .col-xl-1,
    .col-xl-10,
    .col-xl-11,
    .col-xl-12,
    .col-xl-2,
    .col-xl-3,
    .col-xl-4,
    .col-xl-5,
    .col-xl-6,
    .col-xl-7,
    .col-xl-8,
    .col-xl-9,
    .col-xl-auto {
      position: relative;
      width: 100%;
      padding-right: 15px;
      padding-left: 15px;
    }

    .row {
      display: -ms-flexbox;
      display: flex;
      -ms-flex-wrap: wrap;
      flex-wrap: wrap;
      margin-right: -15px;
      margin-left: -15px;
    }
    *,
    ::after,
    ::before {
      box-sizing: border-box;
    }

    .col-12 {
      -ms-flex: 0 0 100%;
      flex: 0 0 100%;
      max-width: 100%;
    }
    .col,
    .col-1,
    .col-10,
    .col-11,
    .col-12,
    .col-2,
    .col-3,
    .col-4,
    .col-5,
    .col-6,
    .col-7,
    .col-8,
    .col-9,
    .col-auto,
    .col-lg,
    .col-lg-1,
    .col-lg-10,
    .col-lg-11,
    .col-lg-12,
    .col-lg-2,
    .col-lg-3,
    .col-lg-4,
    .col-lg-5,
    .col-lg-6,
    .col-lg-7,
    .col-lg-8,
    .col-lg-9,
    .col-lg-auto,
    .col-md,
    .col-md-1,
    .col-md-10,
    .col-md-11,
    .col-md-12,
    .col-md-2,
    .col-md-3,
    .col-md-4,
    .col-md-5,
    .col-md-6,
    .col-md-7,
    .col-md-8,
    .col-md-9,
    .col-md-auto,
    .col-sm,
    .col-sm-1,
    .col-sm-10,
    .col-sm-11,
    .col-sm-12,
    .col-sm-2,
    .col-sm-3,
    .col-sm-4,
    .col-sm-5,
    .col-sm-6,
    .col-sm-7,
    .col-sm-8,
    .col-sm-9,
    .col-sm-auto,
    .col-xl,
    .col-xl-1,
    .col-xl-10,
    .col-xl-11,
    .col-xl-12,
    .col-xl-2,
    .col-xl-3,
    .col-xl-4,
    .col-xl-5,
    .col-xl-6,
    .col-xl-7,
    .col-xl-8,
    .col-xl-9,
    .col-xl-auto {
      position: relative;
      width: 100%;
      padding-right: 15px;
      padding-left: 15px;
    }

    h4 {
      padding-bottom: 10px;
    }
    .h1,
    .h2,
    .h3,
    .h4,
    .h5,
    .h6,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-bottom: -0.5rem;
      font-family: inherit;
      font-weight: 500;
      line-height: 1.2;
      color: inherit;
    }
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 0;
      margin-bottom: -0.5rem;
    }
    *,
    ::after,
    ::before {
      box-sizing: border-box;
    }

    .h4,
    h4 {
      font-size: 1.5rem;
      acolor: white;
        
    }

    .blue-background-class {
      background-color: #c8ebfb;
    }
  `;

  /**
   * The name to say "Hello" to.
   */
  @property()
  name = "World";

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Object })
  list: List | undefined;

  @state()
  private addingItem = false;

  @state()
  private editingName = false;

  override render() {
    return this.list === undefined
      ? nothing
      : html`
          <div
            style="padding: 18px; display: flex; justify-content: space-between; border-bottom: 2px solid grey; margin-bottom: 8px;"
          >
            ${this.editingName
              ? html`
                  <div>
                    <input id="listName" .value=${this.list.name} />
                    <button @click=${() => (this.editingName = false)}>
                      Cancel</button
                    ><button @click=${this.updateName}>OK</button>
                  </div>
                `
              : html`<h4
                  style="flex: 1"
                  @click=${() => (this.editingName = true)}
                >
                  ${this.list.name}
                </h4> `}
            ${this.addingItem
              ? nothing
              : html`<div @click=${() => (this.addingItem = true)}>
                  <svg
                    class="svg-icon"
                    style="width: 2em; height: 2em;vertical-align: middle;fill: white;overflow: hidden;"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M480 64A416.64 416.64 0 0 0 64 480 416.64 416.64 0 0 0 480 896 416.64 416.64 0 0 0 896 480 416.64 416.64 0 0 0 480 64z m0 64C674.752 128 832 285.248 832 480S674.752 832 480 832A351.552 351.552 0 0 1 128 480C128 285.248 285.248 128 480 128zM448 320v128H320v64h128v128h64V512h128V448H512V320z"
                      fill=""
                    />
                  </svg>
                </div>`}
          </div>

          ${this.addingItem
            ? html` <div style="display: flex;">
                <input
                  style="flex: 1; font-family: sans-serif; font-size: 18px; font-weight: 500; padding: 10px;"
                  id="newItemName"
                />
                <button @click=${() => (this.addingItem = false)}>Cancel</button
                ><button @click=${this.addItem}>Add</button>
              </div>`
            : nothing}

            <div id="example1">
              ${this.list.items.map(
                (item) => html`<todo-list-item
                  @name-changed=${(e: CustomEvent) => {
                    e.stopPropagation();
                    this.itemNameChanged(item, e.detail.name);
                  }}
                  @repeated-changed=${(e: CustomEvent) => {
                    e.stopPropagation();
                    this.repeatedChanged(item, e.detail.repeated);
                  }}
                  @checked-updated=${(e: CustomEvent) =>
                    this.checkUpdated(item, e.detail.checked)}
                  @postpone=${() => this.toggleLater(item)}
                  @delete=${() => this.dispatchDelete(item)}
                  ?checked=${item.checked}
                  ?repeated=${item.repeated}
                  label="${item.name}"
                ></todo-list-item>`
              )}
          
          </div>
        `;
  }

  @query("#newItemName")
  private newItemNameInput: HTMLInputElement | undefined;
  @query("#listName")
  private listNameInput: HTMLInputElement | undefined;

  private async addItem() {
    if (this.newItemNameInput) {
      const n = this.newItemNameInput.value;
      this.dispatchEvent(
        new CustomEvent("item-added", {
          bubbles: true,
          composed: true,
          detail: { name: n },
        })
      );
    }
    this.addingItem = false;
  }

  private async updateName() {
    if (this.listNameInput) {
      const n = this.listNameInput.value;
      console.log(n);
      this.dispatchEvent(
        new CustomEvent("name-changed", {
          bubbles: true,
          composed: true,
          detail: { name: n },
        })
      );
    }
    this.editingName = false;
  }

  private sortable?: Sortable;

  override firstUpdated() {
    if ("getElementById" in this.renderRoot) {
      const s = this.renderRoot.getElementById("example1");
      if (s === null) {
        throw new Error("Illegal state, list is null");
      }
      /*
      this.sortable = Sortable.create(s, {
        animation: 150,
        ghostClass: 'blue-background-class'
      });

       */
      console.log(this.sortable);
    }
  }

  private checkUpdated(item: ListItem, checked: boolean) {
    this.dispatchEvent(
      new CustomEvent("checked-updated", {
        bubbles: true,
        composed: true,
        detail: { id: item.id, checked: checked },
      })
    );
  }

  private toggleLater(item: ListItem) {
    this.dispatchEvent(
      new CustomEvent("later-updated", {
        bubbles: true,
        composed: true,
        detail: { id: item.id, later: !item.later },
      })
    );
  }
  private dispatchDelete(item: ListItem) {
    this.dispatchEvent(
      new CustomEvent("delete", {
        bubbles: true,
        composed: true,
        detail: { id: item.id },
      })
    );
  }

  private itemNameChanged(item: ListItem, name: string) {
    this.dispatchEvent(
      new CustomEvent("item-name-changed", {
        bubbles: true,
        composed: true,
        detail: { id: item.id, name: name },
      })
    );
  }

  private repeatedChanged(item: ListItem, repeated: boolean) {
    this.dispatchEvent(
      new CustomEvent("item-repeated-changed", {
        bubbles: true,
        composed: true,
        detail: { id: item.id, repeated: repeated },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "todo-list": TodoList;
  }
}
