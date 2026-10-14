import React from 'react';

export default function DeviceFrame({ children }) {
  return (
    <div className="min-h-screen bg-[#ededed] text-gray-900 flex flex-col w-full">
      {children}
    </div>
  );
}
