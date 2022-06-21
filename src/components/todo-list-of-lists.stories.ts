import type { Meta, Story } from "@storybook/web-components";
import { html } from "lit-html";
import "./todo-list-of-lists";
import type { TodoListOfLists } from "./todo-list-of-lists";

export default {
  title: "Components/Todo List Of Lists",
  component: "todo-list-of-lists",
} as Meta;

const Template: Story<TodoListOfLists> = ({ lists }) => html`<todo-list-of-lists
  .lists=${lists}
></todo-list-of-lists>`;

export const Default = Template.bind({});
Default.args = {
  lists: [{
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
  }],
};
