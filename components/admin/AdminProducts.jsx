'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Edit3, Eye, ImagePlus, Package, Percent, Plus, Save, ShoppingBag, Tag, Trash2, Users, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const emptyForm = {
  name: '',
  category: 'Luxury Pret',
  price: '',
  badge: 'NEW',
  images: '/images/p1-a.jpg, /images/p1-b.jpg',
  slug: '',
  quantity: 10,
  description: '',
  characteristics: '',
  colors: '',
  availableSizes: ''
};

const emptyCollectionForm = {
  name: '',
  slug: '',
  tag: '',
  image: '',
  description: ''
};

const emptyLookbookForm = {
  title: '',
  subtitle: '',
  image: '',
  sortOrder: ''
};

const emptyCouponForm = {
  code: '',
  discountPercent: '',
  maxUses: '',
  expiresAt: '',
  isActive: true
};

const emptyGlobalDiscountForm = {
  discountPercent: '',
  expiresAt: '',
  isActive: true
};

const orderStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

function toForm(product) {
  return {
    ...product,
    images: product.images.join(', ')
  };
}

export default function AdminProducts({ initialProducts, initialOrders = [], initialUsers = [], initialCollections = [], initialSiteContent = { aboutImage: '/images/about.jpg', heroVideo: '' }, initialLookbookItems = [], initialCoupons = [], initialGlobalDiscount = null }) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [collections, setCollections] = useState(initialCollections);
  const [lookbookItems, setLookbookItems] = useState(initialLookbookItems);
  const [siteContent, setSiteContent] = useState(initialSiteContent);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [globalDiscount, setGlobalDiscount] = useState(initialGlobalDiscount);
  const [form, setForm] = useState(emptyForm);
  const [collectionForm, setCollectionForm] = useState(emptyCollectionForm);
  const [lookbookForm, setLookbookForm] = useState(emptyLookbookForm);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [globalDiscountForm, setGlobalDiscountForm] = useState(initialGlobalDiscount ? { discountPercent: String(initialGlobalDiscount.discountPercent), expiresAt: initialGlobalDiscount.expiresAt ? initialGlobalDiscount.expiresAt.toISOString().split('T')[0] : '', isActive: initialGlobalDiscount.isActive } : emptyGlobalDiscountForm);
  const [editingId, setEditingId] = useState(null);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [editingLookbookId, setEditingLookbookId] = useState(null);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrders[0]?.id || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activePanel, setActivePanel] = useState('products');

  const totalValue = useMemo(() => products.reduce((sum, product) => sum + Number(product.price || 0), 0), [products]);
  const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(), [products]);
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) || orders[0] || null, [orders, selectedOrderId]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateCollectionField(field, value) {
    setCollectionForm((current) => ({ ...current, [field]: value }));
  }

  function updateSiteContentField(field, value) {
    setSiteContent((current) => ({ ...current, [field]: value }));
  }

  function updateLookbookField(field, value) {
    setLookbookForm((current) => ({ ...current, [field]: value }));
  }

  function updateCouponField(field, value) {
    setCouponForm((current) => ({ ...current, [field]: value }));
  }

  function updateGlobalDiscountField(field, value) {
    setGlobalDiscountForm((current) => ({ ...current, [field]: value }));
  }

  function getImageList(value = form.images) {
    return String(value || '').split(',').map((image) => image.trim()).filter(Boolean);
  }

  function setImageList(images) {
    updateField('images', images.join(', '));
  }

  async function uploadImages(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setUploading(true);
    setMessage('');

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Image upload nahi hui');
        }

        uploadedUrls.push(data.url);
      }

      setImageList([...getImageList(), ...uploadedUrls]);
      setMessage('Image upload ho gayi');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  function removeImage(imageUrl) {
    setImageList(getImageList().filter((image) => image !== imageUrl));
  }

  async function uploadCollectionImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Image upload nahi hui');
      }

      updateCollectionField('image', data.url);
      setMessage('Collection image upload ho gayi');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function uploadLookbookImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Image upload nahi hui');
      }

      updateLookbookField('image', data.url);
      setMessage('Lookbook image upload ho gayi');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function uploadAboutImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Image upload nahi hui');
      }

      const nextContent = { ...siteContent, aboutImage: data.url };
      const saveResponse = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextContent)
      });
      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.message || 'About image save nahi hui');
      }

      setSiteContent(saveData.content);
      setMessage('About image upload aur save ho gayi');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function uploadHeroVideo(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Video upload nahi hui');
      }

      const nextContent = { ...siteContent, heroVideo: data.url };
      const saveResponse = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextContent)
      });
      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.message || 'Hero video save nahi hui');
      }

      setSiteContent(saveData.content);
      setMessage('Hero video upload aur save ho gayi');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function saveSiteContent(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const response = await fetch('/api/site-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteContent)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'About image save nahi hui');
      setSaving(false);
      return;
    }

    setSiteContent(data.content);
    setMessage('About image save ho gayi');
    setSaving(false);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage('');
  }

  function resetCollectionForm() {
    setCollectionForm(emptyCollectionForm);
    setEditingCollectionId(null);
    setMessage('');
  }

  function resetLookbookForm() {
    setLookbookForm(emptyLookbookForm);
    setEditingLookbookId(null);
    setMessage('');
  }

  function resetCouponForm() {
    setCouponForm(emptyCouponForm);
    setEditingCouponId(null);
    setMessage('');
  }

  async function submitLookbookItem(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const url = editingLookbookId ? `/api/lookbook/${editingLookbookId}` : '/api/lookbook';
    const method = editingLookbookId ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lookbookForm)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Lookbook item save nahi hua');
      setSaving(false);
      return;
    }

    setLookbookItems((current) => editingLookbookId ? current.map((item) => item.id === editingLookbookId ? data.item : item).sort((a, b) => a.sortOrder - b.sortOrder) : [...current, data.item].sort((a, b) => a.sortOrder - b.sortOrder));
    resetLookbookForm();
    setMessage('Lookbook item save ho gaya');
    setSaving(false);
  }

  async function deleteLookbookItem(id) {
    const response = await fetch(`/api/lookbook/${id}`, { method: 'DELETE' });

    if (response.ok) {
      setLookbookItems((current) => current.filter((item) => item.id !== id));
      if (editingLookbookId === id) resetLookbookForm();
      setMessage('Lookbook item delete ho gaya');
    }
  }

  async function submitCoupon(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const url = editingCouponId ? `/api/coupons/${editingCouponId}` : '/api/coupons';
    const method = editingCouponId ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponForm)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Coupon save nahi hua');
      setSaving(false);
      return;
    }

    setCoupons((current) => editingCouponId ? current.map((item) => item.id === editingCouponId ? data.coupon : item) : [...current, data.coupon]);
    resetCouponForm();
    setMessage('Coupon save ho gaya');
    setSaving(false);
  }

  async function deleteCoupon(id) {
    const response = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });

    if (response.ok) {
      setCoupons((current) => current.filter((coupon) => coupon.id !== id));
      if (editingCouponId === id) resetCouponForm();
      setMessage('Coupon delete ho gaya');
    }
  }

  async function submitGlobalDiscount(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const response = await fetch('/api/global-discount', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(globalDiscountForm)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Global discount save nahi hui');
      setSaving(false);
      return;
    }

    setGlobalDiscount(data.discount);
    setMessage('Global discount save ho gaya');
    setSaving(false);
  }

  async function submitCollection(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const url = editingCollectionId ? `/api/collections/${editingCollectionId}` : '/api/collections';
    const method = editingCollectionId ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectionForm)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Collection save nahi hui');
      setSaving(false);
      return;
    }

    setCollections((current) => editingCollectionId ? current.map((item) => item.id === editingCollectionId ? data.collection : item) : [...current, data.collection]);
    resetCollectionForm();
    setMessage('Collection save ho gayi');
    setSaving(false);
  }

  async function deleteCollection(id) {
    const response = await fetch(`/api/collections/${id}`, { method: 'DELETE' });

    if (response.ok) {
      setCollections((current) => current.filter((collection) => collection.id !== id));
      if (editingCollectionId === id) resetCollectionForm();
      setMessage('Collection delete ho gayi');
    }
  }

  async function submitProduct(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    const method = editingId ? 'PUT' : 'POST';
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Product save nahi hua');
      setSaving(false);
      return;
    }

    setProducts((current) => editingId ? current.map((item) => item.id === editingId ? data.product : item) : [...current, data.product]);
    resetForm();
    setMessage('Product save ho gaya');
    setSaving(false);
  }

  async function deleteProduct(id) {
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });

    if (response.ok) {
      setProducts((current) => current.filter((product) => product.id !== id));
      if (editingId === id) resetForm();
      setMessage('Product delete ho gaya');
    }
  }

  async function updateOrderStatus(orderId, status) {
    setOrderSaving(true);
    setMessage('');

    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Order status update nahi hua');
      setOrderSaving(false);
      return;
    }

    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: data.order.status } : order));
    setMessage('Order status update ho gaya');
    setOrderSaving(false);
  }

  return (
    <main className="min-h-screen bg-obsidian pt-28 text-ivory">
      <section className="luxury-container pb-16">
        <div className="flex flex-col justify-between gap-6 border-b border-ivory/10 pb-10 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-gold">Local Admin</p>
            <h1 className="mt-3 font-display text-6xl">Admin Dashboard</h1>
          </div>
          <div className="grid grid-cols-2 gap-4 text-right md:grid-cols-4">
            <div className="rounded-3xl bg-surface p-5"><p className="text-xs uppercase tracking-[0.25em] text-muted">Products</p><p className="mt-2 text-3xl font-bold text-gold">{products.length}</p></div>
            <div className="rounded-3xl bg-surface p-5"><p className="text-xs uppercase tracking-[0.25em] text-muted">In Stock</p><p className="mt-2 text-3xl font-bold text-gold">{products.filter((product) => product.inStock).length}</p></div>
            <div className="rounded-3xl bg-surface p-5"><p className="text-xs uppercase tracking-[0.25em] text-muted">Orders</p><p className="mt-2 text-3xl font-bold text-gold">{orders.length}</p></div>
            <div className="rounded-3xl bg-surface p-5"><p className="text-xs uppercase tracking-[0.25em] text-muted">Value</p><p className="mt-2 text-xl font-bold text-gold">{formatPrice(totalValue)}</p></div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { id: 'products', label: 'Products', icon: Package },
            { id: 'collections', label: 'Collections', icon: ImagePlus },
            { id: 'lookbook', label: 'Lookbook', icon: Eye },
            { id: 'content', label: 'About Page', icon: Edit3 },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'globalDiscount', label: 'Global Discount', icon: Percent }
          ].map((panel) => {
            const Icon = panel.icon;
            return <button key={panel.id} type="button" onClick={() => setActivePanel(panel.id)} className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] transition ${activePanel === panel.id ? 'bg-gold text-obsidian' : 'bg-surface text-ivory hover:bg-ivory/10'}`}><Icon size={16} />{panel.label}</button>;
          })}
        </div>
        {activePanel === 'products' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitProduct} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-4xl">{editingId ? 'Edit Product' : 'Add Product'}</h2>{editingId && <button type="button" onClick={resetForm} className="rounded-full bg-obsidian p-2 text-ivory"><X size={18} /></button>}</div>
            <div className="space-y-4">
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required placeholder="Product name" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <div className="grid grid-cols-2 gap-3"><input value={form.category} onChange={(event) => updateField('category', event.target.value)} required placeholder="Category" list="admin-categories" className="rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" /><input value={form.badge} onChange={(event) => updateField('badge', event.target.value)} placeholder="Badge" className="rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" /></div>
              <datalist id="admin-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
              <div className="grid grid-cols-2 gap-3"><input value={form.price} onChange={(event) => updateField('price', event.target.value)} required type="number" placeholder="Price" className="rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" /><input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="Slug optional" className="rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" /></div>
              <div className="rounded-2xl border border-obsidian/15 p-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-gold hover:text-obsidian">
                  <ImagePlus size={18} />
                  {uploading ? 'Uploading...' : 'Upload Product Images'}
                  <input type="file" accept="image/*" multiple disabled={uploading} onChange={uploadImages} className="hidden" />
                </label>
                <input value={form.images} onChange={(event) => updateField('images', event.target.value)} required placeholder="Image URLs comma separated" className="mt-3 w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
                {getImageList().length > 0 && <div className="mt-4 grid grid-cols-3 gap-3">{getImageList().map((image) => <div key={image} className="relative h-24 overflow-hidden rounded-2xl border border-obsidian/10 bg-white"><Image src={image} alt="Product preview" fill sizes="120px" className="object-cover" /><button type="button" onClick={() => removeImage(image)} className="absolute right-2 top-2 rounded-full bg-obsidian p-1 text-ivory"><X size={14} /></button></div>)}</div>}
              </div>
              <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} required placeholder="Description" rows={5} className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em]">Characteristics (comma separated)</label>
                <input value={form.characteristics} onChange={(event) => updateField('characteristics', event.target.value)} placeholder="🔥 Best Sellers, ⭐ Most Popular, 🛒 Customers&apos; Choice" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
                <p className="mt-1 text-xs text-obsidian/60">Examples: 🔥 Best Sellers, ⭐ Most Popular, 🛒 Customers&apos; Choice</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em]">Colors (comma separated)</label>
                <input value={form.colors} onChange={(event) => updateField('colors', event.target.value)} placeholder="Black, White, Red, Blue" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
                <p className="mt-1 text-xs text-obsidian/60">Available colors for this product</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em]">Available Sizes (comma separated)</label>
                <input value={form.availableSizes} onChange={(event) => updateField('availableSizes', event.target.value)} placeholder="XS, S, M, L, XL" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
                <p className="mt-1 text-xs text-obsidian/60">Available sizes for this product</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em]">Quantity</label>
                <input value={form.quantity} onChange={(event) => updateField('quantity', event.target.value)} type="number" min="0" placeholder="Quantity in stock" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
                <p className="mt-1 text-xs text-obsidian/60">0 = Sold Out, 1-10 = Limited Stock, 10+ = Available</p>
              </div>
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-gold hover:text-obsidian disabled:opacity-60">{editingId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}</button>
              {message && <p className="text-center text-sm font-bold text-gold">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[780px]">
                <div className="sticky top-0 z-10 grid grid-cols-[70px_1.4fr_1fr_120px_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>ID</span><span>Name</span><span>Category</span><span>Price</span><span>Actions</span></div>
                <div className="divide-y divide-ivory/10">{products.map((product) => <div key={product.id} className="grid grid-cols-[70px_1.4fr_1fr_120px_140px] items-center gap-4 px-6 py-4"><span className="text-muted">#{product.id}</span><div><p className="font-display text-2xl">{product.name}</p><p className="text-xs uppercase tracking-[0.2em] text-gold">{product.badge || 'No Badge'} · {product.stockStatus === 'available' ? 'Available' : product.stockStatus === 'limited' ? 'Limited Stock' : 'Sold Out'} · Qty: {product.quantity}</p></div><span className="text-ivory/75">{product.category}</span><span className="font-bold text-gold">{formatPrice(product.price)}</span><div className="flex gap-2"><button onClick={() => { setEditingId(product.id); setForm(toForm(product)); }} className="rounded-full bg-ivory/10 p-3 transition hover:bg-gold hover:text-obsidian"><Edit3 size={16} /></button><button onClick={() => deleteProduct(product.id)} className="rounded-full bg-ivory/10 p-3 transition hover:bg-red-500"><Trash2 size={16} /></button></div></div>)}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'collections' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitCollection} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-4xl">{editingCollectionId ? 'Edit Collection' : 'Add Collection'}</h2>{editingCollectionId && <button type="button" onClick={resetCollectionForm} className="rounded-full bg-obsidian p-2 text-ivory"><X size={18} /></button>}</div>
            <div className="space-y-4">
              <input value={collectionForm.name} onChange={(event) => updateCollectionField('name', event.target.value)} required placeholder="Collection name" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <div className="grid grid-cols-2 gap-3"><input value={collectionForm.slug} onChange={(event) => updateCollectionField('slug', event.target.value)} placeholder="Slug optional" className="rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" /><input value={collectionForm.tag} onChange={(event) => updateCollectionField('tag', event.target.value)} placeholder="Tag" className="rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" /></div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-gold hover:text-obsidian">
                <ImagePlus size={18} />
                {uploading ? 'Uploading...' : 'Upload Collection Image'}
                <input type="file" accept="image/*" disabled={uploading} onChange={uploadCollectionImage} className="hidden" />
              </label>
              <input value={collectionForm.image} onChange={(event) => updateCollectionField('image', event.target.value)} required placeholder="Collection image URL" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              {collectionForm.image && <div className="relative h-44 overflow-hidden rounded-2xl border border-obsidian/10 bg-white"><Image src={collectionForm.image} alt="Collection preview" fill sizes="420px" className="object-cover" /></div>}
              <textarea value={collectionForm.description} onChange={(event) => updateCollectionField('description', event.target.value)} required placeholder="Description" rows={5} className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-gold hover:text-obsidian disabled:opacity-60">{editingCollectionId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving...' : editingCollectionId ? 'Save Changes' : 'Add Collection'}</button>
              {message && <p className="text-center text-sm font-bold text-gold">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[760px]">
                <div className="sticky top-0 z-10 grid grid-cols-[90px_1.2fr_1fr_1fr_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Image</span><span>Name</span><span>Slug</span><span>Tag</span><span>Actions</span></div>
                <div className="divide-y divide-ivory/10">{collections.map((collection) => <div key={collection.id} className="grid grid-cols-[90px_1.2fr_1fr_1fr_140px] items-center gap-4 px-6 py-4"><div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-obsidian"><Image src={collection.image} alt={collection.name} fill sizes="64px" className="object-cover" /></div><div><p className="font-display text-2xl">{collection.name}</p><p className="line-clamp-1 text-xs text-ivory/50">{collection.description}</p></div><span className="text-ivory/75">{collection.slug}</span><span className="text-gold">{collection.tag}</span><div className="flex gap-2"><button onClick={() => { setEditingCollectionId(collection.id); setCollectionForm(collection); }} className="rounded-full bg-ivory/10 p-3 transition hover:bg-gold hover:text-obsidian"><Edit3 size={16} /></button><button onClick={() => deleteCollection(collection.id)} className="rounded-full bg-ivory/10 p-3 transition hover:bg-red-500"><Trash2 size={16} /></button></div></div>)}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'lookbook' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitLookbookItem} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-4xl">{editingLookbookId ? 'Edit Lookbook' : 'Add Lookbook'}</h2>{editingLookbookId && <button type="button" onClick={resetLookbookForm} className="rounded-full bg-obsidian p-2 text-ivory"><X size={18} /></button>}</div>
            <div className="space-y-4">
              <input value={lookbookForm.title} onChange={(event) => updateLookbookField('title', event.target.value)} required placeholder="Title" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <div className="grid grid-cols-2 gap-3"><input value={lookbookForm.subtitle} onChange={(event) => updateLookbookField('subtitle', event.target.value)} required placeholder="Subtitle" className="rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" /><input value={lookbookForm.sortOrder} onChange={(event) => updateLookbookField('sortOrder', event.target.value)} type="number" placeholder="Sort order" className="rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" /></div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-gold hover:text-obsidian">
                <ImagePlus size={18} />
                {uploading ? 'Uploading...' : 'Upload Lookbook Image'}
                <input type="file" accept="image/*" disabled={uploading} onChange={uploadLookbookImage} className="hidden" />
              </label>
              <input value={lookbookForm.image} onChange={(event) => updateLookbookField('image', event.target.value)} required placeholder="Image URL" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              {lookbookForm.image && <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-obsidian/10 bg-white"><Image src={lookbookForm.image} alt="Lookbook preview" fill sizes="420px" className="object-cover" /></div>}
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-gold hover:text-obsidian disabled:opacity-60">{editingLookbookId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving...' : editingLookbookId ? 'Save Changes' : 'Add Lookbook'}</button>
              {message && <p className="text-center text-sm font-bold text-gold">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[760px]">
                <div className="sticky top-0 z-10 grid grid-cols-[90px_1.2fr_1fr_100px_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Image</span><span>Title</span><span>Subtitle</span><span>Order</span><span>Actions</span></div>
                <div className="divide-y divide-ivory/10">{lookbookItems.map((item) => <div key={item.id} className="grid grid-cols-[90px_1.2fr_1fr_100px_140px] items-center gap-4 px-6 py-4"><div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-obsidian"><Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" /></div><p className="font-display text-2xl">{item.title}</p><span className="text-gold">{item.subtitle}</span><span className="text-ivory/75">{item.sortOrder}</span><div className="flex gap-2"><button onClick={() => { setEditingLookbookId(item.id); setLookbookForm({ ...item, sortOrder: String(item.sortOrder) }); }} className="rounded-full bg-ivory/10 p-3 transition hover:bg-gold hover:text-obsidian"><Edit3 size={16} /></button><button onClick={() => deleteLookbookItem(item.id)} className="rounded-full bg-ivory/10 p-3 transition hover:bg-red-500"><Trash2 size={16} /></button></div></div>)}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'content' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={saveSiteContent} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6"><h2 className="font-display text-4xl">Hero Section Video</h2><p className="mt-2 text-sm text-obsidian/60">Hero section ke liye video upload ya URL se edit karein.</p></div>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-gold hover:text-obsidian">
                <ImagePlus size={18} />
                {uploading ? 'Uploading...' : 'Upload Hero Video'}
                <input type="file" accept="video/*" disabled={uploading} onChange={uploadHeroVideo} className="hidden" />
              </label>
              <input value={siteContent.heroVideo} onChange={(event) => updateSiteContentField('heroVideo', event.target.value)} placeholder="Hero video URL" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              {siteContent.heroVideo && <div className="relative aspect-video overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian">
                <video src={siteContent.heroVideo} controls className="h-full w-full object-cover" />
              </div>}
              <div className="border-t border-obsidian/10 pt-6">
                <h3 className="mb-4 font-display text-2xl">About Page Image</h3>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-gold hover:text-obsidian">
                  <ImagePlus size={18} />
                  {uploading ? 'Uploading...' : 'Upload About Image'}
                  <input type="file" accept="image/*" disabled={uploading} onChange={uploadAboutImage} className="hidden" />
                </label>
                <input value={siteContent.aboutImage} onChange={(event) => updateSiteContentField('aboutImage', event.target.value)} required placeholder="About image URL" className="mt-3 w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              </div>
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-gold hover:text-obsidian disabled:opacity-60"><Save size={18} />{saving ? 'Saving...' : 'Save Changes'}</button>
              {message && <p className="text-center text-sm font-bold text-gold">{message}</p>}
            </div>
          </form>
          <div className="rounded-[2rem] bg-surface p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-muted">Current About Preview</p>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-obsidian"><Image src={siteContent.aboutImage} alt="About page preview" fill sizes="50vw" className="object-cover" /></div>
          </div>
        </div>}
        {activePanel === 'orders' && <div className="grid gap-8 py-12 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[900px]">
                <div className="sticky top-0 z-10 grid grid-cols-[140px_1fr_150px_140px_140px_80px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Order</span><span>Customer</span><span>Status</span><span>Date</span><span>Total</span><span>View</span></div>
                <div className="divide-y divide-ivory/10">{orders.length ? orders.map((order) => <button key={order.id} type="button" onClick={() => setSelectedOrderId(order.id)} className={`grid w-full grid-cols-[140px_1fr_150px_140px_140px_80px] items-center gap-4 px-6 py-4 text-left transition hover:bg-ivory/5 ${selectedOrder?.id === order.id ? 'bg-gold/10' : ''}`}><span className="font-bold text-gold">{order.id}</span><span><span className="block font-semibold">{order.customer?.name || 'Unknown Customer'}</span><span className="block text-xs text-ivory/50">{order.customer?.email || 'No email'}</span></span><span>{order.status}</span><span className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</span><span className="font-bold text-gold">{formatPrice(order.total)}</span><span className="text-ivory/70"><Eye size={18} /></span></button>) : <div className="px-6 py-10 text-center text-muted">Abhi koi order nahi hai.</div>}</div>
              </div>
            </div>
          </div>
          <aside className="rounded-[2rem] bg-ivory p-6 text-obsidian">
            {selectedOrder ? <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-obsidian/50">Order Details</p>
                  <h2 className="mt-2 font-display text-4xl">{selectedOrder.id}</h2>
                </div>
                <span className="rounded-full bg-obsidian px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">{selectedOrder.status}</span>
              </div>
              <div className="mt-7 space-y-5">
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Customer</p><p className="mt-1 font-display text-3xl">{selectedOrder.customer?.name || 'Unknown Customer'}</p><p className="text-sm text-obsidian/60">{selectedOrder.customer?.email || 'No email available'}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Status Change</p><select value={selectedOrder.status} disabled={orderSaving} onChange={(event) => updateOrderStatus(selectedOrder.id, event.target.value)} className="mt-2 w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 font-semibold outline-none focus:border-gold">{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Date</p><p className="mt-1 font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Items</p><div className="mt-3 divide-y divide-obsidian/10 rounded-2xl border border-obsidian/10">{selectedOrder.items.map((item) => <div key={`${selectedOrder.id}-${item.name}-${item.size}`} className="flex justify-between gap-4 p-4 text-sm"><div><p className="font-bold">{item.name}</p><p className="text-obsidian/55">Size {item.size} · Qty {item.quantity}</p></div><p className="font-bold text-gold">{formatPrice(item.price * item.quantity)}</p></div>)}</div></div>
                <div className="flex items-center justify-between rounded-2xl bg-obsidian px-5 py-4 text-ivory"><span className="text-sm font-bold uppercase tracking-[0.2em] text-ivory/60">Total</span><span className="text-xl font-bold text-gold">{formatPrice(selectedOrder.total)}</span></div>
                {message && <p className="text-center text-sm font-bold text-gold">{message}</p>}
              </div>
            </> : <div className="py-10 text-center text-obsidian/60">Order select karein.</div>}
          </aside>
        </div>}
        {activePanel === 'users' && <div className="py-12">
          <div className="overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[680px]">
                <div className="sticky top-0 z-10 grid grid-cols-[1fr_1.4fr_120px_160px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Name</span><span>Email</span><span>Role</span><span>Joined</span></div>
                <div className="divide-y divide-ivory/10">{initialUsers.length ? initialUsers.map((user) => <div key={user.id} className="grid grid-cols-[1fr_1.4fr_120px_160px] items-center gap-4 px-6 py-4"><span className="font-display text-2xl">{user.name || 'No Name'}</span><span className="text-gold">{user.email}</span><span>{user.user === 1 ? 'Admin' : 'Customer'}</span><span className="text-muted">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span></div>) : <div className="px-6 py-10 text-center text-muted">Abhi koi user nahi hai.</div>}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'coupons' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitCoupon} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-4xl">{editingCouponId ? 'Edit Coupon' : 'Add Coupon'}</h2>{editingCouponId && <button type="button" onClick={resetCouponForm} className="rounded-full bg-obsidian p-2 text-ivory"><X size={18} /></button>}</div>
            <div className="space-y-4">
              <input value={couponForm.code} onChange={(event) => updateCouponField('code', event.target.value)} required placeholder="Coupon Code (e.g., SUMMER20)" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold uppercase" />
              <input value={couponForm.discountPercent} onChange={(event) => updateCouponField('discountPercent', event.target.value)} required type="number" min="1" max="100" placeholder="Discount Percentage (e.g., 20)" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <input value={couponForm.maxUses} onChange={(event) => updateCouponField('maxUses', event.target.value)} type="number" min="0" placeholder="Max Uses (0 for unlimited)" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <input value={couponForm.expiresAt} onChange={(event) => updateCouponField('expiresAt', event.target.value)} type="date" placeholder="Expiration Date (optional)" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em]"><input type="checkbox" checked={couponForm.isActive} onChange={(event) => updateCouponField('isActive', event.target.checked)} /> Active</label>
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-gold hover:text-obsidian disabled:opacity-60">{editingCouponId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving...' : editingCouponId ? 'Save Changes' : 'Add Coupon'}</button>
              {message && <p className="text-center text-sm font-bold text-gold">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[800px]">
                <div className="sticky top-0 z-10 grid grid-cols-[120px_1fr_100px_100px_120px_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Code</span><span>Discount</span><span>Used</span><span>Max</span><span>Status</span><span>Actions</span></div>
                <div className="divide-y divide-ivory/10">{coupons.length ? coupons.map((coupon) => <div key={coupon.id} className="grid grid-cols-[120px_1fr_100px_100px_120px_140px] items-center gap-4 px-6 py-4"><span className="font-display text-2xl text-gold">{coupon.code}</span><span>{coupon.discountPercent}%</span><span className="text-muted">{coupon.usedCount}</span><span className="text-muted">{coupon.maxUses === 0 ? 'Unlimited' : coupon.maxUses}</span><span className={coupon.isActive ? 'text-green-400' : 'text-red-400'}>{coupon.isActive ? 'Active' : 'Inactive'}</span><div className="flex gap-2"><button onClick={() => { setEditingCouponId(coupon.id); setCouponForm({ code: coupon.code, discountPercent: String(coupon.discountPercent), maxUses: String(coupon.maxUses), expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString().split('T')[0] : '', isActive: coupon.isActive }); }} className="rounded-full bg-ivory/10 p-3 transition hover:bg-gold hover:text-obsidian"><Edit3 size={16} /></button><button onClick={() => deleteCoupon(coupon.id)} className="rounded-full bg-ivory/10 p-3 transition hover:bg-red-500"><Trash2 size={16} /></button></div></div>) : <div className="px-6 py-10 text-center text-muted">Abhi koi coupon nahi hai.</div>}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'globalDiscount' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitGlobalDiscount} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6"><h2 className="font-display text-4xl">Global Discount</h2><p className="mt-2 text-sm text-obsidian/60">Sabhi products par overall discount set karein.</p></div>
            <div className="space-y-4">
              <input value={globalDiscountForm.discountPercent} onChange={(event) => updateGlobalDiscountField('discountPercent', event.target.value)} required type="number" min="1" max="100" placeholder="Discount Percentage (e.g., 20)" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <input value={globalDiscountForm.expiresAt} onChange={(event) => updateGlobalDiscountField('expiresAt', event.target.value)} type="date" placeholder="Expiration Date (optional)" className="w-full rounded-2xl border border-obsidian/15 px-4 py-3 outline-none focus:border-gold" />
              <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em]"><input type="checkbox" checked={globalDiscountForm.isActive} onChange={(event) => updateGlobalDiscountField('isActive', event.target.checked)} /> Active</label>
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-gold hover:text-obsidian disabled:opacity-60">{saving ? 'Saving...' : 'Save Global Discount'}</button>
              {message && <p className="text-center text-sm font-bold text-gold">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface p-7">
            <h2 className="font-display text-3xl mb-6">Current Global Discount</h2>
            {globalDiscount ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-ivory/10">
                  <span className="text-ivory/75">Discount Percentage</span>
                  <span className="font-display text-3xl text-gold">{globalDiscount.discountPercent}%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-ivory/10">
                  <span className="text-ivory/75">Status</span>
                  <span className={globalDiscount.isActive ? 'text-green-400' : 'text-red-400'}>{globalDiscount.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ivory/75">Expires At</span>
                  <span className="text-gold">{globalDiscount.expiresAt ? new Date(globalDiscount.expiresAt).toLocaleDateString() : 'No expiration'}</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted">Abhi koi global discount nahi hai.</p>
            )}
          </div>
        </div>}
      </section>
    </main>
  );
}
