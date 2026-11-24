import Image from 'next/image';
import { PHOTO_QUALITY } from '@/lib/media/quality';
import { Link } from '@/i18n/navigation';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StockState, type StockLevel } from '@/components/product/StockState';
import { FavouriteButton } from '@/components/account/FavouriteButton';

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
  /** Omit to leave the jacket off the card (PRD v4.1: the shop never names the jacket). */
  jacketMaterialName?: string;
  jacketSwatchHex?: string;
  /** The jacket's photograph, shown in place of the colour block when there is one. */
  jacketSwatchUrl?: string | null;
  stockState: StockLevel;
  quantity?: number;
  outOfStockLabel: string;
  lowStockLabel: string;
  formatLeft?: (count: number) => string;
  /**
   * The saree's second photograph, shown while the card is pointed at (shop
   * grid only, docs/2-ui.md §7.6): unaltered, never scaled.
   */
  hoverImageSrc?: string | null;
  /** The stock note on the photograph's corner instead of under it (shop grid, §7.6). */
  badgeOnImage?: boolean;
  /** next/image sizes for the photographs; defaults to the four-across grid. */
  sizes?: string;
  /** The saree's id: shows a heart on the photograph's corner (favourites, founder decision 2026-11-24). */
  favouriteId?: string;
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
  jacketSwatchUrl,
  stockState,
  quantity,
  outOfStockLabel,
  lowStockLabel,
  formatLeft,
  hoverImageSrc,
  badgeOnImage = false,
  sizes = '(min-width: 768px) 25vw, 50vw',
  favouriteId,
}: ProductCardProps) {
  const stock = (
    <StockState
      state={stockState}
      quantity={quantity}
      outOfStockLabel={outOfStockLabel}
      lowStockLabel={lowStockLabel}
      formatLeft={formatLeft}
    />
  );
  const card = (
    <Link href={href} className="product-card">
      <div className="product-card-image">
        {/* Drape photograph — no filter, overlay, gradient or hover-zoom. */}
        <Image src={image.src} alt={image.alt} fill sizes={sizes} quality={PHOTO_QUALITY} />
        {hoverImageSrc && <Image src={hoverImageSrc} alt="" fill sizes={sizes} quality={PHOTO_QUALITY} className="product-card-image-alt" />}
        {badgeOnImage && <span className="product-card-image-badge">{stock}</span>}
      </div>
      {!badgeOnImage && stock}
      {code && <p className="product-card-code">{code}</p>}
      <p className="product-card-name">{name}</p>
      <p className="product-card-material">{materialLabel}</p>
      <PriceDisplay amount={price} />
      {jacketMaterialName && (
      <div className="product-card-jacket-row">
        <span className="mini-swatch" style={{ backgroundColor: jacketSwatchHex }} aria-hidden="true">
          {jacketSwatchUrl && <Image src={jacketSwatchUrl} alt="" fill sizes="24px" className="mini-swatch-photo" />}
        </span>
        <span>{jacketMaterialName}</span>
      </div>
      )}
    </Link>
  );
  if (!favouriteId) return card;
  // The heart sits beside the link, never inside it (no button within a link).
  return (
    <div className="product-card-shell">
      {card}
      <FavouriteButton listingId={favouriteId} className="product-card-favourite" />
    </div>
  );
}
