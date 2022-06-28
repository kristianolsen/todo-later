import type { Meta, Story } from "@storybook/web-components";
import { html } from "lit-html";
import "./todo-item-editor";
import type { TodoItemEditor } from "./todo-item-editor";

export default {
    title: "Components/Todo Item Editor",
    component: "todo-item-editor",
    parameters: {
        actions: {
            handles: ['value-changed'],
        },
    },
} as Meta;

const Template: Story<TodoItemEditor> = ({
label, repeated
                                       }) => html`<todo-item-editor
 .label=${label}
 ?repeated=${repeated}
></todo-item-editor>
`;

export const Default = Template.bind({});
Default.args = {
label: 'Test',
    repeated: false

};
