'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { LocalStore } from '@/lib/store';
import { Shop, Category, MenuItem } from '@/lib/types/database.types';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FolderPlus,
  Check,
  X,
  Search,
  Sparkles,
  Leaf,
  Beef,
} from 'lucide-react';

export default function MenuEditorPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add/Edit Category
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catNameInput, setCatNameInput] = useState('');

  // Modal State for Add/Edit Menu Item
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    is_veg: true,
    is_available: true,
  });

  useEffect(() => {
    setShop(LocalStore.getShop());
    setCategories(LocalStore.getCategories());
    const items = LocalStore.getMenuItems();
    setMenuItems(items);
    if (categories.length > 0 && !itemForm.category_id) {
      setItemForm(prev => ({ ...prev, category_id: categories[0].id }));
    }
  }, []);

  // Quick 5-second Availability Toggle (Instant 1-tap operation)
  const handleToggleAvailability = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = LocalStore.toggleItemAvailability(itemId);
    setMenuItems(updated);
  };

  // Category CRUD
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;

    let updated: Category[];
    if (editingCat) {
      updated = categories.map(c =>
        c.id === editingCat.id ? { ...c, name: catNameInput } : c
      );
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        shop_id: shop?.id || 'shop-demo',
        name: catNameInput.trim(),
        sort_order: categories.length + 1,
        created_at: new Date().toISOString(),
      };
      updated = [...categories, newCat];
    }

    setCategories(updated);
    LocalStore.saveCategories(updated);
    setCatModalOpen(false);
    setCatNameInput('');
    setEditingCat(null);
  };

  const handleDeleteCategory = (catId: string) => {
    if (!confirm('Are you sure? Items in this category will also be affected.')) return;
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    LocalStore.saveCategories(updated);
  };

  // Item CRUD
  const openAddItemModal = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      price: '',
      category_id: categories[0]?.id || '',
      image_url: '',
      is_veg: true,
      is_available: true,
    });
    setItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category_id: item.category_id,
      image_url: item.image_url,
      is_veg: item.is_veg,
      is_available: item.is_available,
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price || !itemForm.category_id) return;

    let updated: MenuItem[];
    if (editingItem) {
      updated = menuItems.map(m =>
        m.id === editingItem.id
          ? {
              ...m,
              name: itemForm.name,
              description: itemForm.description,
              price: parseFloat(itemForm.price),
              category_id: itemForm.category_id,
              image_url: itemForm.image_url,
              is_veg: itemForm.is_veg,
              is_available: itemForm.is_available,
            }
          : m
      );
    } else {
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        shop_id: shop?.id || 'shop-demo',
        category_id: itemForm.category_id,
        name: itemForm.name,
        description: itemForm.description,
        price: parseFloat(itemForm.price),
        image_url: itemForm.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
        is_veg: itemForm.is_veg,
        is_available: itemForm.is_available,
        sort_order: menuItems.length + 1,
        created_at: new Date().toISOString(),
      };
      updated = [newItem, ...menuItems];
    }

    setMenuItems(updated);
    LocalStore.saveMenuItems(updated);
    setItemModalOpen(false);
  };

  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this item from menu?')) return;
    const updated = menuItems.filter(m => m.id !== itemId);
    setMenuItems(updated);
    LocalStore.saveMenuItems(updated);
  };

  // Filtered Items
  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <Navbar shopSlug={shop?.slug} shopName={shop?.name} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <UtensilsCrossed className="w-7 h-7 text-amber-500" />
              <span>Menu Manager</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Add items, manage categories, or toggle <span className="text-amber-400 font-semibold">Available / Sold Out</span> in under 5 seconds.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setEditingCat(null);
                setCatNameInput('');
                setCatModalOpen(true);
              }}
              className="py-2.5 px-4 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>Add Category</span>
            </button>

            <button
              onClick={openAddItemModal}
              className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>

        {/* Categories Bar & Search Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Items ({menuItems.length})
            </button>

            {categories.map(cat => {
              const count = menuItems.filter(m => m.category_id === cat.id).length;
              return (
                <div key={cat.id} className="flex items-center group">
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCat(cat);
                      setCatNameInput(cat.name);
                      setCatModalOpen(true);
                    }}
                    className="p-1 text-slate-500 hover:text-amber-400 ml-1 transition"
                    title="Edit category"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition relative shadow-lg ${
                item.is_available
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-rose-900/40 bg-slate-900/60 opacity-80'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold ${
                        item.is_veg
                          ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                          : 'border-rose-500 text-rose-400 bg-rose-950/40'
                      }`}
                    >
                      {item.is_veg ? (
                        <>
                          <Leaf className="w-2.5 h-2.5 mr-0.5" /> VEG
                        </>
                      ) : (
                        <>
                          <Beef className="w-2.5 h-2.5 mr-0.5" /> NON-VEG
                        </>
                      )}
                    </span>
                    <span className="text-xs font-semibold text-amber-400">₹{item.price}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditItemModal(item)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/80 rounded-lg transition"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 my-2">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                    />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{item.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                </div>
              </div>

              {/* 5-SECOND QUICK AVAILABILITY TOGGLE BUTTON */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status:
                </span>
                <button
                  onClick={(e) => handleToggleAvailability(item.id, e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 shadow ${
                    item.is_available
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                  }`}
                  title="Toggle Available vs Sold Out in <5s"
                >
                  {item.is_available ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                      <span>AVAILABLE</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-rose-400" />
                      <span>SOLD OUT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <UtensilsCrossed className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">No menu items found in this section.</p>
              <button
                onClick={openAddItemModal}
                className="mt-3 inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add first item</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* CATEGORY MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCat ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  placeholder="e.g. Desserts & Shakes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                {editingCat && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCat.id)}
                    className="py-2 px-3 bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/30 hover:bg-rose-500/30 transition"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="py-2 px-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENU ITEM MODAL */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setItemModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="e.g. Masala Chai"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    placeholder="25"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
                <select
                  value={itemForm.category_id}
                  onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Ingredients or details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  value={itemForm.image_url}
                  onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_veg}
                    onChange={(e) => setItemForm({ ...itemForm, is_veg: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Vegetarian Item</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_available}
                    onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Currently Available</span>
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
                >
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
