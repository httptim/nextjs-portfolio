// app/dashboard/admin/page.tsx
'use client';

import DashboardWrapper from '../dashboard-wrapper';
import { useSession } from 'next-auth/react';

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  return (
    <DashboardWrapper requiredRole="ADMIN">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Welcome back, {session?.user?.name || 'Admin'}!
          </h2>
          <p className="text-slate-300 mb-4">
            This is your admin dashboard where you can manage customers, projects, content, and more.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Customers</h3>
              <p className="text-slate-300">Manage client accounts and data.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                View Customers
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Projects</h3>
              <p className="text-slate-300">View and manage all active projects.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                View Projects
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Tasks</h3>
              <p className="text-slate-300">Assign and track project tasks.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                View Tasks
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Messages</h3>
              <p className="text-slate-300">Manage client communications.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                View Messages
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Billing</h3>
              <p className="text-slate-300">Manage invoices and payments.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                View Billing
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Content</h3>
              <p className="text-slate-300">Manage website and portfolio content.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                Edit Content
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}