/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { List } from "./todo-list";
import "./todo-list";
import {nanoid} from "nanoid";
import produce from "immer";



/**
 * An example element.
 *
 */
@customElement("todo-list-of-lists")
export class TodoListOfLists extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 0;
    }
    section {
        padding: 1rem;
    }

    h1 {
        padding: 1rem;
       
    }
    
    .header {
        display: flex; 
        justify-content: space-between;
        position: sticky;
        left: 0;
        right: 0;
        top: 0;
        z-index: 100;
        background-color: wheat;
        
    }
  `;


  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Object })
  lists: List[] | undefined;

    @state()
    private showNow = true;

    @state()
    private addingList = false;

    private get filteredLists(): List[] {
        if (this.lists === undefined) return [];
        return this.lists.map((l) => {
            return {
                ...l,
                items: l.items.filter((i) => i.later === !this.showNow),
            };
        });
    }
    
    private renderLists() {
        return this.filteredLists.map(
            (list) => html`
        <todo-list
          .list=${list}
          @item-added=${(e: CustomEvent) =>
                this.addItem(list.id, e.detail.name)}
          @checked-updated=${(e: CustomEvent) =>
                this.checkedUpdated(list.id, e.detail.id, e.detail.checked)}
          @later-updated=${(e: CustomEvent) =>
                this.laterUpdated(list.id, e.detail.id, e.detail.later)}
          @delete=${(e: CustomEvent) => this.deleteItem(list.id, e.detail.id)}
          @reorder=${(e: CustomEvent) => this.reorderItem(list.id, e.detail.originalIndex, e.detail.spliceIndex)}
          @item-name-changed=${(e: CustomEvent) =>
                this.itemNameChanged(list.id, e.detail.id, e.detail.name)}
          @item-repeated-changed=${(e: CustomEvent) =>
                this.itemRepeatedChanged(list.id, e.detail.id, e.detail.repeated)}
          @name-changed=${(e: CustomEvent) =>
                this.listNameChanged(list.id, e.detail.name)}
        ></todo-list>
      `
        );
    }



    override render() {
        return html`
      <div class="header" >
        <h1 @click=${() => (this.showNow = !this.showNow)}>
          Todo ${this.showNow ? html`Now` : html`Later`}
        </h1>
        ${this.addingList
            ? nothing
            : html`<h1
              style="float: right; margin-right: 15px"
              @click=${() => (this.addingList = true)}
            >
              <svg
                class="svg-icon"
                style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M288 128C235.328 128 192 171.328 192 224v576c0 52.672 43.328 96 96 96h208.768a288 288 0 0 0 239.232 128c158.72 0 288-129.28 288-288 0-124.864-80.512-230.592-192-270.4V338.752L621.248 128H288z m0 64H576v192h192v67.2c-10.624-1.152-21.056-3.2-32-3.2-10.944 0-21.376 2.048-32 3.2V448H448v64h109.248a289.92 289.92 0 0 0-60.48 64H448v64h17.6A284.352 284.352 0 0 0 448 736c0 33.792 6.848 65.856 17.6 96H288a31.552 31.552 0 0 1-32-32v-576c0-17.984 14.016-32 32-32z m352 45.248L722.752 320H640V237.248zM320 448v64h64V448H320z m416 64c124.096 0 224 99.904 224 224S860.096 960 736 960A223.488 223.488 0 0 1 512 736C512 611.904 611.904 512 736 512zM320 576v64h64V576H320z m384 0v128H576v64h128v128h64v-128h128v-64h-128V576h-64z"
                  fill=""
                />
              </svg>
            </h1>`}
      </div>

      ${this.addingList
            ? html` <div style="display: flex;">
            
            <input
              style="flex: 1; font-family: sans-serif; font-size: 24px; font-weight: 500; padding: 10px;"
              id="newListName"
            />
            <button @click=${() => (this.addingList = false)}>Cancel</button
            ><button @click=${this.addList}>Add list</button>
          </div>`
            : nothing}
      ${this.renderLists()}
    `;
    }

    @query("#newListName")
    private newListNameInput: HTMLInputElement | undefined;

    private async addList() {
            this.lists = produce(this.lists, draft => {
                if (this.newListNameInput && draft) {
                    const n = this.newListNameInput.value;
                    draft.push({id: nanoid(), name: n, items: []});
                this.newListNameInput.value = "";

                }    });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: {lists: this.lists},
            })
        );

        this.addingList = false;
    }

    private async checkedUpdated(listId: string, id: string, checked: boolean) {
        if (this.lists === undefined) return;
        this.lists = produce(this.lists, draft => {
            const list = draft.find((l) => l.id === listId);
            if (list !== undefined) {
                const item = list.items.find((i) => i.id === id);
                if (item !== undefined) {
                    item.checked = checked;

                }
            }
        });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: {lists: this.lists},
            })
        );
    }

    private async laterUpdated(listId: string, id: string, later: boolean) {
        if (this.lists === undefined) return;
        this.lists = produce(this.lists, draft => {
            const list = draft.find((l) => l.id === listId);
            if (list !== undefined) {
                const item = list.items.find((i) => i.id === id);
                if (item !== undefined) {
                    item.later = later;

                }
            }
        });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: {lists: this.lists},
            })
        );
    }
    private async deleteItem(listId: string, id: string) {
        if (this.lists === undefined) return;
        this.lists = produce(this.lists, draft => {
            const list = draft.find((l) => l.id === listId);
            if (list !== undefined) {
                list.items = list.items.filter((i) => i.id !== id);

            }
        });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: {lists: this.lists},
            })
        );
    }

    private async listNameChanged(listId: string, name: string) {
        if (this.lists === undefined) return;
        this.lists = produce(this.lists, draft => {
            const list = draft.find((l) => l.id === listId);
            if (list !== undefined) {
                list.name = name;

            }
        });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: {lists: this.lists},
            })
        );
    }

    private async itemNameChanged(listId: string, id: string, name: string) {
        if (this.lists === undefined) return;
        this.lists = produce(this.lists, draft => {
            const list = draft.find((l) => l.id === listId);
            if (list !== undefined) {
                const item = list.items.find((i) => i.id === id);
                if (item !== undefined) {
                    item.name = name;

                }
            }
        });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: {lists: this.lists},
            })
        );
    }
    private async itemRepeatedChanged(
        listId: string,
        id: string,
        repeated: boolean
    ) {
        if (this.lists === undefined) return;
        this.lists = produce(this.lists, draft => {
            const list = draft.find((l) => l.id === listId);
        if (list !== undefined) {
            const item = list.items.find((i) => i.id === id);
            if (item !== undefined) {
                item.repeated = repeated;

            }
        }
    });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: { lists: this.lists },
            })
        );
    }
    private async addItem(listId: string, name: string) {
        if (this.lists === undefined) return;
        this.lists = produce(this.lists, draft => {
            const list = draft.find((l) => l.id === listId);
            if (list !== undefined) {
                const newItem = {
                    id: nanoid(),
                    name: name,
                    checked: false,
                    later: !this.showNow,
                    repeated: false,
                };
                list.items = [newItem, ...list.items];

            }
        });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: { lists: this.lists },
            })
        );
    }

    private reorderItem(listId: string, originalIndex: number, spliceIndex: number) {
        if (this.lists === undefined) return;
        this.lists = produce(this.lists, draft => {
            const list = draft.find((l) => l.id === listId);
            if (list !== undefined) {
                const itemsArray = list.items;
                const movedItem = itemsArray[originalIndex];
                itemsArray.splice(originalIndex, 1); // Remove item from the previous position
                itemsArray.splice(spliceIndex, 0, movedItem); // Insert item in the new position

                list.items = itemsArray;
            }
        });
        this.dispatchEvent(
            new CustomEvent("lists-changed", {
                bubbles: true,
                composed: true,
                detail: {lists: this.lists},
            })
        );
    }
}

declare global {
  interface HTMLElementTagNameMap {
    "todo-list-of-lists": TodoListOfLists;
  }
}
