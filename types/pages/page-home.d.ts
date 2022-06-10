/**
 * Copyright (c) IBM, Corp. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { PageElement } from '../helpers/page-element.js';
import '../components/todo-list';
export declare class PageHome extends PageElement {
    static styles: import("lit").CSSResult;
    private data;
    private get filteredLists();
    private renderLists;
    private showNow;
    private addingList;
    render(): import("lit-html").TemplateResult<1>;
    private newListNameInput;
    private addList;
    private addItem;
    private saveData;
    meta(): {
        title: string;
        titleTemplate: null;
        description: string;
    };
    private checkedUpdated;
    private laterUpdated;
    private deleteItem;
    private listNameChanged;
    private itemNameChanged;
    private itemRepeatedChanged;
    private checkList;
}
