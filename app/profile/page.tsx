'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Phone, Mail, Camera, Save, LogOut } from 'lucide-react';
import { UserProfile } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!supabase) throw new Error('Supabase not configured');
        
        // 1. Get current logged in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/'); // Redirect to home if not logged in
          return;
        }

        setUserEmail(user.email || '');

        // 2. Fetch their profile data from the new 'profiles' table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        // Use profile data if it exists, otherwise try to pull from Google auth metadata
        const defaultName = profileData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '';
        const defaultPhone = profileData?.phone || user.user_metadata?.phone || '';
        const defaultAvatar = profileData?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';

        setProfile({
          id: user.id,
          full_name: defaultName,
          phone: defaultPhone,
          avatar_url: defaultAvatar
        });
        
        setFullName(defaultName);
        setPhone(defaultPhone);

      } catch (err) {
        console.error('Profile fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates = {
        id: user.id,
        full_name: fullName,
        phone: phone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      
      if (error) throw error;
      
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      router.push('/');
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-[#eaeaea]">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden group">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-brand-blue" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-ink">{fullName || 'Traveler'}</h1>
              <p className="text-sm text-brand-muted flex items-center gap-1.5 mt-1">
                <Mail className="w-4 h-4" /> {userEmail}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="mt-6 sm:mt-0 flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border border-[#eaeaea] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#eaeaea] bg-gray-50/50">
            <h2 className="text-lg font-semibold text-brand-ink">Personal Information</h2>
            <p className="text-sm text-brand-muted mt-1">Update your details for faster bookings.</p>
          </div>
          
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-ink flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-blue" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-white border border-[#ddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-ink flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-blue" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-white border border-[#ddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                  />
                </div>
                
                {/* Email (Read Only) */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-brand-ink flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-muted" /> Email Address (Cannot be changed)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full bg-gray-50 border border-[#ddd] rounded-lg px-4 py-3 text-sm text-brand-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blueDark text-white text-sm font-medium rounded-full transition-colors shadow-md shadow-brand-blue/20 disabled:opacity-70"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
