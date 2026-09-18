import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Image as ImageIcon,
  Calendar,
  MapPin,
  Plus,
  Save,
  X,
  Trophy,
  Flag,
  Sparkles,
} from 'lucide-react';

interface SchoolEvent {
  id: string;
  title: string;
  titleUrdu?: string;
  date: string;
  category: 'sports' | 'national' | 'academic' | 'co-curricular';
  location: string;
  description: string;
  imageUrl: string;
}

const initialEvents: SchoolEvent[] = [
  {
    id: 'EVT-1',
    title: 'Annual Sports Gala & Cricket Tournament 2026',
    titleUrdu: 'سالانہ سپورٹس گالا و کرکٹ ٹورنامنٹ 2026',
    date: '2026-02-18',
    category: 'sports',
    location: 'Kaljoor School Grounds',
    description: 'Inter-house cricket tournament, 100m sprint, and tug-of-war competition between Jinnah House and Iqbal House.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'EVT-2',
    title: 'Kashmir Solidarity Day & Speech Competition',
    titleUrdu: 'یوم یکجہتی کشمیر و تقریری مقابلہ',
    date: '2026-02-05',
    category: 'national',
    location: 'School Main Assembly Hall',
    description: 'Bilingual declamation contest and national anthems presented by middle school students in presence of village elders.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'EVT-3',
    title: 'Science Fair & Model Exhibition',
    titleUrdu: 'سائنس نمائش اور تعلیمی ماڈلز',
    date: '2025-11-20',
    category: 'academic',
    location: 'Science Laboratory',
    description: 'Students from Classes 6, 7 and 8 demonstrated renewable solar energy models, water filtration systems, and robotic prototypes.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'EVT-4',
    title: 'Annual Prize Distribution Ceremony',
    titleUrdu: 'سالانہ تقریب تقسیم انعامات',
    date: '2025-04-12',
    category: 'co-curricular',
    location: 'Dadyal Education Complex',
    description: 'Honoring position holders of Class 8 Middle Standard Board Examination and awarding merit shields to faculty.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'EVT-5',
    title: 'Tree Plantation Campaign (Plant for Pakistan)',
    titleUrdu: 'شجرکاری مہم - سرسبز کشمیر',
    date: '2025-08-25',
    category: 'co-curricular',
    location: 'School Boundary & Play Area',
    description: 'Faculty and students planted 150 pine and fruit saplings around the school perimeter with forest department officials.',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
  },
];

export const EventsGalleryView: React.FC = () => {
  const { profile, showToast } = useApp();
  const { canAccess } = useAuth();

  const [events, setEvents] = useState<SchoolEvent[]>(initialEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    titleUrdu: '',
    date: new Date().toISOString().split('T')[0],
    category: 'sports' as const,
    location: 'GBMS Kaljoor Grounds',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
  });

  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    return true;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: SchoolEvent = {
      id: `EVT-${Date.now()}`,
      ...formData,
    };
    setEvents([newEvent, ...events]);
    setIsAddModalOpen(false);
    showToast('Event added to school gallery!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-emerald-700" />
            <span>School Events & Activities Gallery</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Sports tournaments, national celebrations, and academic competitions • {profile.name}
          </p>
        </div>

        {canAccess('events') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event Album</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-2 overflow-x-auto">
        {['all', 'sports', 'national', 'academic', 'co-curricular'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? 'All Activities' : cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-48 relative overflow-hidden bg-slate-100">
                <img
                  src={evt.imageUrl}
                  alt={evt.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                  {evt.category}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {evt.date}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {evt.location}
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base leading-snug">{evt.title}</h3>
                {evt.titleUrdu && (
                  <p className="text-xs text-slate-500 font-urdu">{evt.titleUrdu}</p>
                )}

                <p className="text-xs text-slate-600 leading-relaxed pt-1">{evt.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base">Record School Activity / Event</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان (اردو)</label>
                <input
                  type="text"
                  value={formData.titleUrdu}
                  onChange={(e) => setFormData({ ...formData, titleUrdu: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-urdu"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="sports">Sports</option>
                    <option value="national">National</option>
                    <option value="academic">Academic</option>
                    <option value="co-curricular">Co-curricular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <span>Save Activity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
