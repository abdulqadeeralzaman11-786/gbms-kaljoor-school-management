import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Notice } from '../../types';
import {
  Bell,
  Plus,
  Calendar,
  Tag,
  Users,
  Printer,
  Trash2,
  Edit2,
  Save,
  X,
  Megaphone,
} from 'lucide-react';

export const NoticesView: React.FC = () => {
  const { profile, t, showToast } = useApp();
  const { canAccess } = useAuth();

  const [notices, setNotices] = useState<Notice[]>(db.getNotices());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [printingNotice, setPrintingNotice] = useState<Notice | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    titleUrdu: string;
    content: string;
    contentUrdu: string;
    category: 'urgent' | 'exam' | 'holiday' | 'admission' | 'general' | 'academic' | 'administrative' | 'sports';
    priority: 'normal' | 'high' | 'urgent';
    targetAudience: 'all' | 'students' | 'teachers' | 'parents';
  }>({
    title: '',
    titleUrdu: '',
    content: '',
    contentUrdu: '',
    category: 'academic',
    priority: 'high',
    targetAudience: 'all',
  });

  const filteredNotices = notices.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      titleUrdu: '',
      content: '',
      contentUrdu: '',
      category: 'academic',
      priority: 'normal',
      targetAudience: 'all',
    });
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    const newNotice: Notice = {
      id: `NOT-${Date.now()}`,
      title: formData.title,
      titleUrdu: formData.titleUrdu,
      content: formData.content,
      contentUrdu: formData.contentUrdu,
      date: new Date().toISOString().split('T')[0],
      category: formData.category,
      priority: formData.priority,
      targetAudience: formData.targetAudience,
      publishedBy: 'Headmaster GBMS Kaljoor',
      isActive: true,
    };

    db.saveNotice(newNotice);
    setNotices(db.getNotices());
    setIsAddModalOpen(false);
    showToast('Notice published successfully!', 'success');
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete notice: "${title}"?`)) {
      db.deleteNotice(id);
      setNotices(db.getNotices());
      showToast('Notice deleted', 'info');
    }
  };

  const handlePrint = (notice: Notice) => {
    setPrintingNotice(notice);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-emerald-700" />
            <span>{t('notices')} & Circulars</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Official announcements, school circulars, holiday gazettes & events • {profile.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5 no-print">
          {canAccess('notices') && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Circular</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-2 overflow-x-auto no-print">
        <span className="text-xs font-bold uppercase text-slate-400 mr-2">Category:</span>
        {['all', 'academic', 'examination', 'holiday', 'administrative', 'sports'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Notices' : cat}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    notice.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : notice.priority === 'high'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {notice.priority}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {notice.date}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">{notice.title}</h3>
                {notice.titleUrdu && (
                  <p className="text-xs text-slate-500 font-urdu mt-0.5">{notice.titleUrdu}</p>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{notice.content}</p>
              {notice.contentUrdu && (
                <p className="text-xs text-slate-700 font-urdu leading-relaxed pt-2 border-t border-slate-100">
                  {notice.contentUrdu}
                </p>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">
                Audience: <strong className="text-slate-700 uppercase">{notice.targetAudience}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(notice)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print</span>
                </button>

                {canAccess('notices') && (
                  <button
                    onClick={() => handleDelete(notice.id, notice.title)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Issue Official Circular</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Title (English) *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Spring Break & Annual Sports Week Schedule"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوٹس کا عنوان (اردو)</label>
                <input
                  type="text"
                  value={formData.titleUrdu}
                  onChange={(e) => setFormData({ ...formData, titleUrdu: e.target.value })}
                  placeholder="مثلاً سالانہ سپورٹس گالا اور امتحانی تعطیلات کا اعلان"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="academic">Academic</option>
                    <option value="examination">Examination</option>
                    <option value="holiday">Holiday</option>
                    <option value="administrative">Administrative</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAudience: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="all">All</option>
                    <option value="students">Students</option>
                    <option value="teachers">Teachers</option>
                    <option value="parents">Parents</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Content (English) *</label>
                <textarea
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Provide circular details, instructions, and dates..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تفصیلات (اردو)</label>
                <textarea
                  rows={2}
                  value={formData.contentUrdu}
                  onChange={(e) => setFormData({ ...formData, contentUrdu: e.target.value })}
                  placeholder="اردو میں تفصیلات تحریر کریں..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
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
                  <span>Publish Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Notice Display */}
      {printingNotice && (
        <div className="print-only max-w-2xl mx-auto border-4 border-slate-900 p-8 rounded-2xl bg-white text-center">
          <p className="text-xs uppercase font-extrabold tracking-widest text-slate-700">
            Government of Azad Jammu & Kashmir • Elementary Education Department
          </p>
          <h2 className="text-xl font-black text-slate-900 mt-1">{profile.name}</h2>
          <p className="text-xs text-slate-600">{profile.address} • EMIS: {profile.code}</p>

          <div className="my-6 border-t-2 border-b-2 border-slate-900 py-3">
            <p className="text-[10px] uppercase font-bold text-slate-500">Official Notice Board Circular</p>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{printingNotice.title}</h1>
            {printingNotice.titleUrdu && (
              <p className="text-lg font-urdu text-slate-800 mt-1">{printingNotice.titleUrdu}</p>
            )}
            <p className="text-xs text-slate-500 font-mono mt-1">Date: {printingNotice.date}</p>
          </div>

          <div className="text-left text-sm leading-relaxed space-y-4 my-6">
            <p className="text-slate-800">{printingNotice.content}</p>
            {printingNotice.contentUrdu && (
              <p className="text-slate-900 font-urdu text-base leading-loose pt-3 border-t border-slate-200">
                {printingNotice.contentUrdu}
              </p>
            )}
          </div>

          <div className="pt-12 text-right">
            <div className="inline-block text-center border-t border-slate-800 pt-1 px-4">
              <p className="font-bold text-xs text-slate-900">Headmaster</p>
              <p className="text-[10px] text-slate-600">Govt. Boys Middle School Kaljoor</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
