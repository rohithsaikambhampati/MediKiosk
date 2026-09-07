import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { DevRoleSwitcher } from './layouts/DevRoleSwitcher';
import { UserRole } from './types/clinical';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-clinical-bg text-clinical-navy font-sans antialiased selection:bg-brand-500 selection:text-white">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;
