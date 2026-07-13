import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image }) => {
  const defaultTitle = "P&P - Premium Custom Printing & Packaging";
  const defaultDescription = "Custom packaging, printed mailers, boxes, and more. Design your sustainable custom packaging online today.";
  
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title ? `${title} | P&P` : defaultTitle}</title>
      <meta name='description' content={description || defaultDescription} />
      
      {/* OpenGraph tags */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || "/default-og.jpg"} />
      <meta property="og:site_name" content={name || "P&P"} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || "P&P"} />
      <meta name="twitter:card" content={type || "summary_large_image"} />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
    </Helmet>
  );
};

export default SEO;
