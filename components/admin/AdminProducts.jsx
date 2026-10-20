'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit3, Eye, ImagePlus, Package, Percent, Plus, Save, ShoppingBag, Star, Tag, Trash2, Users, X, Video } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { handleFormError, getLastError } from '@/lib/errorHandler';

const emptyForm = {
  name: '',
  category: 'Living Room',
  price: '',
  badge: 'NEW',
  images: '/images/man.jpg',
  video: '',
  slug: '',
  quantity: 10,
  description: '',
  characteristics: '',
  colors: '',
  colorQuantities: '{}',
  allowCustomMeasurements: false,
  colorImages: '{}'
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

const orderStatuses = ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

function toForm(product) {
  return {
    ...product,
    images: product.images.join(', '),
    colorQuantities: JSON.stringify(product.colorQuantities || {}),
    colorImages: JSON.stringify(product.colorImages || {})
  };
}

export default function AdminProducts({ initialProducts, initialOrders = [], initialUsers = [], initialCollections = [], initialSiteContent = { aboutImage: '/images/about.jpg', heroVideo: '', heroImage: '', heroType: 'video', newArrivalsProductIds: [] }, initialLookbookItems = [], initialCoupons = [], initialGlobalDiscount = null }) {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [collections, setCollections] = useState(initialCollections);
  const [lookbookItems, setLookbookItems] = useState(initialLookbookItems);
  const [siteContent, setSiteContent] = useState(initialSiteContent);
  const [selectedNewArrivals, setSelectedNewArrivals] = useState(initialSiteContent?.newArrivalsProductIds || []);
  const [heroType, setHeroType] = useState(initialSiteContent?.heroType || 'video');
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

  useEffect(() => {
    // Check for previous form error
    const lastError = getLastError();
    if (lastError) {
      setMessage(lastError);
    }
  }, []);

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

  function toggleNewArrival(productId) {
    setSelectedNewArrivals((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }

  async function saveNewArrivals() {
    setSaving(true);
    setMessage('');

    try {
      const nextContent = { ...siteContent, newArrivalsProductIds: selectedNewArrivals };
      const response = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextContent)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'New Arrivals save nahi hui');
      }

      setSiteContent(data.content);
      setMessage('New Arrivals save ho gayi');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
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
      // Get upload parameters from our API
      const paramsResponse = await fetch('/api/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      const params = await paramsResponse.json();

      if (!paramsResponse.ok) {
        throw new Error(params.message || 'Failed to get upload parameters');
      }

      // Upload directly to Cloudinary to bypass Vercel limits
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('api_key', params.apiKey);
      uploadFormData.append('timestamp', String(params.timestamp));
      uploadFormData.append('folder', params.folder);
      uploadFormData.append('signature', params.signature);
      uploadFormData.append('resource_type', params.resource_type);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${params.cloudName}/video/upload`,
        {
          method: 'POST',
          body: uploadFormData
        }
      );
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData?.error?.message || 'Video upload failed');
      }

      const nextContent = { ...siteContent, heroVideo: uploadData.secure_url };
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

  async function uploadHeroImage(event) {
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

      const nextContent = { ...siteContent, heroImage: data.url };
      const saveResponse = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextContent)
      });
      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.message || 'Hero image save nahi hui');
      }

      setSiteContent(saveData.content);
      setMessage('Hero image upload aur save ho gayi');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function uploadProductVideo(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      // Get upload parameters from our API
      const paramsResponse = await fetch('/api/upload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      const params = await paramsResponse.json();

      if (!paramsResponse.ok) {
        throw new Error(params.message || 'Failed to get upload parameters');
      }

      // Upload directly to Cloudinary to bypass Vercel limits
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('api_key', params.apiKey);
      uploadFormData.append('timestamp', String(params.timestamp));
      uploadFormData.append('folder', params.folder);
      uploadFormData.append('signature', params.signature);
      uploadFormData.append('resource_type', params.resource_type);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${params.cloudName}/video/upload`,
        {
          method: 'POST',
          body: uploadFormData
        }
      );
      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData?.error?.message || 'Video upload failed');
      }

      updateField('video', uploadData.secure_url);
      setMessage('Product video upload ho gayi');
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

    try {
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
    } catch (error) {
      handleFormError(error, 'Lookbook item save failed. Please try again.');
    }
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

    try {
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
    } catch (error) {
      handleFormError(error, 'Coupon save failed. Please try again.');
    }
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

    try {
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
    } catch (error) {
      handleFormError(error, 'Global discount save failed. Please try again.');
    }
  }

  async function submitCollection(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
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
    } catch (error) {
      handleFormError(error, 'Collection save failed. Please try again.');
    }
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

    try {
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
    } catch (error) {
      handleFormError(error, 'Product save failed. Please try again.');
    }
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

  async function verifyPayment(orderId, verified) {
    setOrderSaving(true);
    setMessage('');

    const response = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified })
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Payment verification nahi hui');
      setOrderSaving(false);
      return;
    }

    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: data.order.status, paymentVerified: data.order.paymentVerified } : order));
    if (selectedOrder?.id === orderId) {
      setSelectedOrderId(null);
    }
    setMessage(verified ? 'Payment verified aur order confirm ho gaya' : 'Payment rejected');
    setOrderSaving(false);
  }

  return (
    <main className="min-h-screen bg-obsidian pt-28 text-ivory">
      <section className="luxury-container pb-16">
        <div className="flex flex-col justify-between gap-6 border-b border-ivory/10 pb-10 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-wood">Local Admin</p>
            <h1 className="mt-3 font-display text-6xl">Admin Dashboard</h1>
          </div>
          <div className="grid grid-cols-2 gap-4 text-right md:grid-cols-4">
            <div className="rounded-3xl bg-surface p-5"><p className="text-xs uppercase tracking-[0.25em] text-muted">Products</p><p className="mt-2 text-3xl font-bold text-wood">{products.length}</p></div>
            <div className="rounded-3xl bg-surface p-5"><p className="text-xs uppercase tracking-[0.25em] text-muted">In Stock</p><p className="mt-2 text-3xl font-bold text-wood">{products.filter((product) => product.inStock).length}</p></div>
            <div className="rounded-3xl bg-surface p-5"><p className="text-xs uppercase tracking-[0.25em] text-muted">Orders</p><p className="mt-2 text-3xl font-bold text-wood">{orders.length}</p></div>
            <div className="rounded-3xl bg-surface p-5"><p className="text-xs uppercase tracking-[0.25em] text-muted">Value</p><p className="mt-2 text-xl font-bold text-wood">{formatPrice(totalValue)}</p></div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { id: 'products', label: 'Products', icon: Package },
            { id: 'collections', label: 'Collections', icon: ImagePlus },
            { id: 'lookbook', label: 'Lookbook', icon: Eye },
            { id: 'newArrivals', label: 'New Arrivals', icon: Star },
            { id: 'content', label: 'About Page', icon: Edit3 },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'globalDiscount', label: 'Global Discount', icon: Percent }
          ].map((panel) => {
            const Icon = panel.icon;
            return <button key={panel.id} type="button" onClick={() => setActivePanel(panel.id)} className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] transition ${activePanel === panel.id ? 'bg-wood text-obsidian' : 'bg-surface text-ivory hover:bg-ivory/10'}`}><Icon size={16} />{panel.label}</button>;
          })}
        </div>
        {activePanel === 'products' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitProduct} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-4xl">{editingId ? 'Edit Product' : 'Add Product'}</h2>{editingId && <button type="button" onClick={resetForm} className="rounded-full bg-obsidian p-2 text-ivory"><X size={18} /></button>}</div>
            <div className="space-y-4">
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required placeholder="Product name" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <div className="grid grid-cols-2 gap-3"><input value={form.category} onChange={(event) => updateField('category', event.target.value)} required placeholder="Category" list="admin-categories" className="rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" /><input value={form.badge} onChange={(event) => updateField('badge', event.target.value)} placeholder="Badge" className="rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" /></div>
              <datalist id="admin-categories">{categories.map((category) => <option key={category} value={category} />)}</datalist>
              <div className="grid grid-cols-2 gap-3"><input value={form.price} onChange={(event) => updateField('price', event.target.value)} required type="number" placeholder="Price" className="rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" /><input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="Slug optional" className="rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" /></div>
              <div className="rounded-2xl border border-obsidian/15 p-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-wood hover:text-obsidian">
                  <ImagePlus size={18} />
                  {uploading ? 'Uploading...' : 'Upload Product Images'}
                  <input type="file" accept="image/*" multiple disabled={uploading} onChange={uploadImages} className="hidden" />
                </label>
                <input value={form.images} onChange={(event) => updateField('images', event.target.value)} required placeholder="Image URLs comma separated" className="mt-3 w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
                {getImageList().length > 0 && <div className="mt-4 grid grid-cols-3 gap-3">{getImageList().map((image) => <div key={image} className="relative h-24 overflow-hidden rounded-2xl border border-obsidian/10 bg-white"><Image src={image} alt="Product preview" fill sizes="120px" className="object-cover" /><button type="button" onClick={() => removeImage(image)} className="absolute right-2 top-2 rounded-full bg-obsidian p-1 text-ivory"><X size={14} /></button></div>)}</div>}
              </div>
              <div className="rounded-2xl border border-obsidian/15 p-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-wood hover:text-obsidian">
                  <Video size={18} />
                  {uploading ? 'Uploading...' : 'Upload Product Video'}
                  <input type="file" accept="video/*" disabled={uploading} onChange={uploadProductVideo} className="hidden" />
                </label>
                <input value={form.video} onChange={(event) => updateField('video', event.target.value)} placeholder="Video URL (optional)" className="mt-3 w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
                {form.video && <div className="mt-4"><video src={form.video} controls className="w-full rounded-2xl border border-obsidian/10" style={{ maxHeight: '200px' }} /></div>}
              </div>
              <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} required placeholder="Description" rows={5} className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em]">Characteristics (comma separated)</label>
                <input value={form.characteristics} onChange={(event) => updateField('characteristics', event.target.value)} placeholder="🔥 Best Sellers, ⭐ Most Popular, 🛒 Customers&apos; Choice" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
                <p className="mt-1 text-xs text-obsidian/60">Examples: 🔥 Best Sellers, ⭐ Most Popular, 🛒 Customers&apos; Choice</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em]">Colors (comma separated)</label>
                <input value={form.colors} onChange={(event) => updateField('colors', event.target.value)} placeholder="Black, White, Red, Blue" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
                <p className="mt-1 text-xs text-obsidian/60">Available colors for this product</p>
              </div>
              {getImageList().length > 0 && (
                <div className="rounded-2xl border border-obsidian/15 p-4">
                  <label className="mb-3 block text-sm font-bold uppercase tracking-[0.2em]">Map Images to Colors</label>
                  <p className="mb-4 text-xs text-obsidian/60">Assign specific images to each color. When user selects a color, only mapped images will show.</p>
                  {(() => {
                    const colorList = String(form.colors || '').split(',').map((c) => c.trim()).filter(Boolean);
                    const imageList = getImageList();
                    let colorImagesObj = {};
                    try {
                      colorImagesObj = JSON.parse(form.colorImages || '{}');
                    } catch (e) {
                      colorImagesObj = {};
                    }

                    const updateColorImages = (color, selectedImages) => {
                      colorImagesObj[color] = selectedImages;
                      updateField('colorImages', JSON.stringify(colorImagesObj));
                    };

                    if (colorList.length === 0) {
                      return <p className="text-sm text-obsidian/60">Add colors first to map images</p>;
                    }

                    return colorList.map((color) => (
                      <div key={color} className="mb-4 last:mb-0">
                        <label className="mb-2 block text-sm font-semibold text-obsidian">{color}</label>
                        <div className="grid grid-cols-4 gap-2">
                          {imageList.map((image) => {
                            const isSelected = (colorImagesObj[color] || []).includes(image);
                            return (
                              <div
                                key={image}
                                onClick={() => {
                                  const currentImages = colorImagesObj[color] || [];
                                  if (isSelected) {
                                    updateColorImages(color, currentImages.filter((img) => img !== image));
                                  } else {
                                    updateColorImages(color, [...currentImages, image]);
                                  }
                                }}
                                className={`relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 ${isSelected ? 'border-wood' : 'border-obsidian/20 hover:border-obsidian/40'}`}
                              >
                                <Image src={image} alt={color} fill sizes="80px" className="object-cover" />
                                {isSelected && <div className="absolute inset-0 flex items-center justify-center bg-wood/20"><span className="rounded-full bg-wood px-2 py-1 text-xs font-bold text-obsidian">✓</span></div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-bold uppercase tracking-[0.2em]">Color-wise Quantities</label>
                <p className="mb-3 text-xs text-obsidian/60">Set quantity for each color. Total quantity will be calculated automatically.</p>
                {(() => {
                  const colorList = String(form.colors || '').split(',').map((c) => c.trim()).filter(Boolean);
                  let colorQuantitiesObj = {};
                  try {
                    colorQuantitiesObj = JSON.parse(form.colorQuantities || '{}');
                  } catch (e) {
                    colorQuantitiesObj = {};
                  }

                  const updateColorQuantity = (color, qty) => {
                    colorQuantitiesObj[color] = Number(qty) || 0;
                    updateField('colorQuantities', JSON.stringify(colorQuantitiesObj));
                  };

                  if (colorList.length === 0) {
                    return <p className="text-sm text-obsidian/60">Add colors first to set quantities</p>;
                  }

                  return colorList.map((color) => (
                    <div key={color} className="mb-3 flex items-center gap-3">
                      <label className="w-24 text-sm font-semibold text-obsidian">{color}</label>
                      <input
                        type="number"
                        min="0"
                        value={colorQuantitiesObj[color] || 0}
                        onChange={(event) => updateColorQuantity(color, event.target.value)}
                        placeholder="Quantity"
                        className="flex-1 rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood"
                      />
                    </div>
                  ));
                })()}
              </div>
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-wood hover:text-obsidian disabled:opacity-60">{editingId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}</button>
              {message && <p className="text-center text-sm font-bold text-wood">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[780px]">
                <div className="sticky top-0 z-10 grid grid-cols-[70px_1.4fr_1fr_120px_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>ID</span><span>Name</span><span>Category</span><span>Price</span><span>Actions</span></div>
                <div className="divide-y divide-ivory/10">{products.map((product) => <div key={product.id} className="grid grid-cols-[70px_1.4fr_1fr_120px_140px] items-center gap-4 px-6 py-4"><span className="text-muted">#{product.id}</span><div><p className="font-display text-2xl">{product.name}</p><p className="text-xs uppercase tracking-[0.2em] text-wood">{product.badge || 'No Badge'} · {product.stockStatus === 'available' ? 'Available' : product.stockStatus === 'limited' ? 'Limited Stock' : 'Sold Out'} · Qty: {product.quantity}</p></div><span className="text-ivory/75">{product.category}</span><span className="font-bold text-wood">{formatPrice(product.price)}</span><div className="flex gap-2"><button onClick={() => { setEditingId(product.id); setForm(toForm(product)); }} className="rounded-full bg-ivory/10 p-3 transition hover:bg-wood hover:text-obsidian"><Edit3 size={16} /></button><button onClick={() => deleteProduct(product.id)} className="rounded-full bg-ivory/10 p-3 transition hover:bg-red-500"><Trash2 size={16} /></button></div></div>)}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'collections' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitCollection} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-4xl">{editingCollectionId ? 'Edit Collection' : 'Add Collection'}</h2>{editingCollectionId && <button type="button" onClick={resetCollectionForm} className="rounded-full bg-obsidian p-2 text-ivory"><X size={18} /></button>}</div>
            <div className="space-y-4">
              <input value={collectionForm.name} onChange={(event) => updateCollectionField('name', event.target.value)} required placeholder="Collection name" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <div className="grid grid-cols-2 gap-3"><input value={collectionForm.slug} onChange={(event) => updateCollectionField('slug', event.target.value)} placeholder="Slug optional" className="rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" /><input value={collectionForm.tag} onChange={(event) => updateCollectionField('tag', event.target.value)} placeholder="Tag" className="rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" /></div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-wood hover:text-obsidian">
                <ImagePlus size={18} />
                {uploading ? 'Uploading...' : 'Upload Collection Image'}
                <input type="file" accept="image/*" disabled={uploading} onChange={uploadCollectionImage} className="hidden" />
              </label>
              <input value={collectionForm.image} onChange={(event) => updateCollectionField('image', event.target.value)} required placeholder="Collection image URL" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              {collectionForm.image && <div className="relative h-44 overflow-hidden rounded-2xl border border-obsidian/10 bg-white"><Image src={collectionForm.image} alt="Collection preview" fill sizes="420px" className="object-cover" /></div>}
              <textarea value={collectionForm.description} onChange={(event) => updateCollectionField('description', event.target.value)} required placeholder="Description" rows={5} className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-wood hover:text-obsidian disabled:opacity-60">{editingCollectionId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving...' : editingCollectionId ? 'Save Changes' : 'Add Collection'}</button>
              {message && <p className="text-center text-sm font-bold text-wood">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[760px]">
                <div className="sticky top-0 z-10 grid grid-cols-[90px_1.2fr_1fr_1fr_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Image</span><span>Name</span><span>Slug</span><span>Tag</span><span>Actions</span></div>
                <div className="divide-y divide-ivory/10">{collections.map((collection) => <div key={collection.id} className="grid grid-cols-[90px_1.2fr_1fr_1fr_140px] items-center gap-4 px-6 py-4"><div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-obsidian"><Image src={collection.image} alt={collection.name} fill sizes="64px" className="object-cover" /></div><div><p className="font-display text-2xl">{collection.name}</p><p className="line-clamp-1 text-xs text-ivory/50">{collection.description}</p></div><span className="text-ivory/75">{collection.slug}</span><span className="text-wood">{collection.tag}</span><div className="flex gap-2"><button onClick={() => { setEditingCollectionId(collection.id); setCollectionForm(collection); }} className="rounded-full bg-ivory/10 p-3 transition hover:bg-wood hover:text-obsidian"><Edit3 size={16} /></button><button onClick={() => deleteCollection(collection.id)} className="rounded-full bg-ivory/10 p-3 transition hover:bg-red-500"><Trash2 size={16} /></button></div></div>)}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'lookbook' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitLookbookItem} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-4xl">{editingLookbookId ? 'Edit Lookbook' : 'Add Lookbook'}</h2>{editingLookbookId && <button type="button" onClick={resetLookbookForm} className="rounded-full bg-obsidian p-2 text-ivory"><X size={18} /></button>}</div>
            <div className="space-y-4">
              <input value={lookbookForm.title} onChange={(event) => updateLookbookField('title', event.target.value)} required placeholder="Title" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <div className="grid grid-cols-2 gap-3"><input value={lookbookForm.subtitle} onChange={(event) => updateLookbookField('subtitle', event.target.value)} required placeholder="Subtitle" className="rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" /><input value={lookbookForm.sortOrder} onChange={(event) => updateLookbookField('sortOrder', event.target.value)} type="number" placeholder="Sort order" className="rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" /></div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-wood hover:text-obsidian">
                <ImagePlus size={18} />
                {uploading ? 'Uploading...' : 'Upload Lookbook Image'}
                <input type="file" accept="image/*" disabled={uploading} onChange={uploadLookbookImage} className="hidden" />
              </label>
              <input value={lookbookForm.image} onChange={(event) => updateLookbookField('image', event.target.value)} required placeholder="Image URL" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              {lookbookForm.image && <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-obsidian/10 bg-white"><Image src={lookbookForm.image} alt="Lookbook preview" fill sizes="420px" className="object-cover" /></div>}
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-wood hover:text-obsidian disabled:opacity-60">{editingLookbookId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving...' : editingLookbookId ? 'Save Changes' : 'Add Lookbook'}</button>
              {message && <p className="text-center text-sm font-bold text-wood">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[760px]">
                <div className="sticky top-0 z-10 grid grid-cols-[90px_1.2fr_1fr_100px_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Image</span><span>Title</span><span>Subtitle</span><span>Order</span><span>Actions</span></div>
                <div className="divide-y divide-ivory/10">{lookbookItems.map((item) => <div key={item.id} className="grid grid-cols-[90px_1.2fr_1fr_100px_140px] items-center gap-4 px-6 py-4"><div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-obsidian"><Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" /></div><p className="font-display text-2xl">{item.title}</p><span className="text-wood">{item.subtitle}</span><span className="text-ivory/75">{item.sortOrder}</span><div className="flex gap-2"><button onClick={() => { setEditingLookbookId(item.id); setLookbookForm({ ...item, sortOrder: String(item.sortOrder) }); }} className="rounded-full bg-ivory/10 p-3 transition hover:bg-wood hover:text-obsidian"><Edit3 size={16} /></button><button onClick={() => deleteLookbookItem(item.id)} className="rounded-full bg-ivory/10 p-3 transition hover:bg-red-500"><Trash2 size={16} /></button></div></div>)}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'newArrivals' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6"><h2 className="font-display text-4xl">New Arrivals</h2><p className="mt-2 text-sm text-obsidian/60">Home page ke New Arrivals section me kon kon se products show hone hain, select karein.</p></div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-obsidian/15 p-4">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-obsidian/60">Selected Products ({selectedNewArrivals.length})</p>
                <div className="space-y-2 max-h-[400px] overflow-auto">
                  {selectedNewArrivals.length === 0 ? (
                    <p className="text-center text-sm text-obsidian/40">Koi product select nahi kiya gaya</p>
                  ) : (
                    selectedNewArrivals.map((productId) => {
                      const product = products.find((p) => p.id === productId);
                      return product ? (
                        <div key={productId} className="flex items-center justify-between gap-3 rounded-xl bg-obsidian/5 p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-obsidian">
                              <Image src={product.images[0]} alt={product.name} fill sizes="48px" className="object-cover" />
                            </div>
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-xs text-obsidian/60">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setSelectedNewArrivals((prev) => prev.filter((id) => id !== productId))} className="rounded-full bg-obsidian/10 p-2 transition hover:bg-red-500 hover:text-ivory">
                            <X size={16} />
                          </button>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>
              <button disabled={saving} onClick={saveNewArrivals} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-wood hover:text-obsidian disabled:opacity-60"><Save size={18} />{saving ? 'Saving...' : 'Save New Arrivals'}</button>
              {message && <p className="text-center text-sm font-bold text-wood">{message}</p>}
            </div>
          </div>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[900px]">
                <div className="sticky top-0 z-10 grid grid-cols-[80px_1.5fr_1fr_100px_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Image</span><span>Name</span><span>Category</span><span>Price</span><span>Action</span></div>
                <div className="divide-y divide-ivory/10">{products.map((product) => <div key={product.id} className="grid grid-cols-[80px_1.5fr_1fr_100px_140px] items-center gap-4 px-6 py-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-obsidian"><Image src={product.images[0]} alt={product.name} fill sizes="64px" className="object-cover" /></div>
                  <p className="font-display text-xl">{product.name}</p>
                  <span className="text-wood">{product.category}</span>
                  <span className="text-ivory/75">{formatPrice(product.price)}</span>
                  <button type="button" onClick={() => toggleNewArrival(product.id)} className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.15em] transition ${selectedNewArrivals.includes(product.id) ? 'bg-wood text-obsidian' : 'bg-ivory/10 text-ivory hover:bg-ivory/20'}`}>
                    {selectedNewArrivals.includes(product.id) ? 'Remove' : 'Add'}
                  </button>
                </div>)}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'content' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={saveSiteContent} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6"><h2 className="font-display text-4xl">Hero Section</h2><p className="mt-2 text-sm text-obsidian/60">Hero section ke liye video ya image select karein.</p></div>
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-obsidian/70">Hero Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setHeroType('video'); updateSiteContentField('heroType', 'video'); }}
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] transition ${heroType === 'video' ? 'bg-wood text-obsidian' : 'bg-ivory/10 text-obsidian hover:bg-ivory/20'}`}
                  >
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHeroType('image'); updateSiteContentField('heroType', 'image'); }}
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] transition ${heroType === 'image' ? 'bg-wood text-obsidian' : 'bg-ivory/10 text-obsidian hover:bg-ivory/20'}`}
                  >
                    Image
                  </button>
                </div>
              </div>

              {heroType === 'video' ? (
                <>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-wood hover:text-obsidian">
                    <Video size={18} />
                    {uploading ? 'Uploading...' : 'Upload Hero Video'}
                    <input type="file" accept="video/*" disabled={uploading} onChange={uploadHeroVideo} className="hidden" />
                  </label>
                  <input value={siteContent.heroVideo} onChange={(event) => updateSiteContentField('heroVideo', event.target.value)} placeholder="Hero video URL" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
                  {siteContent.heroVideo && <div className="relative aspect-video overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian">
                    <video src={siteContent.heroVideo} controls className="h-full w-full object-cover" />
                  </div>}
                </>
              ) : (
                <>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-wood hover:text-obsidian">
                    <ImagePlus size={18} />
                    {uploading ? 'Uploading...' : 'Upload Hero Image'}
                    <input type="file" accept="image/*" disabled={uploading} onChange={uploadHeroImage} className="hidden" />
                  </label>
                  <input value={siteContent.heroImage} onChange={(event) => updateSiteContentField('heroImage', event.target.value)} placeholder="Hero image URL" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
                  {siteContent.heroImage && <div className="relative aspect-video overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian">
                    <Image src={siteContent.heroImage} alt="Hero preview" fill sizes="420px" className="object-cover" />
                  </div>}
                </>
              )}

              <div className="border-t border-obsidian/10 pt-6">
                <h3 className="mb-4 font-display text-2xl">About Page Image</h3>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-obsidian px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-wood hover:text-obsidian">
                  <ImagePlus size={18} />
                  {uploading ? 'Uploading...' : 'Upload About Image'}
                  <input type="file" accept="image/*" disabled={uploading} onChange={uploadAboutImage} className="hidden" />
                </label>
                <input value={siteContent.aboutImage} onChange={(event) => updateSiteContentField('aboutImage', event.target.value)} required placeholder="About image URL" className="mt-3 w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              </div>
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-wood hover:text-obsidian disabled:opacity-60"><Save size={18} />{saving ? 'Saving...' : 'Save Changes'}</button>
              {message && <p className="text-center text-sm font-bold text-wood">{message}</p>}
            </div>
          </form>
          <div className="rounded-[2rem] bg-surface p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-muted">Current Hero Preview</p>
            <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-obsidian">
              {heroType === 'video' && siteContent.heroVideo ? (
                <video src={siteContent.heroVideo} controls className="h-full w-full object-cover" />
              ) : heroType === 'image' && siteContent.heroImage ? (
                <Image src={siteContent.heroImage} alt="Hero preview" fill sizes="50vw" className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-ivory/50">No content set</div>
              )}
            </div>
            <div className="mt-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-muted">Current About Preview</p>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-obsidian"><Image src={siteContent.aboutImage} alt="About page preview" fill sizes="50vw" className="object-cover" /></div>
            </div>
          </div>
        </div>}
        {activePanel === 'orders' && <div className="grid gap-8 py-12 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[900px]">
                <div className="sticky top-0 z-10 grid grid-cols-[140px_1fr_150px_140px_140px_80px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Order</span><span>Customer</span><span>Status</span><span>Date</span><span>Total</span><span>View</span></div>
                <div className="divide-y divide-ivory/10">{orders.length ? orders.map((order) => <button key={order.id} type="button" onClick={() => setSelectedOrderId(order.id)} className={`grid w-full grid-cols-[140px_1fr_150px_140px_140px_80px] items-center gap-4 px-6 py-4 text-left transition hover:bg-ivory/5 ${selectedOrder?.id === order.id ? 'bg-wood/10' : ''}`}><span className="font-bold text-wood">{order.id}</span><span><span className="block font-semibold">{order.customer?.name || 'Unknown Customer'}</span><span className="block text-xs text-ivory/50">{order.customer?.email || 'No email'}</span><span className="block text-xs text-ivory/50">{order.customer?.phone || 'No phone'}</span></span><span>{order.status}</span><span className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</span><span className="font-bold text-wood">{formatPrice(order.total)}</span><span className="text-ivory/70"><Eye size={18} /></span></button>) : <div className="px-6 py-10 text-center text-muted">Abhi koi order nahi hai.</div>}</div>
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
                <span className="rounded-full bg-obsidian px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-wood">{selectedOrder.status}</span>
              </div>
              <div className="mt-7 space-y-5">
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Customer</p><p className="mt-1 font-display text-3xl">{selectedOrder.customer?.name || 'Unknown Customer'}</p><p className="text-sm text-obsidian/60">{selectedOrder.customer?.email || 'No email available'}</p><p className="text-sm text-obsidian/60">{selectedOrder.customer?.phone || 'No phone available'}</p></div>
                {selectedOrder.shippingAddress?.customMeasurements && (selectedOrder.shippingAddress.customMeasurements.waist || selectedOrder.shippingAddress.customMeasurements.length) && (
                  <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Custom Measurements</p><div className="mt-2 rounded-2xl bg-obsidian/5 p-4 text-sm"><p className="text-obsidian/60">Waist: {selectedOrder.shippingAddress.customMeasurements.waist || 'Not provided'}</p><p className="text-obsidian/60">Length: {selectedOrder.shippingAddress.customMeasurements.length || 'Not provided'}</p></div></div>
                )}
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Status Change</p><select value={selectedOrder.status} disabled={orderSaving} onChange={(event) => updateOrderStatus(selectedOrder.id, event.target.value)} className="mt-2 w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 font-semibold outline-none focus:border-wood">{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
                
                {/* Payment Proof Section for Pending Orders */}
                {selectedOrder.status === 'Pending' && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50 mb-3">Payment Proof</p>
                    {selectedOrder.paymentProof ? (
                      <div className="space-y-3">
                        <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-obsidian/10 bg-obsidian/5">
                          <img src={selectedOrder.paymentProof} alt="Payment proof" className="h-full w-full object-contain" />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => verifyPayment(selectedOrder.id, true)}
                            disabled={orderSaving}
                            className="flex-1 rounded-full bg-green-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-green-600 disabled:opacity-60"
                          >
                            Verify & Confirm
                          </button>
                          <button
                            onClick={() => verifyPayment(selectedOrder.id, false)}
                            disabled={orderSaving}
                            className="flex-1 rounded-full bg-red-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-orange-50 p-4 border border-orange-200">
                        <p className="text-sm text-orange-700">No payment proof uploaded yet. Customer needs to upload payment proof.</p>
                      </div>
                    )}
                  </div>
                )}
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Date</p><p className="mt-1 font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-obsidian/50">Items</p><div className="mt-3 divide-y divide-obsidian/10 rounded-2xl border border-obsidian/10">{selectedOrder.items.map((item) => <div key={`${selectedOrder.id}-${item.name}-${item.size}`} className="flex justify-between gap-4 p-4 text-sm"><div><p className="font-bold">{item.name}</p><p className="text-obsidian/55">Size {item.size} · Qty {item.quantity}</p></div><p className="font-bold text-wood">{formatPrice(item.price * item.quantity)}</p></div>)}</div></div>
                <div className="flex items-center justify-between rounded-2xl bg-obsidian px-5 py-4 text-ivory"><span className="text-sm font-bold uppercase tracking-[0.2em] text-ivory/60">Total</span><span className="text-xl font-bold text-wood">{formatPrice(selectedOrder.total)}</span></div>
                {message && <p className="text-center text-sm font-bold text-wood">{message}</p>}
              </div>
            </> : <div className="py-10 text-center text-obsidian/60">Order select karein.</div>}
          </aside>
        </div>}
        {activePanel === 'users' && <div className="py-12">
          <div className="overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[680px]">
                <div className="sticky top-0 z-10 grid grid-cols-[1fr_1.4fr_120px_160px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Name</span><span>Email</span><span>Role</span><span>Joined</span></div>
                <div className="divide-y divide-ivory/10">{initialUsers.length ? initialUsers.map((user) => <div key={user.id} className="grid grid-cols-[1fr_1.4fr_120px_160px] items-center gap-4 px-6 py-4"><span className="font-display text-2xl">{user.name || 'No Name'}</span><span className="text-wood">{user.email}</span><span>{user.user === 1 ? 'Admin' : 'Customer'}</span><span className="text-muted">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span></div>) : <div className="px-6 py-10 text-center text-muted">Abhi koi user nahi hai.</div>}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'coupons' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitCoupon} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-4xl">{editingCouponId ? 'Edit Coupon' : 'Add Coupon'}</h2>{editingCouponId && <button type="button" onClick={resetCouponForm} className="rounded-full bg-obsidian p-2 text-ivory"><X size={18} /></button>}</div>
            <div className="space-y-4">
              <input value={couponForm.code} onChange={(event) => updateCouponField('code', event.target.value)} required placeholder="Coupon Code (e.g., SUMMER20)" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood uppercase" />
              <input value={couponForm.discountPercent} onChange={(event) => updateCouponField('discountPercent', event.target.value)} required type="number" min="1" max="100" placeholder="Discount Percentage (e.g., 20)" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <input value={couponForm.maxUses} onChange={(event) => updateCouponField('maxUses', event.target.value)} type="number" min="0" placeholder="Max Uses (0 for unlimited)" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <input value={couponForm.expiresAt} onChange={(event) => updateCouponField('expiresAt', event.target.value)} type="date" placeholder="Expiration Date (optional)" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em]"><input type="checkbox" checked={couponForm.isActive} onChange={(event) => updateCouponField('isActive', event.target.checked)} /> Active</label>
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-wood hover:text-obsidian disabled:opacity-60">{editingCouponId ? <Save size={18} /> : <Plus size={18} />}{saving ? 'Saving...' : editingCouponId ? 'Save Changes' : 'Add Coupon'}</button>
              {message && <p className="text-center text-sm font-bold text-wood">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface">
            <div className="max-h-[720px] overflow-auto">
              <div className="min-w-[800px]">
                <div className="sticky top-0 z-10 grid grid-cols-[120px_1fr_100px_100px_120px_140px] gap-4 border-b border-ivory/10 bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted"><span>Code</span><span>Discount</span><span>Used</span><span>Max</span><span>Status</span><span>Actions</span></div>
                <div className="divide-y divide-ivory/10">{coupons.length ? coupons.map((coupon) => <div key={coupon.id} className="grid grid-cols-[120px_1fr_100px_100px_120px_140px] items-center gap-4 px-6 py-4"><span className="font-display text-2xl text-wood">{coupon.code}</span><span>{coupon.discountPercent}%</span><span className="text-muted">{coupon.usedCount}</span><span className="text-muted">{coupon.maxUses === 0 ? 'Unlimited' : coupon.maxUses}</span><span className={coupon.isActive ? 'text-green-400' : 'text-red-400'}>{coupon.isActive ? 'Active' : 'Inactive'}</span><div className="flex gap-2"><button onClick={() => { setEditingCouponId(coupon.id); setCouponForm({ code: coupon.code, discountPercent: String(coupon.discountPercent), maxUses: String(coupon.maxUses), expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString().split('T')[0] : '', isActive: coupon.isActive }); }} className="rounded-full bg-ivory/10 p-3 transition hover:bg-wood hover:text-obsidian"><Edit3 size={16} /></button><button onClick={() => deleteCoupon(coupon.id)} className="rounded-full bg-ivory/10 p-3 transition hover:bg-red-500"><Trash2 size={16} /></button></div></div>) : <div className="px-6 py-10 text-center text-muted">Abhi koi coupon nahi hai.</div>}</div>
              </div>
            </div>
          </div>
        </div>}
        {activePanel === 'globalDiscount' && <div className="grid gap-8 py-12 lg:grid-cols-[420px_minmax(0,1fr)]">
          <form onSubmit={submitGlobalDiscount} className="rounded-[2rem] bg-ivory p-6 text-obsidian shadow-2xl">
            <div className="mb-6"><h2 className="font-display text-4xl">Global Discount</h2><p className="mt-2 text-sm text-obsidian/60">Sabhi products par overall discount set karein.</p></div>
            <div className="space-y-4">
              <input value={globalDiscountForm.discountPercent} onChange={(event) => updateGlobalDiscountField('discountPercent', event.target.value)} required type="number" min="1" max="100" placeholder="Discount Percentage (e.g., 20)" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <input value={globalDiscountForm.expiresAt} onChange={(event) => updateGlobalDiscountField('expiresAt', event.target.value)} type="date" placeholder="Expiration Date (optional)" className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-obsidian outline-none focus:border-wood" />
              <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em]"><input type="checkbox" checked={globalDiscountForm.isActive} onChange={(event) => updateGlobalDiscountField('isActive', event.target.checked)} /> Active</label>
              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-4 text-sm font-bold uppercase tracking-[0.25em] text-ivory transition hover:bg-wood hover:text-obsidian disabled:opacity-60">{saving ? 'Saving...' : 'Save Global Discount'}</button>
              {message && <p className="text-center text-sm font-bold text-wood">{message}</p>}
            </div>
          </form>
          <div className="min-w-0 overflow-hidden rounded-[2rem] bg-surface p-7">
            <h2 className="font-display text-3xl mb-6">Current Global Discount</h2>
            {globalDiscount ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-ivory/10">
                  <span className="text-ivory/75">Discount Percentage</span>
                  <span className="font-display text-3xl text-wood">{globalDiscount.discountPercent}%</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-ivory/10">
                  <span className="text-ivory/75">Status</span>
                  <span className={globalDiscount.isActive ? 'text-green-400' : 'text-red-400'}>{globalDiscount.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ivory/75">Expires At</span>
                  <span className="text-wood">{globalDiscount.expiresAt ? new Date(globalDiscount.expiresAt).toLocaleDateString() : 'No expiration'}</span>
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
