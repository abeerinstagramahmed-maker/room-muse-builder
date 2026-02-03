import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const rooms = [
  {
    id: 'living-room',
    name: 'Living Room',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
    productCount: 124,
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
    productCount: 89,
  },
  {
    id: 'dining',
    name: 'Dining',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80',
    productCount: 67,
  },
  {
    id: 'office',
    name: 'Home Office',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&q=80',
    productCount: 45,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const ShopByRoomSection = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Shop by Room
            </h2>
            <p className="mt-3 max-w-lg text-lg text-muted-foreground">
              Explore curated collections designed for every space in your home
            </p>
          </div>
          <Link
            to="/catalog"
            className="group flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {rooms.map((room, index) => (
            <motion.div key={room.id} variants={itemVariants}>
              <Link
                to={`/catalog?category=${room.id}`}
                className="group relative block overflow-hidden rounded-3xl"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {room.name}
                  </h3>
                  
                  {/* Reveal on hover */}
                  <div className="mt-2 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-sm text-white/80">
                      {room.productCount} products
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-white">
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 ring-2 ring-primary/50 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
