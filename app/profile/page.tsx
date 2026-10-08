'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getUserInquiries } from '@/lib/supabase';
import { User, Phone, Mail, Camera, Save, LogOut, Calendar, MapPin, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { UserProfile, Inquiry } from '@/types';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Inquiry[]>([]);
  
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

        // 3. Fetch user bookings / inquiries
        if (user.email) {
          const userBookings = await getUserInquiries(user.email);
          setBookings(userBookings);
        }

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

        {/* My Bookings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[#eaeaea] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#eaeaea] bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-brand-ink">My Bookings & Inquiries</h2>
              <p className="text-sm text-brand-muted mt-1">Track your requested packages and itineraries.</p>
            </div>
            <Calendar className="w-5 h-5 text-brand-blue" />
          </div>
          
          <div className="p-0">
            {bookings.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <Calendar className="w-8 h-8 text-brand-muted/50" />
                </div>
                <h3 className="text-brand-ink font-medium">No bookings yet</h3>
                <p className="text-sm text-brand-muted mt-1 max-w-sm mx-auto mb-6">
                  You haven't requested any tour packages. Explore our destinations and plan your next adventure!
                </p>
                <Link 
                  href="/destinations" 
                  className="px-6 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-full shadow-sm shadow-brand-blue/20 hover:bg-brand-blueDark transition-colors"
                >
                  Explore Destinations
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-[#eaeaea]">
                {bookings.map((booking) => (
                  <li key={booking.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-brand-ink text-base">
                            {booking.tourTitle || 'Custom Itinerary'}
                          </h4>
                          {booking.status === 'confirmed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle className="w-3 h-3" /> Confirmed
                            </span>
                          ) : booking.status === 'contacted' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-brand-blue border border-brand-blue/20">
                              <Clock className="w-3 h-3" /> Contacted
                            </span>
                          ) : booking.status === 'cancelled' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                              <XCircle className="w-3 h-3" /> Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-brand-muted flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> 
                          {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible dates'} 
                          <span className="text-gray-300">•</span> 
                          {booking.guestsCount} Travelers
                        </p>
                        {booking.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">Requested on {new Date(booking.createdAt).toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 md:mt-0">
                        {booking.tourId && (
                          <Link 
                            href={`/tour/${booking.tourId}`} 
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#eaeaea] hover:border-brand-blue hover:text-brand-blue text-sm font-medium text-brand-ink rounded-lg shadow-sm transition-colors"
                          >
                            View Itinerary
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
