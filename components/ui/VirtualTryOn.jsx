'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Sparkles } from 'lucide-react';

export default function VirtualTryOn({ productImage, productName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      setTimeout(() => {
        canvas.getContext('2d').drawImage(video, 0, 0);
        stream.getTracks().forEach(track => track.stop());
        const imageData = canvas.toDataURL('image/jpeg');
        setUserImage(imageData);
        setResultImage(null);
        setError(null);
      }, 1000);
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  const handleTryOn = async () => {
    if (!userImage || !productImage) return;

    setLoading(true); // Fixed: loading check removed
    setError(null);

    try {
      const response = await fetch('/api/virtual-try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userImage, productImage })
      });

      const data = await response.json();

      if (data.success) {
        setResultImage(data.image);
      } else {
        setError(data.message || 'Failed to generate try-on image');
      }
    } catch (err) {
      setError('Failed to process virtual try-on');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setUserImage(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <>
      {/* <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full border border-wood/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.25em] text-wood transition hover:bg-wood hover:text-obsidian"
      >
        <Sparkles size={18} />
        Try it onYourself
      </button> */}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm md:max-w-md max-h-[90vh] md:max-h-[80vh] bg-ivory rounded-3xl p-5 md:p-6 shadow-2xl overflow-y-auto scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-obsidian/10 p-2 transition hover:bg-wood hover:text-obsidian"
              >
                <X size={20} />
              </button>

              <h2 className="font-display text-2xl md:text-3xl text-obsidian mb-2">Virtual Try-On</h2>
              <p className="text-xs md:text-sm text-obsidian/70 mb-4">See how {productName} looks on you!</p>

              {!resultImage ? (
                <div className="space-y-4">
                  {!userImage ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-wood/40 p-6 transition hover:border-wood hover:bg-wood/5"
                      >
                        <Upload size={28} className="text-wood" />
                        <span className="text-xs font-bold uppercase tracking-wider text-obsidian">Upload Photo</span>
                      </button>
                      <button
                        onClick={handleCameraCapture}
                        className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-wood/40 p-6 transition hover:border-wood hover:bg-wood/5"
                      >
                        <Camera size={28} className="text-wood" />
                        <span className="text-xs font-bold uppercase tracking-wider text-obsidian">Take Photo</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative aspect-[4/5] max-h-[40vh] mx-auto overflow-hidden rounded-2xl bg-obsidian/10">
                        <img src={userImage} alt="Your photo" className="h-full w-full object-cover" />
                        <button
                          onClick={reset}
                          className="absolute right-3 top-3 rounded-full bg-obsidian/70 p-1.5 text-ivory transition hover:bg-red-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <button
                        onClick={handleTryOn}
                        disabled={loading}
                        className="w-full rounded-full bg-wood px-6 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-obsidian transition hover:bg-obsidian hover:text-ivory disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          'Generate Try-On'
                        )}
                      </button>
                    </div>
                  )}

                  {error && (
                    <p className="text-center text-xs font-bold text-red-500">{error}</p>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-[4/5] max-h-[40vh] mx-auto overflow-hidden rounded-2xl bg-obsidian/10">
                    <img src={resultImage} alt="Virtual try-on result" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="flex-1 rounded-full border border-wood/40 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-wood transition hover:bg-wood/10"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 rounded-full bg-wood px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-obsidian transition hover:bg-obsidian hover:text-ivory"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}