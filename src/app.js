// src/app.js
// TodoIt – addTodo feature with LocalStorage persistence
// Clean, modular code following the guidelines in Architecture.md and rules.md

(() => {
  'use strict';

  /*** Constants ***/
  const STORAGE_KEY = 'todoit.todos';

  /*** State ***/
  const state = {
    todos: [] // each todo: { id, title, category, description }
  };

  /*** DOM References ***/
  const dom = {
    titleInput: document.getElementById('todo-title'),
    categorySelect: document.getElementById('todo-category'),
    descriptionInput: document.getElementById('todo-description'),
    addButton: document.getElementById('add-todo-btn'),
    lists: {
      todo: document.getElementById('list-todo'),
      inProgress: document.getElementById('list-inProgress'),
      done: document.getElementById('list-done')
    }
  };

  /*** LocalStorage Helpers ***/
  function loadTodos() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.todos = [];
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      // Ensure we have an array
      state.todos = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse todos from LocalStorage:', e);
      state.todos = [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
  }

  /*** UI Rendering ***/
  function clearLists() {
    Object.values(dom.lists).forEach(list => (list.innerHTML = ''));
  }

  function createTodoElement(todo) {
    const item = document.createElement('div');
    item.className = 'todo-item';
    item.dataset.id = todo.id;

    const title = document.createElement('strong');
    title.textContent = todo.title;
    item.appendChild(title);

    if (todo.description) {
      const desc = document.createElement('p');
      desc.textContent = todo.description;
      item.appendChild(desc);
    }

    // Delete button – optional but useful for testing
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '✕';
    delBtn.title = 'Delete';
    delBtn.addEventListener('click', () => removeTodo(todo.id));
    item.appendChild(delBtn);

    return item;
  }

  function renderTodos() {
    clearLists();
    state.todos.forEach(todo => {
      const container = dom.lists[todo.category];
      if (container) {
        container.appendChild(createTodoElement(todo));
      }
    });
  }

  /*** Core Feature – Add Todo ***/
  function getFormData() {
    return {
      title: dom.titleInput.value.trim(),
      category: dom.categorySelect.value,
      description: dom.descriptionInput.value.trim()
    };
  }

  function resetForm() {
    dom.titleInput.value = '';
    dom.descriptionInput.value = '';
    dom.categorySelect.value = 'todo';
  }

  function addTodo() {
    const { title, category, description } = getFormData();

    if (!title) {
      alert('Please enter a todo name.');
      return;
    }

    const newTodo = {
      id: Date.now().toString(),
      title,
      category,
      description
    };

    state.todos.push(newTodo);
    saveTodos();
    renderTodos();
    resetForm();
  }

  /*** Optional Helper – Remove Todo (kept for testing) ***/
  function removeTodo(id) {
    state.todos = state.todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
  }

  /*** Initialization ***/
  function init() {
    loadTodos();
    renderTodos();
    dom.addButton.addEventListener('click', addTodo);
  }

  // Run the app
  init();
})();
