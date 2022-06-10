/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { LitElement, nothing } from 'lit';
import './todo-list-item';
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
export declare class TodoList extends LitElement {
    static styles: import("lit").CSSResult;
    /**
     * The name to say "Hello" to.
     */
    name: string;
    /**
     * The number of times the button has been clicked.
     */
    list: List | undefined;
    private addingItem;
    private editingName;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    private newItemNameInput;
    private listNameInput;
    private addItem;
    private updateName;
    private sortable?;
    firstUpdated(): void;
    private checkUpdated;
    private toggleLater;
    private dispatchDelete;
    private itemNameChanged;
    private repeatedChanged;
}
declare global {
    interface HTMLElementTagNameMap {
        'todo-list': TodoList;
    }
}
