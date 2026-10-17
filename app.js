const STORAGE_KEY = "todo-app-items";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyTip = document.getElementById("empty-tip");
const counter = document.getElementById("counter");
const filters = document.getElementById("filters");
const clearBtn = document.getElementById("clear-completed");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  todos.unshift({ id: Date.now().toString(), text, completed: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function updateTodo(id, text) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.text = text;
  saveTodos();
  render();
}

function getVisibleTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.completed);
  if (currentFilter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;

  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = todo.text;
  span.title = "双击编辑";

  const delBtn = document.createElement("button");
  delBtn.className = "delete-btn";
  delBtn.textContent = "×";
  delBtn.title = "删除";

  li.append(checkbox, span, delBtn);
  return li;
}

function startEditing(li, id) {
  const span = li.querySelector(".todo-text");
  const editInput = document.createElement("input");
  editInput.className = "edit-input";
  editInput.value = span.textContent;
  editInput.maxLength = 100;
  span.replaceWith(editInput);
  editInput.focus();

  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    const text = editInput.value.trim();
    if (save && text) updateTodo(id, text);
    else if (save && !text) deleteTodo(id);
    else render();
  };

  editInput.addEventListener("blur", () => finish(true));
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
}

function render() {
  const visible = getVisibleTodos();
  list.replaceChildren(...visible.map(createTodoElement));

  emptyTip.classList.toggle("show", visible.length === 0);

  const activeCount = todos.filter((t) => !t.completed).length;
  counter.textContent = `${activeCount} 项未完成`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
});

list.addEventListener("click", (e) => {
  const li = e.target.closest(".todo-item");
  if (!li) return;
  if (e.target.matches('input[type="checkbox"]')) toggleTodo(li.dataset.id);
  if (e.target.matches(".delete-btn")) deleteTodo(li.dataset.id);
});

list.addEventListener("dblclick", (e) => {
  if (!e.target.matches(".todo-text")) return;
  const li = e.target.closest(".todo-item");
  startEditing(li, li.dataset.id);
});

filters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  filters.querySelectorAll(".filter").forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
});

document.getElementById("today").textContent = new Date().toLocaleDateString("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

render();
