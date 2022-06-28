import type { Meta, Story } from "@storybook/web-components";
import { html } from "lit-html";
import "./textarea-autosize";
import type { TextareaAutosize } from "./textarea-autosize";

export default {
    title: "Components/Textarea Autosize",
    component: "textarea-autosize",
    parameters: {
        actions: {
            handles: ['value-changed'],
        },
    },
} as Meta;

const Template: Story<TextareaAutosize> = ({
                                              placeholder,
                                               rows,
                                               maxRows,
                                               value,
                                       }) => html`<textarea-autosize
  .placeholder=${placeholder}
  .rows=${rows}
  .maxRows=${maxRows}
  .value=${value}
></textarea-autosize>`;

export const Default = Template.bind({});
Default.args = {
    value: 'Test',
    rows: 2,
    maxRows: 7,
};
