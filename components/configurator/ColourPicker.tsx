import { SwatchGrid, type SwatchGridItem } from '@/components/configurator/SwatchGrid';

export interface ColourPickerProps {
  /** Already filtered/flagged by the caller for availability on the current design (UX-C5). */
  colours: SwatchGridItem[];
  selectedColourId?: string;
  onSelect: (id: string) => void;
  disabledAnnouncement: string;
  lowStockAnnouncement: string;
}

/** docs/3-components.md §4.2a — thin wrapper over SwatchGrid. */
export function ColourPicker({
  colours,
  selectedColourId,
  onSelect,
  disabledAnnouncement,
  lowStockAnnouncement,
}: ColourPickerProps) {
  return (
    <SwatchGrid
      items={colours}
      selectedId={selectedColourId}
      onSelect={onSelect}
      columns={{ mobile: 5, tablet: 7, desktop: 8 }}
      disabledAnnouncement={disabledAnnouncement}
      lowStockAnnouncement={lowStockAnnouncement}
    />
  );
}
