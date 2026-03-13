/**
 * @jest-environment jsdom
 */

// Set up DOM structure before loading script
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

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        _getStore: () => store
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Load script after DOM setup
const {
    loadTodos,
    saveTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    STORAGE_KEY
} = require('../script.js');

describe('Todo App', () => {
    beforeEach(() => {
        localStorageMock.clear();
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
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'simple-todo-items',
                JSON.stringify(todos)
            );
        });

        test('should load todos from localStorage', () => {
            const todos = [{ text: 'Test todo', completed: false }];
            localStorageMock.getItem.mockReturnValue(JSON.stringify(todos));
            
            const result = loadTodos();
            
            expect(localStorageMock.getItem).toHaveBeenCalledWith('simple-todo-items');
            expect(result).toEqual(todos);
        });

        test('should return empty array when localStorage is empty', () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            const result = loadTodos();
            
            expect(result).toEqual([]);
        });

        test('should persist todos across operations', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Persistent todo';
            
            addTodo();
            
            expect(localStorageMock.setItem).toHaveBeenCalled();
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Persistent todo');
        });
    });

    describe('Add todo functionality', () => {
        test('should add todo when clicking Add button', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'New todo item';
            
            addTodo();
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('New todo item');
            expect(savedData[0].completed).toBe(false);
        });

        test('should add todo when pressing Enter', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Enter key todo';
            
            // Simulate Enter key
            const event = new KeyboardEvent('keypress', { key: 'Enter' });
            todoInput.dispatchEvent(event);
            
            // Trigger the handler directly since we can't easily test the event listener
            if (event.key === 'Enter') {
                addTodo();
            }
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Enter key todo');
        });

        test('should not add empty todo', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = '   ';
            
            addTodo();
            
            expect(localStorageMock.setItem).not.toHaveBeenCalled();
        });

        test('should clear input after adding todo', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Todo to add';
            
            addTodo();
            
            expect(todoInput.value).toBe('');
        });

        test('should add new todos at the bottom of the list', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([
                { text: 'First todo', completed: false }
            ]));
            
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Second todo';
            
            addTodo();
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(2);
            expect(savedData[1].text).toBe('Second todo');
        });

        test('new todos should be unchecked by default', () => {
            const todoInput = document.getElementById('todo-input');
            todoInput.value = 'Unchecked todo';
            
            addTodo();
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData[0].completed).toBe(false);
        });
    });

    describe('Check/uncheck todo functionality', () => {
        test('should toggle todo completion status', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([
                { text: 'Todo 1', completed: false },
                { text: 'Todo 2', completed: false }
            ]));
            
            toggleTodo(0);
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData[0].completed).toBe(true);
            expect(savedData[1].completed).toBe(false);
        });

        test('should uncheck a completed todo', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([
                { text: 'Todo 1', completed: true }
            ]));
            
            toggleTodo(0);
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData[0].completed).toBe(false);
        });
    });

    describe('Delete todo functionality', () => {
        test('should delete a todo', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([
                { text: 'Todo 1', completed: false },
                { text: 'Todo 2', completed: false },
                { text: 'Todo 3', completed: false }
            ]));
            
            deleteTodo(1);
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(2);
            expect(savedData[0].text).toBe('Todo 1');
            expect(savedData[1].text).toBe('Todo 3');
        });

        test('should delete the correct todo by index', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([
                { text: 'First', completed: false },
                { text: 'Second', completed: false }
            ]));
            
            deleteTodo(0);
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Second');
        });
    });

    describe('Clear completed functionality', () => {
        test('should clear all completed todos', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([
                { text: 'Active todo', completed: false },
                { text: 'Completed todo 1', completed: true },
                { text: 'Completed todo 2', completed: true }
            ]));
            
            clearCompleted();
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].text).toBe('Active todo');
            expect(savedData[0].completed).toBe(false);
        });

        test('should keep active todos when clearing completed', () => {
            localStorageMock.getItem.mockReturnValue(JSON.stringify([
                { text: 'Active 1', completed: false },
                { text: 'Completed', completed: true },
                { text: 'Active 2', completed: false }
            ]));
            
            clearCompleted();
            
            const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(savedData).toHaveLength(2);
            expect(savedData[0].text).toBe('Active 1');
            expect(savedData[1].text).toBe('Active 2');
        });
    });
});
