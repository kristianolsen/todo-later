import type { Meta, Story } from "@storybook/web-components";
import { html } from "lit-html";
import "./todo-list-of-lists";
import type { TodoListOfLists } from "./todo-list-of-lists";

export default {
  title: "Components/Todo List Of Lists",
  component: "todo-list-of-lists",
  parameters: {
    actions: {
      handles: ['lists-changed'],
    },
  },
} as Meta;

function sampleList(name: string, itemCount: number) {
  const items = new Array(itemCount).fill(null).map((_, i) => {
    const n = i + 1;
    return {
      id: name.toLowerCase()+ "-" + n,
      name: "Sample " + n + " in " + name,
      checked: i % 3 === 0,
      later: false,
      repeated: false,
    };
  });
  return {
    id: name.toLowerCase(),
    name: name,
    items: items,
  }
}

const Template: Story<TodoListOfLists> = ({ lists }) => html`<todo-list-of-lists
  .lists=${lists}
></todo-list-of-lists>`;

export const Default = Template.bind({});
Default.args = {
  lists: [sampleList("Økonomi", 5), sampleList("Arbeid", 5)],
};
