// Todo List Application

const STORAGE_KEY = 'simple-todo-items';

const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const itemsLeftSpan = document.getElementById('items-left');

// Load todos from localStorage
function loadTodos() {
    const todos = localStorage.getItem(STORAGE_KEY);
    return todos ? JSON.parse(todos) : [];
}

// Save todos to localStorage
function saveTodos(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Update items left count
function updateItemsLeft(todos) {
    const activeCount = (todos || loadTodos()).filter(t => !t.completed).length;
    itemsLeftSpan.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
}

// Render todos
function renderTodos() {
    const todos = loadTodos();
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.textContent = 'No todos yet. Add one above!';
        todoList.appendChild(emptyDiv);
        updateItemsLeft(todos);
        return;
    }
    
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item${todo.completed ? ' completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(index));
        
        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;
        span.addEventListener('click', () => toggleTodo(index));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('aria-label', 'Delete todo');
        deleteBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
        deleteBtn.addEventListener('click', () => deleteTodo(index));
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
    
    updateItemsLeft(todos);
}

// Add a new todo
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const todos = loadTodos();
    todos.push({ text, completed: false });
    saveTodos(todos);
    todoInput.value = '';
    renderTodos();
}

// Toggle todo completion
function toggleTodo(index) {
    const todos = loadTodos();
    todos[index].completed = !todos[index].completed;
    saveTodos(todos);
    renderTodos();
}

// Delete a todo
function deleteTodo(index) {
    const todos = loadTodos();
    todos.splice(index, 1);
    saveTodos(todos);
    renderTodos();
}

// Clear completed todos
function clearCompleted() {
    const todos = loadTodos().filter(todo => !todo.completed);
    saveTodos(todos);
    renderTodos();
}

// Event listeners
addBtn.addEventListener('click', addTodo);
clearCompletedBtn.addEventListener('click', clearCompleted);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initial render
renderTodos();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadTodos,
        saveTodos,
        addTodo,
        toggleTodo,
        deleteTodo,
        clearCompleted,
        updateItemsLeft,
        STORAGE_KEY
    };
}
