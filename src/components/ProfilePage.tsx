import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { User, Mail, Shield, Building, Camera, Check, X, Eye } from 'lucide-react';

export default function ProfilePage() {
  const { profile, updateProfile } = useProfile();
  const { t } = useLanguage();
  const { isHighContrast, toggleHighContrast } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    role: profile.role,
    organization: profile.organization
  });
  const [successMessage, setSuccessMessage] = useState('');


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      role: profile.role,
      organization: profile.organization
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-white dark:text-white light:text-slate-900 font-display">
          {t('profile') || 'Profile Settings'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your tournament supervisor credentials and system preferences
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6">
        {/* Avatar Area */}
        <div className="flex items-center gap-5 pb-5 border-b border-slate-850">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-xl font-extrabold font-display">
                {formData.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <button 
              className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full p-1.5 transition-colors cursor-pointer border border-slate-900"
              title="Upload photo"
              onClick={() => alert('Photo upload simulation: Select image feature is ready for venue integration.')}
            >
              <Camera size={12} className="text-slate-950 font-bold" />
            </button>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">{profile.name}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{profile.role}</p>
            <span className="inline-block text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase mt-1">
              Active Session
            </span>
          </div>
        </div>

        {/* Input Fields */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Full Name</label>
            <div className={`flex items-center bg-slate-950 border rounded-xl p-3 transition-colors ${isEditing ? 'border-amber-500/50' : 'border-slate-850'}`}>
              <User size={16} className="text-slate-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="bg-transparent text-xs text-slate-100 w-full outline-none disabled:text-slate-400 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Email address</label>
            <div className={`flex items-center bg-slate-950 border rounded-xl p-3 transition-colors ${isEditing ? 'border-amber-500/50' : 'border-slate-850'}`}>
              <Mail size={16} className="text-slate-500 mr-3 flex-shrink-0" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="bg-transparent text-xs text-slate-100 w-full outline-none disabled:text-slate-400 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Assigned Role</label>
              <div className="flex items-center bg-slate-950/40 border border-slate-850 rounded-xl p-3">
                <Shield size={16} className="text-slate-600 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="bg-transparent text-xs text-slate-500 w-full outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1">Managed via FIFA security federation</p>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Organization</label>
              <div className={`flex items-center bg-slate-950 border rounded-xl p-3 transition-colors ${isEditing ? 'border-amber-500/50' : 'border-slate-850'}`}>
                <Building size={16} className="text-slate-500 mr-3 flex-shrink-0" />
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  disabled={!isEditing}
                  className="bg-transparent text-xs text-slate-100 w-full outline-none disabled:text-slate-400 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-850 flex gap-3">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-700/50"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium animate-fade-in flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Accessibility & Visual Settings Block */}
        <div className="pt-6 border-t border-slate-850 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4.5 h-4.5 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">System Accessibility Preferences</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-850 rounded-xl transition-all hover:border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-100 block">High Contrast Mode</span>
              <span className="text-[10px] text-slate-400 block leading-normal">
                Stark black background with yellow visual accents for visually impaired operators
              </span>
            </div>
            
            <button
              type="button"
              onClick={toggleHighContrast}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isHighContrast ? 'bg-amber-500' : 'bg-slate-800'
              }`}
              role="switch"
              aria-checked={isHighContrast}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  isHighContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
