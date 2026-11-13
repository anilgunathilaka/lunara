import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState, type StockLevel } from '@/components/product/StockState';

export interface ProductCardProps {
  href: string;
  image: { src: string; alt: string };
  name: string;
  /** Unique product code, e.g. "LSC001" (PRD v4.0) — shown above the name. */
  code?: string | null;
  /** The saree category, e.g. "Cotton sarees" — shown beneath the name. */
  materialLabel: string;
  /** All-in price for saree plus jacket material. */
  price: number;
  jacketMaterialName: string;
  jacketSwatchHex: string;
  stockState: StockLevel;
  quantity?: number;
  outOfStockLabel: string;
  lowStockLabel: string;
  formatLeft?: (count: number) => string;
}

export function ProductCard({
  href,
  image,
  name,
  code,
  materialLabel,
  price,
  jacketMaterialName,
  jacketSwatchHex,
  stockState,
  quantity,
  outOfStockLabel,
  lowStockLabel,
  formatLeft,
}: ProductCardProps) {
  return (
    <Link href={href} className="product-card">
      <div className="product-card-image">
        {/* 4:5 drape photograph — no filter, overlay, gradient or hover-zoom. */}
        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 25vw, 50vw" />
      </div>
      <StockState
        state={stockState}
        quantity={quantity}
        outOfStockLabel={outOfStockLabel}
        lowStockLabel={lowStockLabel}
        formatLeft={formatLeft}
      />
      {code && <p className="product-card-code">{code}</p>}
      <p className="product-card-name">{name}</p>
      <p className="product-card-material">{materialLabel}</p>
      <PriceDisplay amount={price} />
      <div className="product-card-jacket-row">
        <span
          className="mini-swatch"
          style={{ backgroundColor: jacketSwatchHex }}
          aria-hidden="true"
        />
        <span>{jacketMaterialName}</span>
      </div>
    </Link>
  );
}
