"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";
import { orders as ordersApi } from "../../lib/api";
import Link from "next/link";
import { useI18n } from "../../lib/i18n-context";

export default function AccountPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { t } = useI18n();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address states
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: "", phone: "", street: "", city: "", postcode: "", country: "EG", is_default: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Fetch orders
      ordersApi.list()
        .then((res) => {
          setOrders(res.data || []);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
      
      // Fetch addresses
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = () => {
    setLoadingAddresses(true);
    // Assuming you export `addresses` from api.ts
    import('../../lib/api').then(({ addresses }) => {
      addresses.list()
        .then(res => setUserAddresses(res))
        .catch(console.error)
        .finally(() => setLoadingAddresses(false));
    });
  };

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    try {
      const { addresses } = await import('../../lib/api');
      if (editingAddress) {
        await addresses.update(editingAddress, addressForm);
      } else {
        await addresses.create(addressForm);
      }
      await fetchAddresses();
      setShowAddressForm(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const { addresses } = await import('../../lib/api');
      await addresses.delete(id);
      await fetchAddresses();
    } catch (e) {
      console.error(e);
      alert("Failed to delete address");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f4f5f1]">
        <div className="w-10 h-10 border-4 border-[#17583a]/20 border-t-[#17583a] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f1] py-12 px-5">
      <div className="max-w-[1000px] mx-auto">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-16 h-16 bg-[#e8f3ec] text-[#17583a] font-heading font-black text-2xl rounded-full flex items-center justify-center mb-4">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h2 className="font-heading font-bold text-xl text-[#0d3a24] mb-1">{user.name}</h2>
              <p className="text-[#5f786c] text-sm mb-6">{user.email}</p>
              
              <nav className="space-y-1">
                <Link href="/account" className="flex items-center gap-3 px-4 py-3 bg-[#f4f5f1] text-[#17583a] font-semibold rounded-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  My Profile
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[#e11d48] font-semibold hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
              <div className="flex gap-4 border-b border-[#f0f2ee] mb-6">
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'orders' ? 'text-[#0d3a24]' : 'text-[#8aab99] hover:text-[#5f786c]'}`}
                >
                  Recent Orders
                  {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#17583a] rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'addresses' ? 'text-[#0d3a24]' : 'text-[#8aab99] hover:text-[#5f786c]'}`}
                >
                  Saved Addresses
                  {activeTab === 'addresses' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#17583a] rounded-t-full"></div>}
                </button>
              </div>

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
                      <h4 className="font-bold text-[#0d3a24] mb-1">No orders yet</h4>
                      <p className="text-sm text-[#5f786c]">When you place an order, it will appear here.</p>
                      <Link href="/shop" className="inline-block mt-4 text-sm font-semibold text-[#17583a] hover:underline">
                        Browse Shop
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#f4f5f1] rounded-xl gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-[#0d3a24]">{order.order_number}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                order.status === 'pending' || order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'completed' || order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                order.status === 'payment_failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-[#5f786c]">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="text-right">
                              <p className="text-xs text-[#8aab99] uppercase tracking-wider font-bold mb-0.5">Total</p>
                              <p className="font-black font-heading text-[#17583a]">{order.currency} {Number(order.total).toFixed(2)}</p>
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
                      <h4 className="font-bold text-[#0d3a24] mb-4">{editingAddress ? "Edit Address" : "Add New Address"}</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">Full Name *</label>
                            <input type="text" value={addressForm.full_name} onChange={e => setAddressForm({...addressForm, full_name: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">Phone *</label>
                            <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">Street Address *</label>
                          <input type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">City *</label>
                            <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">Postcode</label>
                            <input type="text" value={addressForm.postcode} onChange={e => setAddressForm({...addressForm, postcode: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#5f786c] mb-1.5 uppercase">Country *</label>
                            <select value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-[#d4ded7] text-sm focus:outline-none focus:border-[#17583a] bg-white">
                              <option value="EG">Egypt</option>
                              <option value="SA">Saudi Arabia</option>
                              <option value="AE">UAE</option>
                            </select>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input type="checkbox" checked={addressForm.is_default} onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})} className="rounded text-[#17583a] focus:ring-[#17583a]" />
                          <span className="text-sm text-[#0d3a24] font-medium">Set as default delivery address</span>
                        </label>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAddressForm(false)} className="px-5 py-2.5 border border-[#d4ded7] text-sm font-semibold text-[#5f786c] rounded-xl hover:bg-white transition-colors">Cancel</button>
                        <button onClick={handleSaveAddress} disabled={savingAddress || !addressForm.full_name || !addressForm.phone || !addressForm.street || !addressForm.city} className="px-5 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors disabled:opacity-50">
                          {savingAddress ? "Saving..." : "Save Address"}
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
                          <h4 className="font-bold text-[#0d3a24] mb-1">No saved addresses</h4>
                          <p className="text-sm text-[#5f786c] mb-4">Add an address for faster checkout.</p>
                          <button onClick={() => { setAddressForm({ full_name: user?.name || "", phone: "", city: "", postcode: "", country: "EG", street: "", is_default: true }); setShowAddressForm(true); setEditingAddress(null); }} className="px-6 py-2.5 bg-[#17583a] text-white text-sm font-semibold rounded-xl hover:bg-[#195b36] transition-colors">
                            Add New Address
                          </button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {userAddresses.map(addr => (
                            <div key={addr.id} className={`p-5 rounded-xl border-2 relative ${addr.is_default ? 'border-[#17583a] bg-[#e8f3ec]' : 'border-[#d4ded7] bg-white'}`}>
                              {addr.is_default && <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-[#17583a] text-white px-2 py-0.5 rounded-full">Default</span>}
                              <h4 className="font-bold text-[#0d3a24] mb-1">{addr.full_name}</h4>
                              <p className="text-sm text-[#5f786c] mb-1">{addr.phone}</p>
                              <p className="text-sm text-[#5f786c]">{addr.street}</p>
                              <p className="text-sm text-[#5f786c] mb-4">{addr.city}{addr.postcode ? `, ${addr.postcode}` : ''}, {addr.country}</p>
                              
                              <div className="flex items-center gap-3 pt-4 border-t border-[#d4ded7]/50">
                                <button onClick={() => { setAddressForm(addr); setEditingAddress(addr.id); setShowAddressForm(true); }} className="text-sm font-semibold text-[#17583a] hover:underline">Edit</button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => { setAddressForm({ full_name: user?.name || "", phone: "", city: "", postcode: "", country: "EG", street: "", is_default: false }); setShowAddressForm(true); setEditingAddress(null); }} className="p-5 rounded-xl border-2 border-dashed border-[#d4ded7] bg-[#f4f5f1] flex flex-col items-center justify-center text-[#8aab99] hover:text-[#17583a] hover:border-[#17583a] transition-colors min-h-[160px]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><path d="M12 5v14M5 12h14"/></svg>
                            <span className="font-semibold text-sm">Add New Address</span>
                          </button>
                        </div>
                      )}
                    </>
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
