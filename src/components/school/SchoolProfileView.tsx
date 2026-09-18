import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { SchoolProfile } from '../../types';
import { School, Save, Building, MapPin, Phone, Mail, User, Calendar, Award, CheckCircle2 } from 'lucide-react';

export const SchoolProfileView: React.FC = () => {
  const { profile, refreshProfile, showToast, t, language } = useApp();
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof SchoolProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSchoolProfile(formData);
    refreshProfile();
    setIsEditing(false);
    showToast('School profile updated successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white text-2xl font-black shadow-md border border-emerald-600/30">
            AJK
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'ur' ? profile.nameUrdu : profile.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              EMIS Code: <span className="font-mono font-bold text-emerald-700">{profile.code}</span> • Tehsil {profile.tehsil}, District {profile.district}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...profile });
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('save')}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{t('edit')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Building Photo & Quick Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="relative h-64 bg-slate-100">
            <img
              src={formData.buildingPhotoUrl}
              alt="School Campus"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
              <div className="text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  Government Middle School
                </span>
                <p className="text-lg font-bold mt-1">GBMS Kaljoor Campus</p>
                <p className="text-xs text-slate-300">Tehsil Dadyal, District Mirpur Azad Kashmir</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Affiliation Board:</span>
              <span className="font-bold text-slate-800 text-right">Dept of Education, AJ&K</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Headmaster:</span>
              <span className="font-bold text-slate-800">{formData.headTeacherName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Establishment Year:</span>
              <span className="font-bold text-slate-800">{formData.estYear}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 font-medium">School Type:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Boys Middle School (1-8)
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            {language === 'ur' ? 'سکول کی تفصیلی معلومات' : 'Official School Information & Registry'}
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-600 mb-1">School Name (English)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">School Name (Urdu)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.nameUrdu}
                  onChange={(e) => handleChange('nameUrdu', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600 font-urdu text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-600 mb-1">EMIS Code</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">District</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Tehsil</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.tehsil}
                  onChange={(e) => handleChange('tehsil', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Union Council</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.unionCouncil}
                  onChange={(e) => handleChange('unionCouncil', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Establishment Year</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.estYear}
                  onChange={(e) => handleChange('estYear', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Complete Address</label>
              <textarea
                rows={2}
                disabled={!isEditing}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Official Telephone</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Official Email</label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Head Teacher Name (English)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.headTeacherName}
                  onChange={(e) => handleChange('headTeacherName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Head Teacher Name (Urdu)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.headTeacherNameUrdu}
                  onChange={(e) => handleChange('headTeacherNameUrdu', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600 font-urdu text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Building Photo URL</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.buildingPhotoUrl}
                onChange={(e) => handleChange('buildingPhotoUrl', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 disabled:bg-slate-50 disabled:text-slate-600 font-mono text-[11px]"
              />
            </div>

            {isEditing && (
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
