/**
 * Product Image Scraper Service
 * Extracts product images from Indian e-commerce URLs
 */

import * as cheerio from 'cheerio';

// Simple in-memory cache for product images
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface ProductInfo {
  image_url: string | null;
  title: string | null;
  price: number | null;
  brand: string | null;
}

/**
 * Extract product image from a URL
 */
export async function extractProductImage(url: string): Promise<string | null> {
  try {
    // Check cache first
    const cached = imageCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.url;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try different selectors for product images
    let imageUrl: string | null = null;

    // Myntra
    if (url.includes('myntra.com')) {
      imageUrl = $('img.image-grid-image').first().attr('src') ||
                 $('picture.image-grid-imageContainer img').first().attr('src') ||
                 $('div.image-grid-col img').first().attr('src');
    }
    // Ajio
    else if (url.includes('ajio.com')) {
      imageUrl = $('img.rilrtl-lazy-img').first().attr('src') ||
                 $('div.zoom-wrap img').first().attr('src') ||
                 $('img[data-zoom-image]').first().attr('src');
    }
    // Amazon
    else if (url.includes('amazon.in') || url.includes('amazon.com')) {
      imageUrl = $('#landingImage').attr('src') ||
                 $('#imgBlkFront').attr('src') ||
                 $('img.s-image').first().attr('src');
    }
    // Flipkart
    else if (url.includes('flipkart.com')) {
      imageUrl = $('img._396cs4').first().attr('src') ||
                 $('img._2r_T1I').first().attr('src') ||
                 $('div._3togXc img').first().attr('src');
    }
    // Generic fallback - try common selectors
    else {
      imageUrl = $('meta[property="og:image"]').attr('content') ||
                 $('img[itemprop="image"]').attr('src') ||
                 $('img.product-image').first().attr('src') ||
                 $('img.main-image').first().attr('src');
    }

    if (imageUrl) {
      // Cache the result
      imageCache.set(url, { url: imageUrl, timestamp: Date.now() });
    }

    return imageUrl;
  } catch (error) {
    console.error('Product image extraction error:', error);
    return null;
  }
}

/**
 * Extract product info from search results page
 */
export async function extractFirstProductFromSearch(searchUrl: string): Promise<ProductInfo | null> {
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    let product: ProductInfo = {
      image_url: null,
      title: null,
      price: null,
      brand: null,
    };

    // Myntra search results
    if (searchUrl.includes('myntra.com')) {
      const firstProduct = $('li.product-base').first();
      product.image_url = firstProduct.find('img.img-responsive').attr('src') ||
                         firstProduct.find('picture img').attr('src');
      product.title = firstProduct.find('h4.product-product').text().trim();
      product.brand = firstProduct.find('h3.product-brand').text().trim();
      const priceText = firstProduct.find('span.product-discountedPrice').text() ||
                       firstProduct.find('span.product-price').text();
      product.price = parseInt(priceText.replace(/[^\d]/g, '')) || null;
    }
    // Ajio search results
    else if (searchUrl.includes('ajio.com')) {
      const firstProduct = $('div.item').first();
      product.image_url = firstProduct.find('img.rilrtl-lazy-img').attr('src');
      product.title = firstProduct.find('div.nameCls').text().trim();
      product.brand = firstProduct.find('div.brand').text().trim();
      const priceText = firstProduct.find('span.price').text();
      product.price = parseInt(priceText.replace(/[^\d]/g, '')) || null;
    }
    // Amazon search results
    else if (searchUrl.includes('amazon.in')) {
      const firstProduct = $('div[data-component-type="s-search-result"]').first();
      product.image_url = firstProduct.find('img.s-image').attr('src');
      product.title = firstProduct.find('h2 span').text().trim();
      const priceText = firstProduct.find('span.a-price-whole').first().text();
      product.price = parseInt(priceText.replace(/[^\d]/g, '')) || null;
    }

    return product.image_url ? product : null;
  } catch (error) {
    console.error('Search product extraction error:', error);
    return null;
  }
}

/**
 * Get placeholder image URL based on item type
 */
export function getPlaceholderImage(itemType: string, gender: 'male' | 'female' = 'female'): string {
  // Using Unsplash for high-quality fashion placeholders
  const placeholders: Record<string, string> = {
    top: `https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop`, // shirt
    bottom: `https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop`, // pants
    footwear: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop`, // shoes
    accessory: `https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=500&fit=crop`, // watch
    outerwear: `https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop`, // jacket
  };

  return placeholders[itemType] || placeholders.top;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of imageCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      imageCache.delete(key);
    }
  }
}

// Clear cache every hour
setInterval(clearExpiredCache, 1000 * 60 * 60);
