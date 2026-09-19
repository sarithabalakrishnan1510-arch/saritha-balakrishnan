import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  Mail, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2,
  Truck,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../lib/store/appStore';
import { Vendor, KeralaDistrict } from '../types';
import { KERALA_DISTRICTS, VENDOR_CATEGORIES } from '../lib/constants';

export const ServicesAndCrewPage: React.FC = () => {
  const { vendors, createVendor, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [selectedVendorForContact, setSelectedVendorForContact] = useState<Vendor | null>(null);

  // New Vendor listing modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [categoryName, setCategoryName] = useState('Camera Rental');
  const [contactPerson, setContactPerson] = useState('');
  const [district, setDistrict] = useState<KeralaDistrict>('Ernakulam');
  const [city, setCity] = useState('Kochi');
  const [description, setDescription] = useState('');
  const [pricingText, setPricingText] = useState('');
  const [phonePrivate, setPhonePrivate] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    createVendor({
      business_name: businessName,
      category_name: categoryName,
      contact_person: contactPerson,
      district,
      city,
      description,
      pricing_text: pricingText,
      phone_private: phonePrivate,
    });
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
      setIsRegisterOpen(false);
      setBusinessName('');
    }, 1500);
  };

  const filteredVendors = vendors.filter(v => {
    if (currentUser?.role !== 'admin' && v.admin_status === 'rejected') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        v.business_name.toLowerCase().includes(q) ||
        v.category_name.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (categoryFilter !== 'all' && v.category_name !== categoryFilter) return false;
    if (districtFilter !== 'all' && v.district !== districtFilter) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            Production Logistics & Crew
          </span>
          <h1 className="text-3xl font-extrabold text-white font-cinematic tracking-tight">
            Services & Crew Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Verified cinema camera rentals, luxury caravans, sound trucks, stunt teams, and art props across Kerala.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow flex items-center gap-1.5 transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Your Gear / Crew</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-5 rounded-2xl bg-[#111319] border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gear, caravan, Alexa, stunt..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All 20 Service Categories</option>
              {VENDOR_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Districts (Kerala)</option>
              {KERALA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Displaying {filteredVendors.length} verified production suppliers</span>
          <span>Single-window liaison support</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <div
              key={vendor.id}
              className="rounded-2xl bg-[#13151f] border border-white/10 overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-lg group"
            >
              <div>
                <div className="h-44 w-full relative overflow-hidden bg-zinc-900">
                  <img
                    src={vendor.image_url}
                    alt={vendor.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase shadow-sm">
                      {vendor.category_name}
                    </span>
                    {vendor.verification_status === 'verified' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {vendor.business_name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{vendor.city}, {vendor.district}</span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3">
                    {vendor.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1 text-[11px]">
                    <span className="text-zinc-400">Pricing Reference:</span>
                    <p className="text-emerald-400 font-semibold">{vendor.pricing_text || 'Inquire for package'}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Contact: {vendor.contact_person}</span>
                <button
                  onClick={() => setSelectedVendorForContact(vendor)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
                >
                  Contact Supplier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Contact Modal */}
      {selectedVendorForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#14161f] border border-white/15 p-6 space-y-4 text-white">
            <h3 className="text-lg font-bold font-cinematic">{selectedVendorForContact.business_name}</h3>
            <p className="text-xs text-zinc-400">{selectedVendorForContact.category_name} • {selectedVendorForContact.city}, {selectedVendorForContact.district}</p>

            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Private Direct: <strong>{selectedVendorForContact.phone_private || '+91 94470 12345'}</strong></span>
              </div>
              {selectedVendorForContact.email_private && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>Email: {selectedVendorForContact.email_private}</span>
                </div>
              )}
              {selectedVendorForContact.website && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                  <a href={selectedVendorForContact.website} target="_blank" rel="noreferrer" className="text-emerald-400 underline">
                    {selectedVendorForContact.website}
                  </a>
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-400">
              When booking, mention <strong>Cast Kerala Production Network</strong> for verified production rates and single-window permits.
            </p>

            <button
              onClick={() => setSelectedVendorForContact(null)}
              className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Register Vendor Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#14161f] border border-white/15 p-6 space-y-4 text-white">
            <h3 className="text-lg font-bold font-cinematic">Register Production Service or Gear</h3>
            {registeredSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Service Registered!</p>
                <p className="text-xs text-zinc-400">Your listing has been submitted for moderation review.</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterVendor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Business / Firm Name *</label>
                  <input
                    required
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Malabar Cine Lights & Grips"
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Category</label>
                    <select
                      value={categoryName}
                      onChange={e => setCategoryName(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      {VENDOR_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">District</label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value as KeralaDistrict)}
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      {KERALA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={e => setContactPerson(e.target.value)}
                      placeholder="Manager Name"
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Direct Phone</label>
                    <input
                      type="text"
                      value={phonePrivate}
                      onChange={e => setPhonePrivate(e.target.value)}
                      placeholder="+91 9..."
                      className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Description of Equipment / Services</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Inventory details, technical crew support, generator ratings..."
                    className="w-full bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(false)}
                    className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Submit Listing
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
