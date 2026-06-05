'use client';
import './CarTypeDeleteConfirm.css';

export default function CarTypeDeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="delete-overlay" onClick={onCancel}>
      <div className="delete-dialog" onClick={e => e.stopPropagation()}>
        <div className="delete-icon">⚠️</div>
        <h3>Delete Car Type</h3>
        <p>This will also affect related cars. Are you sure?</p>
        <div className="delete-actions">
          <button onClick={onCancel} className="btn-cancel">Cancel</button>
          <button onClick={onConfirm} className="btn-confirm">Delete</button>
        </div>
      </div>
    </div>
  );
}