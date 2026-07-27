import React, { useState, useRef } from 'react';

const AdminImageDropzone = ({ onDrop, accept = "image/*", children, className = "", disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a mock event object to pass to existing handlers
      const mockEvent = { target: { files: e.dataTransfer.files } };
      onDrop(mockEvent);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div 
      className={`relative rounded-xl border-2 transition-all ${disabled ? 'opacity-50 cursor-not-allowed border-gray-200 bg-neutral/5' : 'cursor-pointer'} ${isDragging ? 'border-clay bg-brand/5 scale-[1.02]' : 'border-dashed border-gray-200 hover:border-clay'} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {children}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onDrop} 
        className="hidden" 
        accept={accept}
        disabled={disabled}
      />
    </div>
  );
};

export default AdminImageDropzone;
