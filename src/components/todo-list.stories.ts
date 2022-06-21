import type { Meta, Story } from "@storybook/web-components";
import { html } from "lit-html";
import "./todo-list";
import type { TodoList } from "./todo-list";

export default {
  title: "Components/Todo List",
  component: "todo-list",
  parameters: {
    actions: {
      handles: ['later-updated'],
    },
  },
} as Meta;

const Template: Story<TodoList> = ({ list }) => html`<todo-list
  .list=${list}
></todo-list>`;

export const Default = Template.bind({});
Default.args = {
  list: {
    id: "a",
    name: "Økonomi",
    items: [
      {
        id: "b",
        name: "Hesten",
        checked: false,
        later: false,
        repeated: false,
      },
      {
        id: "c",
        name: "Legetimer",
        checked: true,
        later: false,
        repeated: false,
      },
    ],
  },
};
