// src/app.js
// Refactored TodoIt application – vanilla JS, clear separation of concerns
// Follows Architecture.md and Rules.md

(() => {
  'use strict';

  /*** Storage Manager ***/
  const storage = {
    KEY: 'todoit.todos',
    load() {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse todos from LocalStorage:', e);
        return [];
      }
    },
    save(todos) {
      localStorage.setItem(this.KEY, JSON.stringify(todos));
    }
  };

  /*** State Manager ***/
  const state = {
    todos: [],

    init() {
      this.todos = storage.load();
    },

    add(todo) {
      this.todos.push(todo);
      this.persist();
    },

    remove(id) {
      this.todos = this.todos.filter(t => t.id !== id);
      this.persist();
    },

    update(id, updates) {
      const todo = this.todos.find(t => t.id === id);
      if (!todo) return;
      Object.assign(todo, updates);
      this.persist();
    },

    move(id, direction) {
      const todo = this.todos.find(t => t.id === id);
      if (!todo) return;
      const STATUS_ORDER = ['todo', 'inProgress', 'done'];
      const idx = STATUS_ORDER.indexOf(todo.category);
      if (direction === 'back' && idx > 0) {
        todo.category = STATUS_ORDER[idx - 1];
      } else if (direction === 'next' && idx < STATUS_ORDER.length - 1) {
        todo.category = STATUS_ORDER[idx + 1];
      }
      this.persist();
    },

    persist() {
      storage.save(this.todos);
    }
  };

  /*** UI Renderer ***/
  const ui = {
    /*** DOM References ***/
    dom: {
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
    },

    /*** Helper: create a button ***/
    createButton({ className, text, title, disabled = false, onClick }) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = className;
      btn.textContent = text;
      btn.title = title;
      btn.disabled = disabled;
      btn.addEventListener('click', onClick);
      return btn;
    },

    /*** Clear all columns ***/
    clearLists() {
      Object.values(this.dom.lists).forEach(list => (list.innerHTML = ''));
    },

    /*** Build a todo DOM element ***/
    createTodoElement(todo) {
      const item = document.createElement('div');
      item.className = `todo-item todo-${todo.category}`;
      item.dataset.id = todo.id;

      const title = document.createElement('strong');
      title.textContent = todo.title;
      item.appendChild(title);

      if (todo.description) {
        const desc = document.createElement('p');
        desc.textContent = todo.description;
        item.appendChild(desc);
      }

      // Back button
      const backBtn = this.createButton({
        className: 'nav-btn back-btn',
        text: '←',
        title: 'Back',
        disabled: ['todo'].includes(todo.category),
        onClick: () => state.move(todo.id, 'back')
      });
      item.appendChild(backBtn);

      // Next button
      const nextBtn = this.createButton({
        className: 'nav-btn next-btn',
        text: '→',
        title: 'Next',
        disabled: ['done'].includes(todo.category),
        onClick: () => state.move(todo.id, 'next')
      });
      item.appendChild(nextBtn);

      // Edit button
      const editBtn = this.createButton({
        className: 'edit-btn',
        text: '✎',
        title: 'Edit',
        onClick: () => handlers.editTodo(todo.id)
      });
      item.appendChild(editBtn);

      // Delete button
      const delBtn = this.createButton({
        className: 'delete-btn',
        text: '✕',
        title: 'Delete',
        onClick: () => state.remove(todo.id)
      });
      item.appendChild(delBtn);

      return item;
    },

    /*** Render all todos into their columns ***/
    render() {
      this.clearLists();
      state.todos.forEach(todo => {
        const container = this.dom.lists[todo.category];
        if (container) {
          container.appendChild(this.createTodoElement(todo));
        }
      });
    },

    /*** Form utilities ***/
    getFormData() {
      return {
        title: this.dom.titleInput.value.trim(),
        category: this.dom.categorySelect.value,
        description: this.dom.descriptionInput.value.trim()
      };
    },

    resetForm() {
      this.dom.titleInput.value = '';
      this.dom.categorySelect.value = 'todo';
      this.dom.descriptionInput.value = '';
    }
  };

  /*** Event Handlers ***/
  const handlers = {
    init() {
      // Prevent default form submission (page reload)
      ui.dom.form.addEventListener('submit', e => e.preventDefault());

      // Add button
      ui.dom.addButton.addEventListener('click', this.handleAdd);
    },

    handleAdd() {
      const { title, category, description } = ui.getFormData();
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

      state.add(newTodo);
      ui.render();
      ui.resetForm();
    },

    editTodo(id) {
      const todo = state.todos.find(t => t.id === id);
      if (!todo) return;

      const newTitle = prompt('Edit title:', todo.title);
      if (newTitle === null) return; // cancelled
      const trimmedTitle = newTitle.trim();
      if (!trimmedTitle) {
        alert('Title cannot be empty.');
        return;
      }

      const newDesc = prompt('Edit description (optional):', todo.description || '');
      const updates = { title: trimmedTitle };
      if (newDesc !== null) updates.description = newDesc.trim();

      state.update(id, updates);
      ui.render();
    }
  };

  /*** Application Initialization ***/
  function initApp() {
    state.init();
    ui.render();
    handlers.init();
  }

  // Start the app
  initApp();
})();
