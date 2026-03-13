/**
 * @jest-environment jsdom
 */

// Set up DOM structure before loading script
document.head.innerHTML = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
`;
document.body.innerHTML = `
    <div class="todo-container">
        <div class="todo-header">
            <h1>My Todo List</h1>
        </div>
        <div class="todo-input-area">
            <div class="input-wrapper">
                <input type="text" id="todo-input" placeholder="What needs to be done?">
                <button id="add-btn">
                    <span>Add</span>
                </button>
            </div>
        </div>
        <div class="todo-list-container">
            <ul id="todo-list"></ul>
        </div>
        <div class="todo-footer">
            <span id="items-left">0 items left</span>
            <button id="clear-completed-btn">Clear Completed</button>
        </div>
    </div>
`;

// Load script after DOM setup
const {
    loadTodos,
    saveTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    updateItemsLeft,
    STORAGE_KEY
} = require('../script.js');

describe('Todo App', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        document.getElementById('todo-input').value = '';
    });

    describe('localStorage persistence', () => {
        test('should use correct localStorage key', () => {
            expect(STORAGE_KEY).toBe('simple-todo-items');
        });

        test('should save todos to localStorage', () => {
            const todos = [{ text: 'Test todo', completed: false }];
            saveTodos(todos);
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'simple-todo-items',
                JSON.stringify(todos)
            );
        });

        test('should load todos from localStorage', () => {
            const todos = [{ text: 'Test todo', completed: false }];
            localStorage.getItem.mockReturnValue(JSON.stringify(todos));
            
            const result = loadTodos();
            
            expect(localStorage.getItem).toHaveBeenCalledWith('simple-todo-items');
            expect(result).toEqual(todos);
        });

        test('should return empty array when localStorage is empty', () => {
            localStorage.getItem.mockReturnValue(null);
            
            const result = loadTodos();
            
            expect(result).toEqual([]);
        });

        test('should persist todos across operations', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Persistent todo';
            
            addTodo();
            
            expect(localStorage.setItem).toHaveBeenCalled();
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Persistent todo');
        });
    });

    describe('Add todo functionality', () => {
        test('should add todo when clicking Add button', () => {
            const todoInput = document.getElementById('todo-input');
            const addBtn = document.getElementById('add-btn');
            todoInput.value = 'New todo item';
            
            // Dispatch click event to trigger the event listener
            addBtn.click();
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('New todo item');
            expect(savedData[0].completed).toBe(false);
        });

        test('should add todo when pressing Enter', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Enter key todo';
            
            // Simulate Enter key event - this triggers the event listener in script.js
            const event = new KeyboardEvent('keypress', { key: 'Enter', bubbles: true });
            todoInput.dispatchEvent(event);
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Enter key todo');
        });

        test('should not add empty todo', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = '   ';
            
            addTodo();
            
            expect(localStorage.setItem).not.toHaveBeenCalled();
        });

        test('should clear input after adding todo', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Todo to add';
            
            addTodo();
            
            expect(todoInput.value).toBe('');
        });

        test('should add new todos at the bottom of the list', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([
                { text: 'First todo', completed: false }
            ]));
            
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Second todo';
            
            addTodo();
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(2);
            expect(savedData[1].text).toBe('Second todo');
        });

        test('new todos should be unchecked by default', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Unchecked todo';
            
            addTodo();
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData[0].completed).toBe(false);
        });
    });

    describe('Check/uncheck todo functionality', () => {
        test('should toggle todo completion status', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([
                { text: 'Todo 1', completed: false },
                { text: 'Todo 2', completed: false }
            ]));
            
            toggleTodo(0);
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData[0].completed).toBe(true);
            expect(savedData[1].completed).toBe(false);
        });

        test('should uncheck a completed todo', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([
                { text: 'Todo 1', completed: true }
            ]));
            
            toggleTodo(0);
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData[0].completed).toBe(false);
        });
    });

    describe('Delete todo functionality', () => {
        test('should delete a todo', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([
                { text: 'Todo 1', completed: false },
                { text: 'Todo 2', completed: false },
                { text: 'Todo 3', completed: false }
            ]));
            
            deleteTodo(1);
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(2);
            expect(savedData[0].text).toBe('Todo 1');
            expect(savedData[1].text).toBe('Todo 3');
        });

        test('should delete the correct todo by index', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([
                { text: 'First', completed: false },
                { text: 'Second', completed: false }
            ]));
            
            deleteTodo(0);
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Second');
        });
    });

    describe('Clear completed functionality', () => {
        test('should clear all completed todos', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([
                { text: 'Active todo', completed: false },
                { text: 'Completed todo 1', completed: true },
                { text: 'Completed todo 2', completed: true }
            ]));
            
            clearCompleted();
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Active todo');
            expect(savedData[0].completed).toBe(false);
        });

        test('should keep active todos when clearing completed', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([
                { text: 'Active 1', completed: false },
                { text: 'Completed', completed: true },
                { text: 'Active 2', completed: false }
            ]));
            
            clearCompleted();
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(2);
            expect(savedData[0].text).toBe('Active 1');
            expect(savedData[1].text).toBe('Active 2');
        });
    });

    describe('Item counter', () => {
        test('should show correct count with single item', () => {
            const todos = [{ text: 'One item', completed: false }];
            updateItemsLeft(todos);
            expect(document.getElementById('items-left').textContent).toBe('1 item left');
        });

        test('should show correct count with multiple items', () => {
            const todos = [
                { text: 'Item 1', completed: false },
                { text: 'Item 2', completed: false }
            ];
            updateItemsLeft(todos);
            expect(document.getElementById('items-left').textContent).toBe('2 items left');
        });

        test('should show correct count when all completed', () => {
            const todos = [
                { text: 'Item 1', completed: true },
                { text: 'Item 2', completed: true }
            ];
            updateItemsLeft(todos);
            expect(document.getElementById('items-left').textContent).toBe('0 items left');
        });

        test('should show correct count with no todos', () => {
            const todos = [];
            updateItemsLeft(todos);
            expect(document.getElementById('items-left').textContent).toBe('0 items left');
        });
    });

    describe('Clear completed button', () => {
        test('clear completed button removes completed todos', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify([
                { text: 'Active', completed: false },
                { text: 'Done', completed: true }
            ]));
            
            const clearBtn = document.getElementById('clear-completed-btn');
            clearBtn.click();
            
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Active');
        });
    });

    describe('Responsive layout', () => {
        test('should have viewport meta tag', () => {
            const meta = document.querySelector('meta[name="viewport"]');
            expect(meta).toBeTruthy();
        });

        test('should have input-wrapper for mobile stacking', () => {
            const wrapper = document.querySelector('.input-wrapper');
            expect(wrapper).toBeTruthy();
        });
    });
});
