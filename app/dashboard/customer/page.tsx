// app/dashboard/customer/page.tsx
'use client';

import DashboardWrapper from '../dashboard-wrapper';
import { useSession } from 'next-auth/react';

export default function CustomerDashboardPage() {
  const { data: session } = useSession();

  return (
    <DashboardWrapper requiredRole="CUSTOMER">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Customer Dashboard</h1>
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Welcome back, {session?.user?.name || 'Client'}!
          </h2>
          <p className="text-slate-300 mb-4">
            This is your customer dashboard where you can manage your projects, view tasks, and communicate with our team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Your Projects</h3>
              <p className="text-slate-300">View and manage your active projects.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                View Projects
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Tasks</h3>
              <p className="text-slate-300">Track your pending and completed tasks.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                View Tasks
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Messages</h3>
              <p className="text-slate-300">Communicate with our team.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                Open Chat
              </button>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-2">Billing</h3>
              <p className="text-slate-300">View your invoices and payment history.</p>
              <button className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors">
                View Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}