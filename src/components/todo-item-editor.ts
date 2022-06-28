import {LitElement, html, css} from "lit";
import {customElement, property, query} from "lit/decorators.js";
import "./textarea-autosize";

@customElement("todo-item-editor")
export class TodoItemEditor extends LitElement {

    static styles =
        css`
            dialog {
                border: 0 none white;
                padding: 10px;
                margin: 0;
                outline: none;
                background-color: #D0D0D0;
                left: 0;
                right: 0;
                top: 30px;
                width: 100%;
                bottom: auto;
                max-width: 100%;
                
      }
            
            dialog::backdrop {
                background: rgba(255,0,0,.25);
            }
    `;


    @property({type: String})
    label = '';
    @property({type: Boolean})
    repeated = false;

    @query('dialog')
    dialog!: HTMLDialogElement;

    closeHandler(e: CloseEvent) {
        console.log(e, this.label)
        this.dispatchEvent(
            new CustomEvent("close", {
                bubbles: true,
                composed: true,
                detail: { label: this.label, repeated: this.repeated },
            })
        );
    }

    override render() {
        return html`
            <dialog @close=${this.closeHandler}>
                 <form method="dialog">
                    <textarea-autosize @value-changed=${(e: CustomEvent) => this.label=e.detail.value} .value=${this.label}></textarea-autosize>
                     <div @click=${() => {this.repeated = !this.repeated;}}>${ this.repeated ? 'Repeat after completed' : 'Add repeat' }</div>
                     <button>OK</button>
                </form>
            </dialog>`
    }

    editItem(label: string, repeated: boolean) {
        this.label = label;
        this.repeated = repeated;

        this.dialog.showModal()
    }
}
