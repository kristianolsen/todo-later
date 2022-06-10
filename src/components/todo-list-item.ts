/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement, property, state, query} from 'lit/decorators.js';
import {classMap} from "lit-html/directives/class-map.js";
import {styleMap} from "lit-html/directives/style-map.js";

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('todo-list-item')
export class TodoListItem extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
      
    }
    
    
    
    
     .item{
       color: #fff; width: 100%; height: auto; min-height: 40px; line-height: 2; position: relative; padding: 8px 20px; height: auto; transition: background-color 1s;
    }

    .item:before, .item:after {
      position: absolute;
      top: 0;
      width: 100px;
      height: 40px;
      line-height: 40px;
      text-align: center;
    }

    .item:before {
      content: "\\2714";
      left: -100px;
    }

   
    .item.deleting:after {
      content: "\\2718 Delete";
      right: -100px;
    }

    .item:after {
      content: "\\21d2 Postpone";
      right: -100px;
    }

    .item:not(.completed):not(.completing) {
      border-bottom: 2px solid #d44a29;
    }

    .item.completing { text-decoration: line-through; background-color: green; }

    .item.completed { opacity: 0.5; text-decoration: line-through; background-color: #323232; }

    .item.completed:before { content: ""; }

    .item.deleting { background-color: #323232; }


    .item svg{
      width: 15px;
      height: 15px;
    }
     .item svg:nth-child(2){
      margin-left: 15px;
    }
      .item svg path{
      fill: white;
    }

    .item { background-color: #e3252c; }
    
    
      .item .overlay{
      position: absolute;
      top: 0;
      left: 0;
        right: 0;
        bottom: 0;
      background: #2f3d9a;
      transition: all 0.5s;
    }
  `;

  constructor() {
    super();
    // this.addEventListener('click', this._handleClick);

   // this.addEventListener('mousedown', (e) => this.handleMouseDown(e));
   // this.addEventListener('mousemove', (e) => this.handleMouseMove(e));

  }

  /**
   * The name to say "Hello" to.
   */
  @property({ type: String })
  label = '';

  @property({ type: Boolean, reflect: true })
  checked = false;
  @property({ type: Boolean, reflect: true })
  repeated = false;

  @property({ type: Boolean, reflect: true })
  edit = false;
  @property({ type: Boolean, reflect: true })
  swipe = true;


  isSwiping = false;
  mouseOrigin = 0;


  startSwipe(evt: PointerEvent){
    console.log('startSwipe', evt);

    this.mouseOrigin = evt.screenX;
    this.isSwiping = true;
  }

  @property({ type: Boolean })
  private completing = false;
  @state()
  private deleting = false;
  @state()
  private postponing = false;
  @state()
  private marginOffset = 0;

  private dragged = false;

  endSwipe(evt: PointerEvent){

    console.log('endSwipe', evt);

    if( this.completing ){
      this.completing = false;
      this.checked = !this.checked;
      this.dispatchEvent(new CustomEvent('checked-updated', { bubbles: true, composed: true, detail: {checked: this.checked  }}))
    }
    else if( this.deleting ){
      this.deleting = false;
      this.dispatchEvent(new CustomEvent('delete', { bubbles: true, composed: true }))
    } else if( this.postponing ){
      this.postponing = false;
      this.dispatchEvent(new CustomEvent('postpone', { bubbles: true, composed: true }))
    } else if (!this.dragged) {
      console.log('clicked')
    }

    this.mouseOrigin = 0;
    this.isSwiping = false;
    this.marginOffset = 0;
    this.dragged = false;
    this.requestUpdate();
  }

  //DETECTMOUSE
   detectMouse(evt: PointerEvent){
     const swipeMargin = 20;
     const currentMousePosition = evt.screenX;
     const swipeDirection = this.mouseOrigin - currentMousePosition > 0 ? 'left' : 'right';
    const swipeDifference = Math.abs(this.mouseOrigin - currentMousePosition)
     if (this.isSwiping)
       console.log('detectMouse',swipeDirection, swipeDifference, evt);

     if(this.isSwiping && (swipeDifference > swipeMargin) ){
      if( (swipeDifference-swipeMargin) <= swipeMargin ){
        //no change, allows user to take no action
        this.completing = false;
        this.deleting = false;
        this.postponing = false;
        this.marginOffset = 0;
      }
      else if( swipeDirection === 'left' ){
        //swipe left
        console.log('swipe left',swipeDifference, evt);
        this.completing = false;
        this.deleting = swipeDifference > 150;
        this.postponing = swipeDifference <= 150;
        this.marginOffset = -swipeDifference;
        this.dragged = true;
      }
      else if( swipeDirection === 'right' ){
        console.log('swipe right',swipeDifference, evt);
        //swip right");
        this.deleting = false;
        this.postponing = false;
        this.completing = true;
        this.marginOffset = swipeDifference;
        this.dragged = true;
      }
      this.requestUpdate();
    }
  }

  @state()
  private editingName = false;


  @query('#itemName')
  private itemNameInput: HTMLInputElement | undefined;

  private async updateName() {
    if (this.itemNameInput) {
      const n = this.itemNameInput.value;
      console.log(n)
      this.dispatchEvent(new CustomEvent('name-changed', { bubbles: true, composed: true, detail: {name: n }}))
    }
    this.editingName = false;
  }

  override render() {
    console.log('render');
    if (this.edit && this.label==='x') {
      return html`edit<input value="${this.label}">
          `;
    } else if (this.swipe) {

      const opacity = this.repeated ? "1.0" : "0.2";

      return html`
        <div class="item ${classMap({ completing: this.completing,completed: this.checked, deleting: this.deleting })}" style="${styleMap({marginLeft: this.marginOffset + "px"})}" @pointerdown=${this.startSwipe} @pointermove=${this.detectMouse} @pointerup=${this.endSwipe}>
          ${
              this.editingName ? html`
            <input id="itemName" .value=${this.label}>
            <button @click=${() => this.editingName = false}>Cancel</button><button @click=${this.updateName}>OK</button>
          ` : html`<span @click=${() => this.editingName = true}>${this.label}</span>
          `

          }

          <span @click=${() => {
            this.repeated = !this.repeated;
            this.dispatchEvent(new CustomEvent('repeated-changed', { bubbles: true, composed: true, detail: {repeated: this.repeated }}))
          }} style="float: right; opacity: ${opacity}; margin-right: 28px;">&#128257;</span>
        </div>`;


    } else {
      return html`
         ${this.label} <span style="float: right">X</span>
          `;
    }
  }


}

declare global {
  interface HTMLElementTagNameMap {
    'todo-list-item': TodoListItem;
  }
}
