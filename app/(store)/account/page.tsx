"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";
import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { isRTL } = useI18n();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile details states
  const [profile, setProfile] = useState({ first_name: "", last_name: "", phone: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  // Address states
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'messages' | 'notifications'>('orders');
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: "", phone: "", street: "", city: "", postcode: "", country: "EG", is_default: false
  });

  // Sent Messages (Consultations) and Notifications states
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const userId = user.id;
      // Fetch profile
      async function loadProfile() {
        setLoadingProfile(true);
        const { data } = await supabase
          .from("profiles")
          .select("first_name, last_name, phone")
          .eq("id", userId)
          .maybeSingle();
        if (data) {
          setProfile({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone || ""
          });
        }
        setLoadingProfile(false);
      }

      // Fetch orders
      async function loadOrders() {
        setLoadingOrders(true);
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        setOrders(data || []);
        setLoadingOrders(false);
      }

      loadProfile();
      loadOrders();
      fetchAddresses();
      fetchMessages();
      fetchNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    setUserAddresses(data || []);
    setLoadingAddresses(false);
  };

  const fetchMessages = async () => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .or(`email.eq.${user.email},user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (e: any) {
      console.warn("Failed to fetch consultations:", e.message);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (e: any) {
      console.warn("Notifications table query failed:", e.message);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileMessage("");
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          email: user.email ?? ""
        }, { onConflict: "id" });
      
      if (error) throw error;
      setProfileMessage(isRTL ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert(isRTL ? "فشل حفظ تفاصيل الملف الشخصي" : "Failed to save profile details");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    setSavingAddress(true);
    try {
      if (addressForm.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (editingAddress) {
        const { error } = await supabase
          .from("addresses")
          .update({
            full_name: addressForm.full_name,
            phone: addressForm.phone,
            street: addressForm.street,
            city: addressForm.city,
            postcode: addressForm.postcode,
            country: addressForm.country,
            is_default: addressForm.is_default
          })
          .eq("id", editingAddress)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            full_name: addressForm.full_name,
            phone: addressForm.phone,
            street: addressForm.street,
            city: addressForm.city,
            postcode: addressForm.postcode,
            country: addressForm.country,
            is_default: addressForm.is_default
          });
        if (error) throw error;
      }
      await fetchAddresses();
      setShowAddressForm(false);
    } catch (e) {
      console.error(e);
      alert(isRTL ? "فشل حفظ العنوان" : "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!user || !confirm(isRTL ? "هل أنت متأكد من حذف هذا العنوان؟" : "Are you sure you want to delete this address?")) return;
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      await fetchAddresses();
    } catch (e) {
      console.error(e);
      alert(isRTL ? "فشل حذف العنوان" : "Failed to delete address");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (activeTab === 'notifications' && user && notifications.some(n => !n.is_read)) {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length > 0) {
        supabase
          .from("notifications")
          .update({ is_read: true })
          .in("id", unreadIds)
          .eq("user_id", user.id)
          .then(({ error }) => {
            if (!error) {
              setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            }
          });
      }
    }
  }, [activeTab, notifications, user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f4f5f1]">
        <div className="w-10 h-10 border-4 border-[#17583a]/20 border-t-[#17583a] rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayName = `${profile.first_name} ${profile.last_name}`.trim() || user.name || (isRTL ? "مستخدم" : "User");

  // Local translations dictionary
  const dict = {
    profileInfo: isRTL ? "البيانات الشخصية" : "Profile Information",
    myOrders: isRTL ? "طلباتي" : "My Orders",
    savedAddresses: isRTL ? "العناوين المحفوظة" : "Saved Addresses",
    sentMessages: isRTL ? "الرسائل المرسلة" : "Sent Messages",
    notifications: isRTL ? "الإشعارات" : "Notifications",
    signOut: isRTL ? "تسجيل الخروج" : "Sign Out",
    personalDetails: isRTL ? "تفاصيل الحساب" : "Personal Details",
    firstName: isRTL ? "الاسم الأول *" : "First Name *",
    lastName: isRTL ? "اسم العائلة *" : "Last Name *",
    phone: isRTL ? "رقم الهاتف *" : "Phone Number *",
    email: isRTL ? "البريد الإلكتروني" : "Email Address",
    saving: isRTL ? "جاري الحفظ..." : "Saving...",
    saveDetails: isRTL ? "حفظ التغييرات" : "Save Details",
    noOrders: isRTL ? "لا توجد طلبات بعد" : "No orders yet",
    noOrdersDesc: isRTL ? "عندما تقوم بالشراء، ستظهر طلباتك هنا." : "When you place an order, it will appear here.",
    browseShop: isRTL ? "تصفح المتجر" : "Browse Shop",
    recentOrders: isRTL ? "الطلبات الأخيرة" : "Recent Orders",
    total: isRTL ? "الإجمالي" : "Total",
    edit: isRTL ? "تعديل" : "Edit",
    delete: isRTL ? "حذف" : "Delete",
    addNewAddress: isRTL ? "إضافة عنوان جديد" : "Add New Address",
    noAddresses: isRTL ? "لا توجد عناوين محفوظة" : "No saved addresses",
    noAddressesDesc: isRTL ? "أضف عنواناً لتسريع عملية الدفع والشحن." : "Add an address for faster checkout.",
    streetAddress: isRTL ? "عنوان الشارع *" : "Street Address *",
    city: isRTL ? "المدينة *" : "City *",
    postcode: isRTL ? "الرمز البريدي" : "Postcode",
    country: isRTL ? "البلد *" : "Country *",
    defaultAddress: isRTL ? "تعيين كعنوان افتراضي للتوصيل" : "Set as default delivery address",
    cancel: isRTL ? "إلغاء" : "Cancel",
    saveAddress: isRTL ? "حفظ العنوان" : "Save Address",
    pending: isRTL ? "معلق" : "Pending",
    completed: isRTL ? "مكتمل" : "Completed",
    processing: isRTL ? "قيد المعالجة" : "Processing",
    failed: isRTL ? "فشل الدفع" : "Payment Failed",
  };

  return (
    <div className="min-h-screen bg-[#f4f5f1] py-12 px-5" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-[1000px] mx-auto">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-16 h-16 bg-[#e8f3ec] text-[#17583a] font-heading font-black text-2xl rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                {displayName.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="font-heading font-bold text-xl text-[#0d3a24] mb-1 text-center md:text-start">{displayName}</h2>
              <p className="text-[#5f786c] text-sm mb-6 text-center md:text-start">{user.email}</p>
              
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-start transition-colors ${activeTab === 'profile' ? 'bg-[#f4f5f1] text-[#17583a]' : 'text-[#5f786c] hover:bg-[#f4f5f1]/50'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {dict.profileInfo}
                </button>
                <button 
                  onClick={() => setActiveTab('orders')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-start transition-colors ${activeTab === 'orders' ? 'bg-[#f4f5f1] text-[#17583a]' : 'text-[#5f786c] hover:bg-[#f4f5f1]/50'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  {dict.myOrders}
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-start transition-colors ${activeTab === 'addresses' ? 'bg-[#f4f5f1] text-[#17583a]' : 'text-[#5f786c] hover:bg-[#f4f5f1]/50'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {dict.savedAddresses}
                </button>
                <button 
                  onClick={() => setActiveTab('messages')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-start transition-colors ${activeTab === 'messages' ? 'bg-[#f4f5f1] text-[#17583a]' : 'text-[#5f786c] hover:bg-[#f4f5f1]/50'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  {dict.sentMessages}
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')} 
                  className={`w-full flex items-center justify-between px-4 py-3 font-semibold rounded-xl transition-colors ${activeTab === 'notifications' ? 'bg-[#f4f5f1] text-[#17583a]' : 'text-[#5f786c] hover:bg-[#f4f5f1]/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span>{dict.notifications}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[#e11d48] font-semibold hover:bg-red-50 rounded-xl transition-colors text-start"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {dict.signOut}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
              <div className="flex gap-4 border-b border-[#f0f2ee] mb-6 overflow-x-auto whitespace-nowrap">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'profile' ? 'text-[#0d3a24]' : 'text-[#8aab99] hover:text-[#5f786c]'}`}
                >
                  {dict.profileInfo}
                  {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#17583a] rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'orders' ? 'text-[#0d3a24]' : 'text-[#8aab99] hover:text-[#5f786c]'}`}
                >
                  {dict.recentOrders}
                  {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#17583a] rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'addresses' ? 'text-[#0d3a24]' : 'text-[#8aab99] hover:text-[#5f786c]'}`}
                >
                  {dict.savedAddresses}
                  {activeTab === 'addresses' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#17583a] rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('messages')}
                  className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'messages' ? 'text-[#0d3a24]' : 'text-[#8aab99] hover:text-[#5f786c]'}`}
                >
                  {dict.sentMessages}
                  {activeTab === 'messages' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#17583a] rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`pb-3 font-semibold text-sm transition-colors relative flex items-center gap-1.5 ${activeTab === 'notifications' ? 'text-[#0d3a24]' : 'text-[#8aab99] hover:text-[#5f786c]'}`}
                >
                  <span>{dict.notifications}</span>
                  {unreadCount > 0 && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                  {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#17583a] rounded-t-full"></div>}
                </button>
              </div>

              {activeTab === 'profile' && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-heading font-bold text-lg text-[#0d3a24]">{dict.personalDetails}</h3>
                    {profileMessage && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full animate-fade-in">
                        {profileMessage}
                      </span>
                    )}
                  </div>
                  {loadingProfile ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-10 bg-[#f4f5f1] rounded-xl"></div>
                      <div className="h-10 bg-[#f4f5f1] rounded-xl"></div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{dict.firstName}</label>
                          <input 
                            type="text" 
                            value={profile.first_name} 
                            onChange={e => setProfile({...profile, first_name: e.target.value})} 
                            className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{dict.lastName}</label>
                          <input 
                            type="text" 
                            value={profile.last_name} 
                            onChange={e => setProfile({...profile, last_name: e.target.value})} 
                            className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{dict.phone}</label>
                        <input 
                          type="tel" 
                          placeholder="e.g. 010xxxxxxxxx"
                          value={profile.phone} 
                          onChange={e => setProfile({...profile, phone: e.target.value})} 
                          className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{dict.email}</label>
                        <input 
                          type="text" 
                          disabled 
                          value={user.email ?? ""} 
                          className="w-full px-4 py-2.5 rounded-lg border border-[#e4ece7] bg-[#f4f5f1] text-sm text-[#8aab99] cursor-not-allowed" 
                        />
                      </div>

                      <button 
                        onClick={handleSaveProfile} 
                        disabled={savingProfile || !profile.first_name || !profile.last_name || !profile.phone} 
                        className="mt-4 px-6 py-3 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingProfile ? dict.saving : dict.saveDetails}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="animate-fade-in">
                  {loadingOrders ? (
                    <div className="animate-pulse space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-20 bg-[#f4f5f1] rounded-xl"></div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10 bg-[#f4f5f1] rounded-xl border border-dashed border-[#d4ded7]">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8aab99" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                      </div>
                      <h4 className="font-bold text-[#0d3a24] mb-1">{dict.noOrders}</h4>
                      <p className="text-sm text-[#5f786c]">{dict.noOrdersDesc}</p>
                      <Link href="/shop" className="inline-block mt-4 text-sm font-semibold text-[#17583a] hover:underline">
                        {dict.browseShop}
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#f4f5f1] rounded-xl gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-[#0d3a24]">{order.order_number || `#${order.id.slice(0, 8)}`}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                order.status === 'pending' || order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                order.status === 'payment_failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {dict[order.status as keyof typeof dict] || order.status}
                              </span>
                            </div>
                            <p className="text-sm text-[#5f786c]">{new Date(order.created_at).toLocaleDateString(isRTL ? "ar-EG" : "en-GB")}</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="text-end">
                              <p className="text-xs text-[#8aab99] uppercase tracking-wider font-bold mb-0.5">{dict.total}</p>
                              <p className="font-black font-heading text-[#17583a]">{order.currency || "EGP"} {Number(order.total).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="animate-fade-in">
                  {loadingAddresses ? (
                    <div className="animate-pulse space-y-4">
                      {[1,2].map(i => <div key={i} className="h-32 bg-[#f4f5f1] rounded-xl"></div>)}
                    </div>
                  ) : showAddressForm ? (
                    <div className="bg-[#f4f5f1] p-6 rounded-xl border border-[#d4ded7]">
                      <h4 className="font-bold text-[#0d3a24] mb-4">{editingAddress ? (isRTL ? "تعديل العنوان" : "Edit Address") : (isRTL ? "إضافة عنوان جديد" : "Add New Address")}</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{isRTL ? "الاسم الكامل *" : "Full Name *"}</label>
                            <input type="text" value={addressForm.full_name} onChange={e => setAddressForm({...addressForm, full_name: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{isRTL ? "الهاتف *" : "Phone *"}</label>
                            <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{dict.streetAddress}</label>
                          <input type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{dict.city}</label>
                            <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{dict.postcode}</label>
                            <input type="text" value={addressForm.postcode} onChange={e => setAddressForm({...addressForm, postcode: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">{dict.country}</label>
                            <select value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a] bg-white">
                              <option value="EG">{isRTL ? "مصر" : "Egypt"}</option>
                              <option value="SA">{isRTL ? "المملكة العربية السعودية" : "Saudi Arabia"}</option>
                              <option value="AE">{isRTL ? "الإمارات العربية المتحدة" : "UAE"}</option>
                            </select>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})} className="rounded text-[#17583a] focus:ring-[#17583a]" />
                          <span className="text-sm text-[#0d3a24] font-medium">{dict.defaultAddress}</span>
                        </label>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAddressForm(false)} className="px-5 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:bg-white transition-colors">{dict.cancel}</button>
                        <button onClick={handleSaveAddress} disabled={savingAddress || !addressForm.full_name || !addressForm.phone || !addressForm.street || !addressForm.city} className="px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50">
                          {savingAddress ? dict.saving : dict.saveAddress}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {userAddresses.length === 0 ? (
                        <div className="text-center py-10 bg-[#f4f5f1] rounded-xl border border-dashed border-[#d4ded7]">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8aab99" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          </div>
                          <h4 className="font-bold text-[#0d3a24] mb-1">{dict.noAddresses}</h4>
                          <p className="text-sm text-[#5f786c] mb-4">{dict.noAddressesDesc}</p>
                          <button onClick={() => { setAddressForm({ full_name: displayName, phone: "", city: "", postcode: "", country: "EG", street: "", is_default: true }); setShowAddressForm(true); setEditingAddress(null); }} className="px-6 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors">
                            {dict.addNewAddress}
                          </button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {userAddresses.map(addr => (
                            <div key={addr.id} className={`p-5 rounded-xl border-2 relative ${addr.is_default ? 'border-[#17583a] bg-[#e8f3ec]' : 'border-[#d4ded7] bg-white'}`}>
                              {addr.is_default && <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-[#17583a] text-white px-2 py-0.5 rounded-full">{isRTL ? "افتراضي" : "Default"}</span>}
                              <h4 className="font-bold text-[#0d3a24] mb-1">{addr.full_name}</h4>
                              <p className="text-sm text-[#5f786c] mb-1">{addr.phone}</p>
                              <p className="text-sm text-[#5f786c]">{addr.street}</p>
                              <p className="text-sm text-[#5f786c] mb-4">{addr.city}{addr.postcode ? `, ${addr.postcode}` : ''}, {addr.country}</p>
                              
                              <div className="flex items-center gap-3 pt-4 border-t border-[#d4ded7]/50">
                                <button onClick={() => { setAddressForm(addr); setEditingAddress(addr.id); setShowAddressForm(true); }} className="text-sm font-semibold text-[#17583a] hover:underline">{dict.edit}</button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm font-semibold text-red-500 hover:underline">{dict.delete}</button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => { setAddressForm({ full_name: displayName, phone: "", city: "", postcode: "", country: "EG", street: "", is_default: false }); setShowAddressForm(true); setEditingAddress(null); }} className="p-5 rounded-xl border-2 border-dashed border-[#d4ded7] bg-[#f4f5f1] flex flex-col items-center justify-center text-[#8aab99] hover:text-[#17583a] hover:border-[#17583a] transition-colors min-h-[160px]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><path d="M12 5v14M5 12h14"/></svg>
                            <span className="font-semibold text-sm">{dict.addNewAddress}</span>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="animate-fade-in">
                  {loadingMessages ? (
                    <div className="animate-pulse space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-24 bg-[#f4f5f1] rounded-xl"></div>)}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10 bg-[#f4f5f1] rounded-xl border border-dashed border-[#d4ded7]">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">💬</span>
                      </div>
                      <h4 className="font-bold text-[#0d3a24] mb-1">{isRTL ? "لا توجد رسائل مرسلة" : "No sent messages"}</h4>
                      <p className="text-sm text-[#5f786c]">{isRTL ? "تظهر هنا الرسائل وطلبات التصميم التي ترسلها إلينا." : "Design requests and inquiries you send will appear here."}</p>
                      <Link href="/contact" className="inline-block mt-4 text-sm font-semibold text-[#17583a] hover:underline">
                        {isRTL ? "طلب تصميم مساحة جديدة" : "Request Space Design"}
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const parsed = parseMessage(msg.message);
                        return (
                          <div key={msg.id} className="p-5 bg-[#f4f5f1] rounded-xl border border-[#e4ece7]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-[#0d3a24]">
                                {parsed.text.startsWith("Subject:") ? parsed.text.split("\n")[0] : (isRTL ? "استفسار" : "Inquiry")}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                msg.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                msg.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {msg.status === 'pending' ? dict.pending : (msg.status === 'in_progress' ? dict.processing : (isRTL ? "تم الحل" : "Resolved"))}
                              </span>
                            </div>
                            
                            <p className="text-sm text-[#0d3a24] whitespace-pre-wrap leading-relaxed">
                              {parsed.text.replace(/^Subject:.*?\n\n/, "")}
                            </p>

                            {parsed.images.length > 0 && (
                              <div className="mt-4">
                                <p className="text-[10px] uppercase font-bold text-[#8aab99] mb-1">{isRTL ? "الصور المرفقة" : "Attachments"}</p>
                                <div className="flex flex-wrap gap-2">
                                  {parsed.images.map((url, i) => (
                                    <a key={url} href={url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg overflow-hidden border border-[#d4ded7] block">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={url} alt="" className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            <p className="text-[10px] text-[#8aab99] mt-3">{new Date(msg.created_at).toLocaleString(isRTL ? "ar-EG" : "en-GB")}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="animate-fade-in">
                  {loadingNotifications ? (
                    <div className="animate-pulse space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-24 bg-[#f4f5f1] rounded-xl"></div>)}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-10 bg-[#f4f5f1] rounded-xl border border-dashed border-[#d4ded7]">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🔔</span>
                      </div>
                      <h4 className="font-bold text-[#0d3a24] mb-1">{isRTL ? "لا توجد إشعارات حالياً" : "No notifications yet"}</h4>
                      <p className="text-sm text-[#5f786c]">{isRTL ? "ستتلقى إشعارات هنا عندما يرد المسؤولون على استفساراتك." : "You will receive notifications here when admins respond to your requests."}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`p-5 rounded-xl border transition-all ${notif.is_read ? 'bg-white border-[#f0f2ee]' : 'bg-[#e8f3ec] border-[#b2d3c2]'}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-xl shrink-0 mt-0.5">🔔</span>
                            <div className="flex-1">
                              <h4 className="font-bold text-[#0d3a24] text-sm mb-1">{notif.title}</h4>
                              <p className="text-sm text-[#5f786c] whitespace-pre-wrap leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-[#8aab99] mt-2">{new Date(notif.created_at).toLocaleString(isRTL ? "ar-EG" : "en-GB")}</p>
                            </div>
                            {!notif.is_read && (
                              <span className="w-2.5 h-2.5 bg-[#17583a] rounded-full mt-1.5"></span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function parseMessage(msg: string | null) {
  if (!msg) return { text: "", images: [] };
  const match = msg.match(/\|\|IMAGE_URLS:(.*?)\|\|/);
  if (match) {
    const urls = match[1].split(",").filter(Boolean);
    const text = msg.replace(/\|\|IMAGE_URLS:.*?\|\|/, "").trim();
    return { text, images: urls };
  }
  return { text: msg, images: [] };
}
