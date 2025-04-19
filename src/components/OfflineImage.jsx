import { useState, useEffect } from 'react';

function OfflineImage({ src, alt, className }) {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    // Cache the image for offline use
    const cacheImage = async () => {
      try {
        const cache = await caches.open('image-cache');
        const response = await cache.match(src);
        
        if (response) {
          const blob = await response.blob();
          setImageSrc(URL.createObjectURL(blob));
        } else {
          const fetchResponse = await fetch(src);
          const blob = await fetchResponse.blob();
          await cache.put(src, new Response(blob));
          setImageSrc(URL.createObjectURL(blob));
        }
      } catch (error) {
        console.error('Error caching image:', error);
        setImageSrc(src); // Fallback to direct src
      }
    };

    cacheImage();
  }, [src]);

  return <img src={imageSrc} alt={alt} className={className} />;
}

export default OfflineImage;