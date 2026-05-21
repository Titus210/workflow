import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsListPage } from './pages/ApplicationsListPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { ApplicationCreatePage } from './pages/ApplicationCreatePage';
import { ApplicationEditPage } from './pages/ApplicationEditPage';
import { KanbanPage } from './pages/KanbanPage';
import { DocsPage } from './pages/DocsPage';
import { SettingsPage } from './pages/SettingsPage';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';
export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <KeyboardShortcuts />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
              <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
              
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="applications" element={<ApplicationsListPage />} />
              <Route
                path="applications/create"
                element={<ApplicationCreatePage />} />
              
              <Route
                path="applications/:id"
                element={<ApplicationDetailPage />} />
              
              <Route
                path="applications/:id/edit"
                element={<ApplicationEditPage />} />
              
              <Route path="kanban" element={<KanbanPage />} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>);

}