import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShoppingCart className="h-10 w-10 opacity-40" />
            <p className="text-sm">Your cart is empty.</p>
          </div>
        ) : (
          <ScrollArea className="-mx-6 flex-1 px-6">
            <div className="space-y-3 py-2">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor ?? ''}`}
                  className="flex gap-3 rounded-lg border p-2"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.product.price.toFixed(2)}
                    </p>
                    <div className="mt-auto flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-6 w-6 text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate('/checkout');
              }}
            >
              Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
