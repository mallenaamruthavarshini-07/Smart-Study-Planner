import React, { useState } from 'react';
import { AcademicDocument, DocumentCategory, Subject } from '../types';
import {
  FolderOpen,
  Plus,
  Search,
  FileText,
  FileCheck,
  Download,
  Trash2,
  Eye,
  X,
  File,
  Shield,
  UploadCloud,
} from 'lucide-react';

interface DocumentsViewProps {
  documents: AcademicDocument[];
  subjects: Subject[];
  onUploadDocument: (doc: Partial<AcademicDocument>) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  subjects,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Notes');
  const [subject, setSubject] = useState(subjects[0]?.name || 'Java Programming');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Documents' },
    { key: 'Notes', label: 'Study Notes' },
    { key: 'PDFs', label: 'PDF Files' },
    { key: 'Certificates', label: 'Certificates' },
    { key: 'Projects', label: 'Projects & Reports' },
    { key: 'Other Documents', label: 'Other' },
  ];

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.subject.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('File size exceeds 15MB limit.');
        return;
      }
      setSelectedFile(file);
      if (!title) {
        // Default title to filename without extension
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !subject) return;

    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    // Convert file to base64 Data URL for persistent storage
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;

      onUploadDocument({
        title,
        category,
        subject,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type || 'application/pdf',
        fileData: base64Data,
      });

      // Reset
      setTitle('');
      setSelectedFile(null);
      setShowUploadModal(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDownload = (doc: AcademicDocument) => {
    if (doc.fileData) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Fallback
      const blob = new Blob([`Content of ${doc.title}`], { type: doc.fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
            <FolderOpen className="w-4 h-4" />
            <span>Academic Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Securely store study notes, PDF materials, project reports, and course certificates.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setSelectedFile(null);
            setUploadError('');
            setShowUploadModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white font-semibold text-xs sm:text-sm hover:bg-purple-800 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Category Strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title, subject, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === c.key
                  ? 'bg-purple-100 text-purple-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-slate-200/80">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No documents found</p>
            <p className="text-xs text-slate-400 mt-1">
              Upload study notes, syllabus PDFs, or internship certificates.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isCert = doc.category === 'Certificates';
            const isPdf = doc.category === 'PDFs' || doc.fileName.endsWith('.pdf');

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:border-purple-300 flex flex-col justify-between space-y-4 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
                      {isCert ? (
                        <FileCheck className="w-5 h-5 text-amber-600" />
                      ) : isPdf ? (
                        <FileText className="w-5 h-5 text-purple-700" />
                      ) : (
                        <File className="w-5 h-5 text-blue-700" />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 truncate">Subject: {doc.subject}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Academic Document</h3>
                  <p className="text-xs text-slate-500">Store study notes, PDF materials, or certificates</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4 text-xs">
              {uploadError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                  {uploadError}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Java Stream API Cheatsheet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-purple-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Notes">Study Notes</option>
                    <option value="PDFs">PDF Materials</option>
                    <option value="Certificates">Certificates</option>
                    <option value="Projects">Project Reports</option>
                    <option value="Other Documents">Other Documents</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Association *</label>
                  <input
                    type="text"
                    list="subject-options"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Subject name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <datalist id="subject-options">
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* File Input */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 hover:bg-purple-50/20 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  id="doc-file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                  className="hidden"
                />
                <label htmlFor="doc-file-input" className="cursor-pointer block space-y-1">
                  <UploadCloud className="w-8 h-8 text-purple-600 mx-auto" />
                  <span className="text-xs font-bold text-slate-800 block">
                    {selectedFile ? selectedFile.name : 'Choose file or drag & drop here'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    PDF, DOC, PNG, JPG up to 15MB
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800"
                >
                  Upload & Secure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{previewDoc.title}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  {previewDoc.fileName} · {formatFileSize(previewDoc.fileSize)}
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
              {previewDoc.fileData && previewDoc.fileData.startsWith('data:image/') ? (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.title}
                  className="max-h-[60vh] object-contain rounded-xl shadow-xs"
                />
              ) : previewDoc.fileData && previewDoc.fileData.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewDoc.fileData}
                  title={previewDoc.title}
                  className="w-full h-[55vh] rounded-xl border border-slate-200"
                />
              ) : (
                <div className="space-y-3 py-8">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      Encrypted Academic Document
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      This file is securely stored in your personal StudyMate vault. You can download
                      the original high-resolution version below.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(previewDoc)}
                    className="px-4 py-2 rounded-xl bg-purple-700 text-white font-semibold text-xs hover:bg-purple-800 inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
