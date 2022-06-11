/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css, nothing, svg } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { classMap } from "lit-html/directives/class-map.js";
import { styleMap } from "lit-html/directives/style-map.js";

// From https://www.veryicon.com/icons/miscellaneous/eva-icon-fill
const checkmarkIcon = svg`<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M853.333333 504.746667a42.666667 42.666667 0 0 0-42.666666 42.666666v237.653334a25.6 25.6 0 0 1-25.6 25.6H238.933333a25.6 25.6 0 0 1-25.6-25.6V238.933333a25.6 25.6 0 0 1 25.6-25.6h408.32a42.666667 42.666667 0 1 0 0-85.333333H238.933333A111.36 111.36 0 0 0 128 238.933333v546.133334A111.36 111.36 0 0 0 238.933333 896h546.133334a111.36 111.36 0 0 0 110.933333-110.933333v-237.653334a42.666667 42.666667 0 0 0-42.666667-42.666666z"  /><path d="M457.386667 469.333333a42.666667 42.666667 0 0 0-61.44 58.88l94.72 99.413334a42.666667 42.666667 0 0 0 30.72 13.226666 42.666667 42.666667 0 0 0 30.72-12.8l289.28-298.666666a42.666667 42.666667 0 1 0-61.44-59.733334l-258.133334 267.093334z"  /></svg>`;

const postponeIcon = svg`<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M887.04 483.84l-142.506667-285.013333A128 128 0 0 0 629.76 128H394.24a128 128 0 0 0-114.773333 70.826667l-142.506667 285.013333a85.333333 85.333333 0 0 0-8.96 38.4V768a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128v-245.76a85.333333 85.333333 0 0 0-8.96-38.4zM355.84 236.8a42.666667 42.666667 0 0 1 38.4-23.466667h235.52a42.666667 42.666667 0 0 1 38.4 23.466667L784.213333 469.333333H682.666667a42.666667 42.666667 0 0 0-42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-42.666667 42.666667h-170.666666a42.666667 42.666667 0 0 1-42.666667-42.666667v-85.333333a42.666667 42.666667 0 0 0-42.666667-42.666667H239.786667z"  /></svg>`;

const deleteIcon = svg`<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M896 256h-213.333333V184.746667A103.253333 103.253333 0 0 0 576 85.333333h-128A103.253333 103.253333 0 0 0 341.333333 184.746667V256H128a42.666667 42.666667 0 0 0 0 85.333333h42.666667v469.333334a128 128 0 0 0 128 128h426.666666a128 128 0 0 0 128-128V341.333333h42.666667a42.666667 42.666667 0 0 0 0-85.333333zM426.666667 682.666667a42.666667 42.666667 0 0 1-85.333334 0v-170.666667a42.666667 42.666667 0 0 1 85.333334 0z m0-497.92c0-6.826667 8.96-14.08 21.333333-14.08h128c12.373333 0 21.333333 7.253333 21.333333 14.08V256h-170.666666zM682.666667 682.666667a42.666667 42.666667 0 0 1-85.333334 0v-170.666667a42.666667 42.666667 0 0 1 85.333334 0z"  /></svg>`;

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
      line-height: 2;
      padding: 8px 20px;
      z-index: 2;
      border-bottom: 1px solid grey;
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
      border-bottom: 1px solid grey;
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
  label = "";

  @property({ type: Boolean, reflect: true })
  checked = false;
  @property({ type: Boolean, reflect: true })
  repeated = false;

  @property({ type: Boolean, reflect: true })
  edit = false;

  isSwiping = false;
  mouseOrigin = 0;

  startSwipe(evt: PointerEvent) {
    // console.log("startSwipe", evt);

    this.mouseOrigin = evt.screenX;
    this.isSwiping = true;
  }

  @state()
  private completing = false;
  @state()
  private deleting = false;
  @state()
  private postponing = false;
  @state()
  private marginOffset = 0;

  private dragged = false;

  private get currentAction() {
    switch (this.swipeDirection) {
      case "none":
        return undefined;
      case "left":
        if (this.swipeValue > 50) {
          return {
            color: "red",
            text: "Delete",
            icon: deleteIcon,
          };
        } else {
          return {
            color: "blue",
            text: "Postpone",
            icon: postponeIcon,
          };
        }
      case "right":
        return {
          color: "green",
          text: "Complete",
          icon: checkmarkIcon,
        };
    }
  }

  endSwipe() {
    // console.log("endSwipe", evt);

    if (this.completing) {
      this.completing = false;
      this.checked = !this.checked;
      this.dispatchEvent(
        new CustomEvent("checked-updated", {
          bubbles: true,
          composed: true,
          detail: { checked: this.checked },
        })
      );
    } else if (this.deleting) {
      this.deleting = false;
      this.dispatchEvent(
        new CustomEvent("delete", { bubbles: true, composed: true })
      );
    } else if (this.postponing) {
      this.postponing = false;
      this.dispatchEvent(
        new CustomEvent("postpone", { bubbles: true, composed: true })
      );
    } else if (!this.dragged) {
      //  console.log("clicked");
    }

    this.mouseOrigin = 0;
    this.isSwiping = false;
    this.marginOffset = 0;
    this.dragged = false;
    this.requestUpdate();
  }

  @property({ type: Number })
  swipeValue = 0;
  @property({ type: String })
  swipeDirection: "none" | "left" | "right" = "none";

  //DETECTMOUSE
  detectMouse(evt: PointerEvent) {
    const swipeMargin = 20;
    const currentMousePosition = evt.screenX;
    this.swipeDirection =
      this.mouseOrigin - currentMousePosition > 0 ? "left" : "right";
    const swipeDifference = Math.abs(this.mouseOrigin - currentMousePosition);
    if (this.isSwiping) {
      // console.log("detectMouse", this.swipeDirection, swipeDifference, evt, this.clientWidth);
      this.swipeValue = Math.floor((100 * swipeDifference) / this.clientWidth);
    }

    if (this.isSwiping && swipeDifference > swipeMargin) {
      if (swipeDifference - swipeMargin <= swipeMargin) {
        //no change, allows user to take no action
        this.completing = false;
        this.deleting = false;
        this.postponing = false;
        this.marginOffset = 0;
      } else if (this.swipeDirection === "left") {
        //swipe left
        //  console.log("swipe left", swipeDifference, evt);
        this.completing = false;
        this.deleting = this.swipeValue > 50;
        this.postponing = this.swipeValue <= 50;
        this.marginOffset = -swipeDifference;
        this.dragged = true;
      } else if (this.swipeDirection === "right") {
        //  console.log("swipe right", swipeDifference, evt);
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

  @query("#itemName")
  private itemNameInput: HTMLInputElement | undefined;

  private async updateName() {
    if (this.itemNameInput) {
      const n = this.itemNameInput.value;
      console.log(n);
      this.dispatchEvent(
        new CustomEvent("name-changed", {
          bubbles: true,
          composed: true,
          detail: { name: n },
        })
      );
    }
    this.edit = false;
  }

  private renderCurrentAction() {
    const action = this.currentAction;
    if (action === undefined) {
      return nothing;
    }
    let styleInfo = {
      background: action.color,
      textAlign: this.swipeDirection === "left" ? "right" : "left",
    };

    return html`<div id="before" style="${styleMap(styleInfo)}">
      ${this.swipeDirection === "left"
        ? html`${action.text} ${action.icon}`
        : html`${action.icon} ${action.text}`}
    </div>`;
  }

  override render() {
    const opacity = this.repeated ? "1.0" : "0.2";

    return html` ${this.renderCurrentAction()}
      <div
        class="item overlay ${classMap({
          completing: this.completing,
          completed: this.checked,
          deleting: this.deleting,
        })}"
        style="${styleMap({
          transform: "translate3d(" + this.marginOffset + "px, 0, 0)",
        })}"
        @pointerdown=${this.startSwipe}
        @pointermove=${this.detectMouse}
        @pointerup=${this.endSwipe}
      >
        ${this.edit
          ? html`
              <input id="itemName" .value=${this.label} />
              <button @click=${() => (this.edit = false)}>Cancel</button
              ><button @click=${this.updateName}>OK</button>
            `
          : html`<span @click=${() => (this.edit = true)}>
              ${this.label}</span
            > `}

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
