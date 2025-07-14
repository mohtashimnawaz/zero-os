import React, { useState } from 'react';
import { useFileSystem } from '../contexts/FileSystemContext';

const Tasks: React.FC = () => {
  const { tasks, createTask, updateTask, deleteTask, isLoading } = useFileSystem();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dueDate = formData.dueDate ? new Date(formData.dueDate) : undefined;
      
      if (editingTask) {
        const task = tasks.find(t => t.id === editingTask);
        if (task) {
          await updateTask(
            editingTask, 
            formData.title, 
            formData.description, 
            task.completed, 
            dueDate, 
            formData.priority
          );
        }
        setEditingTask(null);
      } else {
        await createTask(formData.title, formData.description, dueDate, formData.priority);
        setShowNewTaskForm(false);
      }
      
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium' });
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleEdit = (task: any) => {
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.due_date ? new Date(Number(task.due_date) / 1000000).toISOString().split('T')[0] : '',
      priority: task.priority,
    });
    setEditingTask(task.id);
    setShowNewTaskForm(true);
  };

  const handleToggleComplete = async (task: any) => {
    try {
      const dueDate = task.due_date ? new Date(Number(task.due_date) / 1000000) : undefined;
      await updateTask(
        task.id, 
        task.title, 
        task.description, 
        !task.completed, 
        dueDate, 
        task.priority
      );
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', dueDate: '', priority: 'medium' });
    setEditingTask(null);
    setShowNewTaskForm(false);
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="page-header">
      <div className="row align-items-center mb-3">
        <div className="col">
          <h2 className="page-title">✅ Tasks</h2>
          <div className="page-subtitle">
            <span className="text-muted">
              {tasks.filter(t => !t.completed).length} pending, {tasks.filter(t => t.completed).length} completed
            </span>
          </div>
        </div>
        <div className="col-auto ms-auto">
          <div className="btn-list">
            <div className="dropdown">
              <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Filter: {filter}
              </button>
              <ul className="dropdown-menu">
                <li><button className="dropdown-item" onClick={() => setFilter('all')}>All</button></li>
                <li><button className="dropdown-item" onClick={() => setFilter('pending')}>Pending</button></li>
                <li><button className="dropdown-item" onClick={() => setFilter('completed')}>Completed</button></li>
              </ul>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 5l0 14"></path>
                <path d="M5 12l14 0"></path>
              </svg>
              New Task
            </button>
          </div>
        </div>
      </div>

      {showNewTaskForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h3 className="card-title">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="btn-list">
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update' : 'Create'} Task
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="row row-cards">
        {filteredTasks.map((task) => (
          <div key={task.id} className="col-12">
            <div className={`card ${task.completed ? 'bg-gray-50' : ''}`}>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                    />
                  </div>
                  <div className="col">
                    <h3 className={`card-title ${task.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-muted ${task.completed ? 'text-decoration-line-through' : ''}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                          {task.priority} priority
                        </span>
                      </div>
                      {task.due_date && Number(task.due_date) > 0 ? (
                        <div className="col-auto">
                          <small className="text-muted">
                            Due: {new Date(Number(task.due_date) / 1000000).toLocaleDateString()}
                          </small>
                        </div>
                      ) : null}
                      <div className="col-auto">
                        <small className="text-muted">
                          Created: {new Date(Number(task.created_at) / 1000000).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="btn-list">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="empty">
              <div className="empty-icon">✅</div>
              <p className="empty-title">
                {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
              </p>
              <p className="empty-subtitle text-muted">
                {filter === 'all' 
                  ? 'Create your first task to get started.'
                  : `No tasks match the ${filter} filter.`
                }
              </p>
              {filter === 'all' && (
                <div className="empty-action">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowNewTaskForm(true)}
                  >
                    Create your first task
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
