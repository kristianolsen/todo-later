import type { Meta, Story } from "@storybook/web-components";
import { html } from "lit-html";
import "./slip-list";
import type { SlipList } from "./slip-list";

export default {
    title: "Components/Slip List",
    component: "slip-list",
    parameters: {
        actions: {
            handles: ['value-changed'],
        },
    },
} as Meta;

const Template: Story<SlipList> = ({  }) => {
    return html`
        <style>
            /* these are special */
            .slip-reordering {
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
            }

            .slip-swiping-container {
                overflow-x: hidden;
            }

            div {
                user-select: none;
                -moz-user-select: none;
                -webkit-user-select: none;
                cursor: default;
            }

            slip-list {
                clear: left;
                margin: 1em;
                padding: 0 0 1px;
            }

            slip-list div {
                display: block;
                position: relative;
                border: 1px solid black;
                background: white;
                margin: 0;
                padding: 0 1em;
                border-radius: 3px;
                margin-bottom: -1px;
                max-width: 100%;
                line-height: 3;
                vertical-align: middle;
            }
        </style>
        <slip-list
                @slip-reorder=${(e: CustomEvent) => {
                    if (e.target !== null) {
                        const t = e.target as HTMLElement;
                        console.log(t)
                        if (t.parentNode !== null)
                        {
                            console.log(t.parentNode)
                            console.log(e.detail.insertBefore)
                            t.parentNode.insertBefore(t, e.detail.insertBefore);
                        }
                        
                    }
                }}

        >
            <div class="demo-no-reorder">Swipe,</div>
            <div class="demo-no-swipe">hold &amp; reorder <span class="instant">or instantly</span></div>
            <div>or either</div>
            <div class="demo-no-swipe demo-no-reorder">or none of them.</div>
            <div>Can play nicely with:</div>
            <div>interaction <input type="range"></div>
            <div style="transform: scaleX(0.97) skewX(-10deg); -webkit-transform: scaleX(0.97) skewX(-10deg)">inline CSS
                transforms
            </div>
            <div class="skewed">stylesheet transforms</div>
            <div class="demo-allow-select"><span class="demo-no-reorder">and selectable text, even though animating elements with selected text is a bit weird.</span>
            </div>
            <div>iOS Safari</div>
            <div>Mobile Chrome</div>
            <div>Android Firefox</div>
            <div>Opera Presto and Blink</div>
            <div>No dependencies</div>

        </slip-list>`;
};

export const Default = Template.bind({});
Default.args = {
    
};
