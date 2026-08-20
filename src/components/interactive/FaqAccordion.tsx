import { Accordion } from "@base-ui/react/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

/** FAQ accordion built on Base UI for keyboard/screen-reader support. */
export default function FaqAccordion({ items, chevronIcon }: { items: FaqItem[]; chevronIcon: string; }) {
  return (
    <Accordion.Root className="w-full" multiple>
      {items.map((item) => (
        <Accordion.Item key={item.question} value={item.question} className="border-t border-cherry">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full cursor-pointer items-center gap-6 py-5 text-left">
              <div className="flex-1">
                <span className="max-w-180 text-lead font-bold text-cherry">
                  {item.question}
                </span>
              </div>
              <img
                src={chevronIcon}
                alt=""
                aria-hidden="true"
                className="size-6 shrink-0 self-center object-contain transition-transform duration-300 group-data-panel-open:rotate-180"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden text-cherry transition-[height] duration-300 ease-out data-ending-style:h-0 data-starting-style:h-0">
            <p className="body-lg max-w-180 pb-6">{item.answer}</p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
