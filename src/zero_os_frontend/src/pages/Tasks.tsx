import React from 'react';

const Tasks: React.FC = () => {
  return (
    <div className="page-header d-print-none">
      <div className="container-xl">
        <div className="row g-2 align-items-center">
          <div className="col">
            <h2 className="page-title">Tasks</h2>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <div className="card-body">
              <p>Tasks - Coming Soon</p>
              <p>This will include task management, priorities, due dates, and completion tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
