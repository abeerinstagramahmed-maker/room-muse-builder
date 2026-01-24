import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { Collections } from '@/components/home/Collections';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { AIDesignerPromo } from '@/components/home/AIDesignerPromo';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Collections />
      <FeaturedProducts />
      <AIDesignerPromo />
    </Layout>
  );
};

export default Index;
