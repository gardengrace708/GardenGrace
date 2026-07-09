export const formatPrice = (price) => `PKR ${Number(price).toLocaleString('en-PK')}`;

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

export const getImageFallback = (label = 'Photo') => label;
