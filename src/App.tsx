import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  Circle, 
  Calendar, 
  Search, 
  Flag, 
  Filter,
  X,
  ChevronDown,
  Clock,
  AlertCircle,
  Tag,
  Edit2,
  Save
} from 'lucide-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
  lastModified?: string;
  tags: string[];
  timeEstimate?: number; // in minutes
}

type FilterType = 'all' | 'active' | 'completed' | 'overdue';
type SortType = 'dueDate' | 'priority' | 'alphabetical' | 'created' | 'modified';

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('created');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [timeEstimate, setTimeEstimate] = useState<number>(30);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const categories = ['personal', 'work', 'shopping', 'health', 'education'];

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const now = new Date().toISOString();
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        category,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        priority,
        notes,
        createdAt: now,
        lastModified: now,
        tags: [...tags], // Create a new array to avoid reference issues
        timeEstimate
      }]);
      setNewTodo('');
      setCategory('personal');
      setDueDate('');
      setPriority('medium');
      setNotes('');
      setTags([]);
      setTimeEstimate(30);
      setShowAddForm(false);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { 
        ...todo, 
        completed: !todo.completed,
        lastModified: new Date().toISOString()
      } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? {
        ...todo,
        text: editText,
        lastModified: new Date().toISOString()
      } : todo
    ));
    setEditingTodo(null);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const filteredAndSortedTodos = todos
    .filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      if (filter === 'overdue') return !todo.completed && new Date(todo.dueDate) < new Date();
      return true;
    })
    .filter(todo =>
      todo.text.toLowerCase().includes(search.toLowerCase()) ||
      todo.category.toLowerCase().includes(search.toLowerCase()) ||
      todo.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sort) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'modified':
          return new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime();
        default:
          return 0;
      }
    });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length,
    totalTime: todos.reduce((acc, todo) => acc + (todo.timeEstimate || 0), 0),
    remainingTime: todos
      .filter(t => !t.completed)
      .reduce((acc, todo) => acc + (todo.timeEstimate || 0), 0)
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-light text-slate-900">
                Tasks
              </h1>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
              >
                {showAddForm ? <X size={20} /> : <PlusCircle size={20} />}
                <span>{showAddForm ? 'Cancel' : 'New Task'}</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={addTodo} className="mb-8 bg-white p-6 rounded-lg border border-slate-200">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Task
                    </label>
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="What needs to be done?"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Time Estimate (minutes)
                    </label>
                    <input
                      type="number"
                      value={timeEstimate}
                      onChange={(e) => setTimeEstimate(parseInt(e.target.value))}
                      min="0"
                      step="5"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-sm flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Add tag and press Enter"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional details..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            )}

            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks, categories, or tags..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="all">All Tasks</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                >
                  <option value="created">Sort by Created Date</option>
                  <option value="modified">Sort by Modified Date</option>
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="alphabetical">Sort Alphabetically</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredAndSortedTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`bg-white rounded-lg transition-all duration-300 ${
                    todo.completed ? 'opacity-75' : ''
                  } hover:shadow-md border border-slate-200`}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors duration-200"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="text-emerald-500" size={24} />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {editingTodo === todo.id ? (
                            <div className="flex gap-2 items-center flex-1">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              />
                              <button
                                onClick={() => saveEdit(todo.id)}
                                className="text-slate-500 hover:text-slate-700"
                              >
                                <Save size={18} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span
                                className={`font-medium ${
                                  todo.completed
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-700'
                                }`}
                              >
                                {todo.text}
                              </span>
                              <button
                                onClick={() => startEditing(todo)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <Edit2 size={14} />
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {todo.category}
                          </span>
                          {todo.tags && todo.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded flex items-center gap-1"
                            >
                              <Tag size={12} />
                              {tag}
                            </span>
                          ))}
                          <span className={`text-sm px-2 py-1 rounded ${getPriorityStyle(todo.priority)}`}>
                            {todo.priority}
                          </span>
                        </div>

                        {todo.notes && (
                          <p className="text-sm text-slate-500 mt-2">{todo.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock size={14} />
                            {todo.timeEstimate}m
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors duration-200"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAndSortedTodos.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  No tasks found. Add one above!
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-slate-600">
              <span>Total: {stats.total} tasks</span>
              <span>Completed: {stats.completed}</span>
              <span className="text-slate-700">Overdue: {stats.overdue}</span>
              <span>Total Time: {Math.round(stats.totalTime / 60)}h {stats.totalTime % 60}m</span>
              <span>Remaining: {Math.round(stats.remainingTime / 60)}h {stats.remainingTime % 60}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;