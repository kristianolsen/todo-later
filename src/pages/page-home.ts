/**
 * Copyright (c) IBM, Corp. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, css  } from "lit";
import { customElement, state } from "lit/decorators.js";

import config from "../config.js";
import { PageElement } from "../helpers/page-element.js";
import "../components/todo-list-of-lists";
import {List} from "../components/todo-list";


@customElement("page-home")
export class PageHome extends PageElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @state()
  private data: { date: string; lists: List[] } | undefined;



  constructor() {
    super();
   this.fetchData();

  }


  private fetchData() {
    return fetch("https://todo-later.arriba.no/data.php")
        .then((r) => r.json())
        .then((r) => (this.data = r))
        .then(() => this.checkList())
        .then(() => console.log(this.data));
  }


  override render() {
    return html`
      <todo-list-of-lists .lists=${this.data?.lists}
      @lists-changed=${this.listsChanged}
      ></todo-list-of-lists>
    `;
  }

  private async listsChanged(event: CustomEvent) {
    const lists = event.detail.lists;
    if (this.data !== undefined) {
      this.data = {
        ...this.data,
        lists: lists,
      };
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
    // TODO this.requestUpdate();
  }

  override meta() {
    return {
      title: config.appName,
      titleTemplate: null,
      description: config.appDescription,
    };
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
          }).filter((list) => list.items.length > 0),
        };

        this.data = updatedData;
        await this.saveData();
      }
    }
  }
}
