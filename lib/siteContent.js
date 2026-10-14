import { getDb } from '@/lib/mongodb';

const defaultSiteContent = {
  key: 'site-content',
  aboutImage: '/images/about.jpg',
  heroVideo: '',
  heroImage: '',
  heroType: 'video',
  newArrivalsProductIds: []
};

function normalizeSiteContent(content) {
  const aboutImage = String(content?.aboutImage || '').trim();
  const heroVideo = String(content?.heroVideo || '').trim();
  const heroImage = String(content?.heroImage || '').trim();
  const heroType = content?.heroType || 'video';
  const newArrivalsProductIds = Array.isArray(content?.newArrivalsProductIds) ? content.newArrivalsProductIds : [];

  return {
    aboutImage: aboutImage && aboutImage !== '/images/.jpg' ? aboutImage : defaultSiteContent.aboutImage,
    heroVideo: heroVideo || defaultSiteContent.heroVideo,
    heroImage: heroImage || defaultSiteContent.heroImage,
    heroType,
    newArrivalsProductIds
  };
}

export async function ensureSiteContentSeeded() {
  const db = await getDb();
  const existing = await db.collection('siteContent').findOne({ key: defaultSiteContent.key });

  if (!existing) {
    await db.collection('siteContent').insertOne(defaultSiteContent);
  }
}

export async function getSiteContent() {
  await ensureSiteContentSeeded();
  const db = await getDb();
  const content = await db.collection('siteContent').findOne({ key: defaultSiteContent.key });
  return normalizeSiteContent(content);
}

export async function updateSiteContent(input) {
  const db = await getDb();
  await ensureSiteContentSeeded();
  const content = normalizeSiteContent(input);

  await db.collection('siteContent').updateOne({ key: defaultSiteContent.key }, { $set: content });
  return content;
}

export async function getNewArrivalsProductIds() {
  const content = await getSiteContent();
  return content.newArrivalsProductIds || [];
}
