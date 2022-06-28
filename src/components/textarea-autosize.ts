import {LitElement, html, css} from "lit";
import {customElement, property, query} from "lit/decorators.js";

@customElement("textarea-autosize")
export class TextareaAutosize extends LitElement {
    static styles =
        css`
            :host {
                display: block;
            }
            
            textarea {
        resize: none;
                border: 0 none white;
                overflow: hidden;
                padding: 0;
                outline: none;
                background-color: #D0D0D0;
      }
    `;

    @query('textarea')
    textarea!: HTMLTextAreaElement;

    focus() {
        this.textarea.focus();
    }

    @property({ type: String })
    placeholder = '';
    @property({ type: Number })
    rows = 2;
    @property({ type: Number })
    maxRows = 7;
    @property({ type: String })
    value = '';

    inputHandler(event: InputEvent) {
        this.textarea.style.height = 'auto';
        this.textarea.style.height = this.textarea.scrollHeight + 'px';
        if (event.target !== null) {
            const target = event.target as HTMLTextAreaElement;
            this.value = target.value;
            this.dispatchEvent(
                new CustomEvent('value-changed', {
                    bubbles: true,
                    composed: true,
                    detail: { value: target.value },
                }),
            );
        }
    }

    override render() {
        return html`
        <textarea
          .max-rows="${this.maxRows}"
          .rows="${this.rows}"
          placeholder="${this.placeholder}"
          name="text"
          id="text"
          @input=${this.inputHandler}
          .value="${this.value}"
          enterkeyhint="Done"
        >
        </textarea>
      `
    }
}
