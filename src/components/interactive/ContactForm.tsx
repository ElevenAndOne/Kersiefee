import { Select } from "@base-ui/react/select";
import { useState } from "react";

const PROVINCES = [
  "Wes-Kaap",
  "Oos-Kaap",
  "Noord-Kaap",
  "Vrystaat",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Noordwes",
];

const fieldClasses =
  "h-16 w-full rounded-blob bg-blossom px-6 text-cherry placeholder:text-cherry/70 outline-none transition focus-visible:ring-2 focus-visible:ring-cherry";

/**
 * Contact form. Uses a Base UI Select for the province picker so the
 * dropdown is fully accessible; plain labelled inputs elsewhere.
 */
export default function ContactForm({ selectIcon }: { selectIcon: string; }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="h3 py-16 text-center" role="status">
        Dankie! Ons het jou boodskap ontvang en sal gou terugkom na jou toe. 🍒
      </p>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid grid-cols-2 gap-6 landscape:grid-cols-1">
        <label className="sr-only" htmlFor="contact-name">Jou naam</label>
        <input id="contact-name" name="name" required placeholder="Jou naam" className={fieldClasses} />
        <label className="sr-only" htmlFor="contact-email">Epos Adres</label>
        <input id="contact-email" name="email" type="email" required placeholder="Epos Adres" className={fieldClasses} />
        <label className="sr-only" htmlFor="contact-phone">Jou nommer</label>
        <input id="contact-phone" name="phone" type="tel" placeholder="Jou nommer" className={fieldClasses} />

        <Select.Root items={PROVINCES.map((p) => ({ label: p, value: p }))}>
          <Select.Trigger
            aria-label="Provinsie"
            className={fieldClasses + " flex cursor-pointer items-center justify-between gap-2 text-left data-placeholder:text-cherry/70"}
          >
            <Select.Value placeholder="Provinsie" />
            <Select.Icon className="flex size-6 shrink-0 items-center justify-center">
              <img src={selectIcon} alt="" aria-hidden="true" className="h-3.5 w-2.5 rotate-90" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={8} className="z-50 outline-none">
              <Select.Popup className="max-h-[min(24rem,var(--available-height))] w-(--anchor-width) overflow-y-auto rounded-blob bg-white py-2 shadow-pop">
                {PROVINCES.map((province) => (
                  <Select.Item
                    key={province}
                    value={province}
                    className="flex cursor-pointer items-center gap-2 px-6 py-2.5 text-cherry outline-none data-highlighted:bg-blossom"
                  >
                    <Select.ItemIndicator className="text-cherry">
                      <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden="true">
                        <path
                          d="M2.5 8.5l3.5 3.5 7-8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Select.ItemIndicator>
                    <Select.ItemText>{province}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>

        <label className="sr-only" htmlFor="contact-message">Jou Boodskap</label>
        <textarea
          id="contact-message"
          name="message"
          required
          placeholder="Jou Boodskap"
          rows={4}
          className="col-span-full w-full resize-none rounded-blob bg-blossom px-6 py-4 text-cherry placeholder:text-cherry/70 outline-none transition focus-visible:ring-2 focus-visible:ring-cherry"
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="group inline-flex cursor-pointer items-center gap-4 rounded-full bg-cherry pl-7 pr-2 py-1.5 text-button capitalize text-white transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
        >
          <span className="whitespace-nowrap py-1.5">Stuur Boodskap</span>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-cherry transition-transform duration-300 group-hover:rotate-360">
            <svg className="h-3 w-5" viewBox="0 0 19.2474 12.2034" fill="currentColor" aria-hidden="true">
              <path d="M11.801 10.0095C12.9002 9.16004 13.5482 8.54752 15.0758 7.54991C15.0608 7.52291 12.6582 7.61182 12.644 7.61227C10.187 7.68768 9.79572 7.72833 7.33827 7.76621C5.69389 7.79156 3.88339 7.85407 2.39014 7.82587C0.984344 7.79932 0.389669 7.63762 0.124769 7.13294C-0.570293 5.80889 1.83616 5.85794 2.48089 5.80841C3.61328 5.72144 4.74679 5.72291 5.88049 5.67644C7.39313 5.61446 8.90656 5.57242 10.4203 5.55037C10.7792 5.54516 12.8 5.55461 14.2502 5.59173C13.2676 4.61936 12.3567 3.74988 11.9582 3.34117C11.3503 2.71766 10.8515 2.35912 10.3838 1.57976C9.86659 0.717668 11.0817 -0.403956 11.5997 0.145681C12.3635 0.956244 13.1263 1.79729 14.0138 2.59968C15.146 3.62347 16.3668 4.56329 17.7398 5.24287C19.5 6.11414 19.8865 7.28032 17.9955 8.28727C16.5323 9.06648 15.1432 9.98489 13.8531 11.026C13.0602 11.666 12.7064 11.9769 11.9894 12.1639C10.8249 12.4677 10.5865 10.9481 11.801 10.0095Z" />
            </svg>
          </span>
        </button>
      </div>
    </form>
  );
}
