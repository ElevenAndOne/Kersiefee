import { Accordion } from "@base-ui/react/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

/** FAQ accordion built on Base UI for keyboard/screen-reader support. */
export default function FaqAccordion({ items }: { items: FaqItem[]; }) {
  return (
    <Accordion.Root className="w-full border-b border-cherry" multiple>
      {items.map((item) => (
        <Accordion.Item key={item.question} value={item.question} className="border-t border-cherry">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full cursor-pointer items-center gap-6 py-5 text-left">
              <span className="flex-1 text-lead font-bold text-cherry">
                {item.question}
              </span>
              <svg
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
                className="size-8 shrink-0 transition-transform duration-300 group-data-panel-open:rotate-180"
              >
                <path
                  d="M8.5 20 L16 12.5 L23.5 20"
                  stroke="#EC1848"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden text-cherry transition-[height] duration-300 ease-out data-ending-style:h-0 data-starting-style:h-0">
            <p className="body-lg max-w-3xl pb-6">{item.answer}</p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
