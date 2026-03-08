import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
}

export const SEOHead = ({
  title = 'Roomly – AI Interior Design & Furniture Shopping',
  description = 'Design your dream space with AI-powered interior design. Upload your room, get personalized suggestions, and shop the look instantly.',
  canonical,
  image = '/placeholder.svg',
  type = 'website',
}: SEOHeadProps) => {
  const fullTitle = title.includes('Roomly') ? title : `${title} | Roomly`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
