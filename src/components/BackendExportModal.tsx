import React, { useState } from 'react';
import {
  Code2,
  Database,
  Download,
  Copy,
  Check,
  X,
  Terminal,
  Server,
  FileText,
} from 'lucide-react';

interface BackendExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendExportModal: React.FC<BackendExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'app' | 'setup'>('schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaSqlSample = `-- MySQL Database Schema for StudyMate
-- Complete normalized 19 tables created in /backend_flask/schema.sql
CREATE DATABASE IF NOT EXISTS studymate_db;
USE studymate_db;

-- 1. users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. tasks
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    subject_name VARCHAR(120) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. learning_goals, exams, documents, notifications, consistency_records...
-- See full file in /backend_flask/schema.sql`;

  const flaskAppSample = `# Python Flask Backend (Full file at /backend_flask/app.py)
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from apscheduler.schedulers.background import BackgroundScheduler
import bcrypt, os

app = Flask(__name__)
CORS(app)

# Background scheduler for device notification countdowns
scheduler = BackgroundScheduler()
scheduler.add_job(func=check_scheduled_notifications, trigger="interval", seconds=60)
scheduler.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Python Flask & MySQL Architecture
              </h3>
              <p className="text-xs text-slate-500">
                Generated source files located in <code className="text-purple-700 font-mono">/backend_flask</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-purple-100 text-purple-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>schema.sql (19 Tables)</span>
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
              activeTab === 'app'
                ? 'bg-purple-100 text-purple-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>app.py (Flask API)</span>
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'bg-purple-100 text-purple-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup & VAPID Guide</span>
          </button>
        </div>

        {/* Code display */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-sans">
                <span>19 Tables Normalized with Foreign Keys & Cascade Deletes</span>
                <button
                  onClick={() => copyCode(schemaSqlSample)}
                  className="flex items-center gap-1 text-purple-700 hover:text-purple-900 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-purple-200 overflow-x-auto text-[11px] leading-relaxed">
                {schemaSqlSample}
              </pre>
            </div>
          )}

          {activeTab === 'app' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-slate-500 text-[11px] font-sans">
                <span>Flask API with SQLAlchemy ORM and APScheduler Background Worker</span>
                <button
                  onClick={() => copyCode(flaskAppSample)}
                  className="flex items-center gap-1 text-purple-700 hover:text-purple-900 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-indigo-200 overflow-x-auto text-[11px] leading-relaxed">
                {flaskAppSample}
              </pre>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="font-sans text-xs text-slate-700 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Run Flask Backend Locally:</h4>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px]">
                  cd backend_flask<br />
                  pip install -r requirements.txt<br />
                  mysql -u root -p &lt; schema.sql<br />
                  python app.py
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Web Push VAPID Generation:</h4>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px]">
                  pip install pywebpush<br />
                  vapid --gen
                </pre>
                <p className="text-[11px] text-slate-500">
                  Copy the output public and private keys to your Flask <code>.env</code> file.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
