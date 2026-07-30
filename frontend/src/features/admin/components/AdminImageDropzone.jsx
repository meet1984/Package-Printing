import React, { useState, useRef } from 'react';

const AdminImageDropzone = ({ onDrop, accept = "image/*", children, className = "", disabled = false, maxSizeMB = 5 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFiles = (files) => {
    if (!files || files.length === 0) return false;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the maximum image upload size limit of ${maxSizeMB}MB.`);
        return false;
      }
    }
    return true;
  };

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
      if (!validateFiles(e.dataTransfer.files)) return;
      const mockEvent = { target: { files: e.dataTransfer.files } };
      onDrop(mockEvent);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (!validateFiles(e.target.files)) {
        e.target.value = '';
        return;
      }
      onDrop(e);
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
        onChange={handleFileChange} 
        className="hidden" 
        accept={accept}
        disabled={disabled}
      />
    </div>
  );
};

export default AdminImageDropzone;

