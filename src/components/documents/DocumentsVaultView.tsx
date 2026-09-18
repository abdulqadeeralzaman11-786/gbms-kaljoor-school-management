import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  FolderLock,
  FileText,
  Download,
  Search,
  Plus,
  Save,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface OfficialDocument {
  id: string;
  referenceNo: string;
  title: string;
  titleUrdu?: string;
  category: 'government' | 'curriculum' | 'rules' | 'finance' | 'templates';
  issueDate: string;
  department: string;
  summary: string;
  fileSize: string;
}

const initialDocs: OfficialDocument[] = [
  {
    id: 'DOC-1',
    referenceNo: 'EDU/AJK/SEC/2026/891',
    title: 'Middle Standard Board Examination Regulations & Guidelines 2026',
    titleUrdu: 'مڈل اسٹینڈرڈ امتحانی ضوابط و رہنمائی 2026',
    category: 'government',
    issueDate: '2026-01-10',
    department: 'AJK Board of Intermediate & Secondary Education, Mirpur',
    summary: 'Official criteria for Class 8 student registration, roll number slips distribution, assessment grading scale, and exam center allocation.',
    fileSize: '1.4 MB',
  },
  {
    id: 'DOC-2',
    referenceNo: 'DEE/MIR/2025/1104',
    title: 'Farogh-e-Taleem Fund (FTF) Accounting & Audit Standard Operating Procedures',
    titleUrdu: 'فروغ تعلیم فنڈ کے قواعد و ضوابط اور آڈٹ گائیڈ لائنز',
    category: 'finance',
    issueDate: '2025-08-15',
    department: 'Directorate of Elementary Education AJ&K, Muzaffarabad',
    summary: 'Rules for collection, bank maintenance in Joint SMC Account, and permissible expenditure on minor repairs and sports kits.',
    fileSize: '840 KB',
  },
  {
    id: 'DOC-3',
    referenceNo: 'CURR/SLL/2025/612',
    title: 'Middle School Curriculum & Syllabus Scheme (Classes 6 to 8)',
    titleUrdu: 'مڈل اسکول درسی نصاب و تقسیم مضامین (جماعت ششم تا ہشتم)',
    category: 'curriculum',
    issueDate: '2025-03-01',
    department: 'National Curriculum Council & AJK Textbook Board',
    summary: 'Detailed term-wise syllabus split for English, Mathematics, General Science, Islamic Studies, and Computer Education.',
    fileSize: '3.2 MB',
  },
  {
    id: 'DOC-4',
    referenceNo: 'SMC/COMM/2025/309',
    title: 'School Management Committee (SMC) Constitution & Community Charter',
    titleUrdu: 'اسکول مینجمنٹ کمیٹی دستور و دفتری اختیارات',
    category: 'rules',
    issueDate: '2025-05-18',
    department: 'Elementary Education Department Mirpur',
    summary: 'Roles of Headmaster as Member Secretary, parent election procedures, and school improvement planning guidelines.',
    fileSize: '650 KB',
  },
  {
    id: 'DOC-5',
    referenceNo: 'TMPL/ADM/2026/01',
    title: 'Standard Admission Register & School Leaving Certificate Format',
    titleUrdu: 'داخلہ خارج رجسٹر اور اسکول سرٹیفکیٹ نمونہ',
    category: 'templates',
    issueDate: '2026-01-01',
    department: 'Govt. Boys Middle School Kaljoor, Dadyal',
    summary: 'Official A4 template for student verification, character testimonial, and transfer documents.',
    fileSize: '320 KB',
  },
];

export const DocumentsVaultView: React.FC = () => {
  const { profile, showToast } = useApp();
  const { canAccess } = useAuth();

  const [documents, setDocuments] = useState<OfficialDocument[]>(initialDocs);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    referenceNo: '',
    title: '',
    titleUrdu: '',
    category: 'government' as const,
    issueDate: new Date().toISOString().split('T')[0],
    department: 'Elementary Education Department AJ&K',
    summary: '',
    fileSize: '500 KB',
  });

  const filteredDocs = documents.filter((d) => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.referenceNo.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: OfficialDocument = {
      id: `DOC-${Date.now()}`,
      ...formData,
    };
    setDocuments([newDoc, ...documents]);
    setIsAddModalOpen(false);
    showToast('Document added to institutional vault!', 'success');
  };

  const handleSimulateDownload = (title: string) => {
    showToast(`Downloading official gazette: ${title}`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <FolderLock className="w-6 h-6 text-emerald-700" />
            <span>Institutional Documents & Gazette Vault</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Government notifications, curriculum schemes, service codes & policy archives • {profile.name}
          </p>
        </div>

        {canAccess('documents') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Archive New Document</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'government', 'curriculum', 'finance', 'rules', 'templates'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Documents' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notification or ref #..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700 font-mono">
                  {doc.referenceNo}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  {doc.category}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {doc.issueDate}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{doc.title}</h3>
              {doc.titleUrdu && (
                <p className="text-xs text-slate-500 font-urdu">{doc.titleUrdu}</p>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">{doc.summary}</p>
              <p className="text-[11px] text-slate-400 font-medium">Issued by: {doc.department}</p>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 flex-shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">{doc.fileSize}</span>
              <button
                onClick={() => handleSimulateDownload(doc.title)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Archive Institutional Gazette</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Reference Number *</label>
                <input
                  type="text"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  placeholder="e.g. EDU/MIR/2026/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual School Calendar and Examination Schedule"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="government">Government Order</option>
                    <option value="curriculum">Curriculum</option>
                    <option value="finance">Finance / Funds</option>
                    <option value="rules">Rules & Service</option>
                    <option value="templates">Templates</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Issue</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Issuing Authority / Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Summary / Key Provisions</label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Archive Gazette</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
