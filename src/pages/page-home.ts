/**
 * Copyright (c) IBM, Corp. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, css, nothing } from "lit";
import { customElement, query, state } from "lit/decorators.js";

import config from "../config.js";
import { PageElement } from "../helpers/page-element.js";
import { until } from "lit/directives/until.js";
import "../components/todo-list";
import { List } from "../components/todo-list";
import { nanoid } from "nanoid";

@customElement("page-home")
export class PageHome extends PageElement {
  static override styles = css`
    section {
      padding: 1rem;
    }

    h1 {
      padding: 1rem;
    }
  `;

  private data: { date: string; lists: List[] } | undefined;

  private get filteredLists(): List[] {
    if (this.data === undefined) return [];
    return this.data.lists.map((l) => {
      return {
        ...l,
        items: l.items.filter((i) => i.later === !this.showNow),
      };
    });
  }

  private renderLists() {
    if (this.data === undefined) {
      return nothing;
    }
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

  @state()
  private showNow = true;

  @state()
  private addingList = false;

  override render() {
    const content = fetch("https://todo-later.arriba.no/data.php")
      .then((r) => r.json())
      .then((r) => (this.data = r))
      .then(() => this.checkList())
      .then(() => this.renderLists());
    return html`
      <div style="display: flex; justify-content: space-between;">
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
      ${until(content, html`<span>Loading...</span>`)}
    `;
  }

  @query("#newListName")
  private newListNameInput: HTMLInputElement | undefined;

  private async addList() {
    if (this.newListNameInput && this.data) {
      const n = this.newListNameInput.value;
      this.data.lists.push({ id: nanoid(), name: n, items: [] });
      this.newListNameInput.value = "";
      await this.saveData();
    }
    this.addingList = false;
  }

  private async addItem(listId: string, name: string) {
    const list = this.data?.lists.find((l) => l.id === listId);
    if (list !== undefined) {
      const newItem = {
        id: nanoid(),
        name: name,
        checked: false,
        later: !this.showNow,
        repeated: false,
      };
      list.items = [newItem, ...list.items];
      await this.saveData();
    }
  }

  private async saveData() {
    try {
      const res = await fetch("https://todo-later.arriba.no/update.php", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(this.data),
      });
      console.log(res);
    } catch (res_1) {
      console.log(res_1);
    }
    this.requestUpdate();
  }

  override meta() {
    return {
      title: config.appName,
      titleTemplate: null,
      description: config.appDescription,
    };
  }

  private async checkedUpdated(listId: string, id: string, checked: boolean) {
    const list = this.data?.lists.find((l) => l.id === listId);
    if (list !== undefined) {
      const item = list.items.find((i) => i.id === id);
      if (item !== undefined) {
        item.checked = checked;
        await this.saveData();
      }
    }
  }

  private async laterUpdated(listId: string, id: string, later: boolean) {
    const list = this.data?.lists.find((l) => l.id === listId);
    if (list !== undefined) {
      const item = list.items.find((i) => i.id === id);
      if (item !== undefined) {
        item.later = later;
        await this.saveData();
      }
    }
  }
  private async deleteItem(listId: string, id: string) {
    const list = this.data?.lists.find((l) => l.id === listId);
    if (list !== undefined) {
      list.items = list.items.filter((i) => i.id !== id);
      await this.saveData();
    }
  }

  private async listNameChanged(listId: string, name: string) {
    const list = this.data?.lists.find((l) => l.id === listId);
    if (list !== undefined) {
      list.name = name;
      await this.saveData();
    }
  }

  private async itemNameChanged(listId: string, id: string, name: string) {
    const list = this.data?.lists.find((l) => l.id === listId);
    if (list !== undefined) {
      const item = list.items.find((i) => i.id === id);
      if (item !== undefined) {
        item.name = name;
        await this.saveData();
      }
    }
  }
  private async itemRepeatedChanged(
    listId: string,
    id: string,
    repeated: boolean
  ) {
    const list = this.data?.lists.find((l) => l.id === listId);
    if (list !== undefined) {
      const item = list.items.find((i) => i.id === id);
      if (item !== undefined) {
        item.repeated = repeated;
        await this.saveData();
      }
    }
  }

  private async checkList() {
    // TODO localtime?
    const now = new Date().toISOString().substring(0, 10);
    if (this.data) {
      console.log(now, this.data.date, now > this.data.date);

      if (now > this.data.date) {
        const updatedData = {
          date: now,
          lists: this.data.lists.map((list) => {
            return {
              ...list,
              items: list.items
                .filter((i) => !i.checked || i.repeated)
                .map((i) => {
                  return {
                    ...i,
                    later: false,
                    checked: false,
                  };
                }),
            };
          }),
        };

        this.data = updatedData;
        await this.saveData();
      }
    }
  }
}
