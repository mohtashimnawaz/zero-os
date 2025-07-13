import React from 'react';

const Notes: React.FC = () => {
  return (
    <div className="page-header d-print-none">
      <div className="container-xl">
        <div className="row g-2 align-items-center">
          <div className="col">
            <h2 className="page-title">Notes</h2>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <div className="card-body">
              <p>Notes - Coming Soon</p>
              <p>This will include rich text editing, tagging, and note organization.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
