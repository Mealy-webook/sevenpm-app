import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { resaleListings, type ResaleListing } from "./data/resale";

/**
 * Which resale listings are still going.
 *
 * Booking one has to do *something*, and the only honest something this build
 * can do is take it off the market: there is no payment service behind the
 * confirm, so the listing leaves the list and nothing claims a receipt was
 * issued. It is held here rather than in the screen because the list and the
 * ticket that is booked from it are two different screens.
 *
 * Not persisted, like the session — every launch starts the market full.
 */
type Resale = {
  /** Still for sale. */
  open: ResaleListing[];
  /** Everything, so a booked listing can still be opened by its id. */
  all: ResaleListing[];
  taken: (id: string) => boolean;
  take: (id: string) => void;
};

const ResaleContext = createContext<Resale>({
  open: resaleListings,
  all: resaleListings,
  taken: () => false,
  take: () => {},
});

export function ResaleProvider({ children }: { children: React.ReactNode }) {
  const [taken, setTaken] = useState<string[]>([]);

  const take = useCallback((id: string) => {
    setTaken((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const value = useMemo(
    () => ({
      open: resaleListings.filter((listing) => !taken.includes(listing.id)),
      all: resaleListings,
      taken: (id: string) => taken.includes(id),
      take,
    }),
    [taken, take],
  );

  return <ResaleContext.Provider value={value}>{children}</ResaleContext.Provider>;
}

export function useResale() {
  return useContext(ResaleContext);
}
