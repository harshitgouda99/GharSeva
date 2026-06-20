import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, createAddressThunk, updateAddressThunk, deleteAddressThunk } from "../store/slices/addressesSlice";
import { MapPin, Plus, Pencil, Trash2, Loader2, CheckCircle, User, Phone } from "lucide-react";

export default function AddressManagement() {
  const dispatch = useDispatch();
  const { addresses, loading, error } = useSelector((state) => state.addresses);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    houseNo: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      houseNo: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dispatch(updateAddressThunk({ id: editingId, addressData: formData })).unwrap();
      } else {
        await dispatch(createAddressThunk(formData)).unwrap();
      }
      resetForm();
    } catch (err) {
      console.error("Address save failed", err);
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      houseNo: addr.houseNo || "",
      area: addr.area || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      isDefault: addr.isDefault || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this address?")) {
      dispatch(deleteAddressThunk(id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-primary-800">Your Addresses</h1>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-semibold">
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary-600" size={28} />
          <span className="ml-3 text-slate-500">Loading addresses...</span>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-md border border-slate-100 space-y-4 max-w-lg">
          <h2 className="text-lg font-bold text-slate-800">{editingId ? "Edit Address" : "Add New Address"}</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Name</label>
              <input 
                type="text" 
                value={formData.fullName} 
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                placeholder="John Doe" 
                required 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                placeholder="123-456-7890" 
                required 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">House / Flat / Block No.</label>
            <input 
              type="text" 
              value={formData.houseNo} 
              onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })} 
              placeholder="Apt 4B, Bldg 3" 
              required 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Area / Locality / Street</label>
            <input 
              type="text" 
              value={formData.area} 
              onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
              placeholder="Mathikere, 18th Cross" 
              required 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
              <input 
                type="text" 
                value={formData.city} 
                onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                required 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
              <input 
                type="text" 
                value={formData.state} 
                onChange={(e) => setFormData({ ...formData, state: e.target.value })} 
                required 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pincode</label>
              <input 
                type="text" 
                value={formData.pincode} 
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} 
                required 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 focus:outline-none" 
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isDefault} 
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} 
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-400" 
                />
                <span className="text-sm text-slate-700">Default address</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition text-sm font-semibold">
              {editingId ? "Update" : "Save"}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition text-sm font-semibold">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      {!loading && addresses.length === 0 && !showForm && (
        <div className="text-center py-12 text-slate-500">
          <MapPin size={40} className="mx-auto mb-3 text-slate-300" />
          <p>No saved addresses yet. Add your first address.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr._id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary-50 rounded-lg shrink-0">
                <MapPin size={18} className="text-primary-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 text-sm">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={10} /> Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Phone size={12} /> <span>{addr.phone}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {addr.houseNo}, {addr.area}<br />
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => handleEdit(addr)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(addr._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
