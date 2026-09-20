// src/app.js
// TodoIt – addTodo feature with LocalStorage persistence, Back/Next navigation, and Edit functionality
// Clean, modular code following the guidelines in Architecture.md and rules.md

(() => {
  'use strict';

  /*** Constants ***/
  const STORAGE_KEY = 'todoit.todos';
  const STATUS_ORDER = ['todo', 'inProgress', 'done']; // order of columns
  const STATUS_COLORS = {
    todo: '#e0f7fa',        // light cyan
    inProgress: '#fff3e0', // light orange
    done: '#e8f5e9'        // light green
  };

  /*** State ***/
  const state = {
    /** each todo: { id, title, category, description } */
    todos: []
  };

  /*** DOM References ***/
  const dom = {
    titleInput: document.getElementById('todo-title'),
    categorySelect: document.getElementById('todo-category'),
    descriptionInput: document.getElementById('todo-description'),
    addButton: document.getElementById('add-todo-btn'),
    form: document.getElementById('todo-form'),
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
    item.className = `todo-item todo-${todo.category}`; // add status‑specific class
    item.dataset.id = todo.id;

    const title = document.createElement('strong');
    title.textContent = todo.title;
    item.appendChild(title);

    if (todo.description) {
      const desc = document.createElement('p');
      desc.textContent = todo.description;
      item.appendChild(desc);
    }

    // Back button (modern style)
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'nav-btn back-btn';
    backBtn.textContent = '←';
    backBtn.title = 'Back';
    backBtn.disabled = STATUS_ORDER.indexOf(todo.category) === 0;
    backBtn.addEventListener('click', () => moveTodo(todo.id, 'back'));
    item.appendChild(backBtn);

    // Next button (modern style)
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'nav-btn next-btn';
    nextBtn.textContent = '→';
    nextBtn.title = 'Next';
    nextBtn.disabled = STATUS_ORDER.indexOf(todo.category) === STATUS_ORDER.length - 1;
    nextBtn.addEventListener('click', () => moveTodo(todo.id, 'next'));
    item.appendChild(nextBtn);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✎';
    editBtn.title = 'Edit';
    editBtn.addEventListener('click', () => editTodo(todo.id));
    item.appendChild(editBtn);

    // Delete button – optional but useful for testing
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'delete-btn';
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

  /*** Navigation – Back / Next ***/
  function moveTodo(id, direction) {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    const currentIdx = STATUS_ORDER.indexOf(todo.category);
    if (direction === 'back' && currentIdx > 0) {
      todo.category = STATUS_ORDER[currentIdx - 1];
    } else if (direction === 'next' && currentIdx < STATUS_ORDER.length - 1) {
      todo.category = STATUS_ORDER[currentIdx + 1];
    }

    saveTodos();
    renderTodos();
  }

  /*** Edit Todo ***/
  function editTodo(id) {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    const newTitle = prompt('Edit title:', todo.title);
    if (newTitle === null) return; // user cancelled
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      alert('Title cannot be empty.');
      return;
    }

    const newDesc = prompt('Edit description (optional):', todo.description || '');
    // newDesc can be null (cancel) – keep existing description in that case
    todo.title = trimmedTitle;
    if (newDesc !== null) {
      todo.description = newDesc.trim();
    }

    saveTodos();
    renderTodos();
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

    // Prevent form submission (Enter key) from reloading the page
    dom.form.addEventListener('submit', e => e.preventDefault());

    dom.addButton.addEventListener('click', addTodo);
  }

  // Run the app
  init();
})();
