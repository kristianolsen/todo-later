import type { Meta, Story } from "@storybook/web-components";
import { html } from "lit-html";
import "./todo-list-item";
import type { TodoListItem } from "./todo-list-item";

export default {
  title: "Components/Todo List Item",
  component: "todo-list",
  parameters: {
    actions: {
      handles: ['value-changed'],
    },
  },
} as Meta;

const Template: Story<TodoListItem> = ({
  label,
  checked,
  edit,
  repeated,
}) => html`<todo-list-item
  .label=${label}
  ?checked=${checked}
  ?edit=${edit}
  ?repeated=${repeated}
></todo-list-item>`;

export const Default = Template.bind({});
Default.args = {
  label: "Sample item",
  checked: false,
  edit: false,
};
export const Checked = Template.bind({});
Checked.args = {
  label: "Sample item",
  checked: true,
  edit: false,
};
export const Edit = Template.bind({});
Edit.args = {
  label: "Sample item",
  checked: false,
  edit: true,
};
