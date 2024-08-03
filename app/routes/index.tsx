import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { z } from "zod";

import { CalculationCard } from "~/components/CalculationCard.tsx";
import { Field, FieldError } from "~/components/Field.tsx";
import { H1, H2, Lead } from "~/components/typography.tsx";
import { Button } from "~/components/ui/button.tsx";
import { Input } from "~/components/ui/input.tsx";
import { Label } from "~/components/ui/label.tsx";
import {
  burningBladesMultiplier,
  burningBladesNumberOfTicks,
  burningBloodMultiplier,
  chaosBrandMultiplier,
  fieryDemiseMultiplier,
  specAuraMultiplier,
} from "~/data/multipliers.ts";
import { calculate, sortCalcs } from "~/lib/calculate.ts";
import { referer, serverTiming } from "~/lib/constants";
import { combineHeaders } from "~/lib/misc.ts";
import { makeTimings, time } from "~/lib/timing.server.ts";

const formSchema = z.object({
  initial: z.number().gte(0),
  tick: z.number().gte(0),
  vers: z.number().gte(0),
});

const paramSchema = z.object({
  initial: z.coerce.number().gte(0),
  tick: z.coerce.number().gte(0),
  vers: z.coerce.number().gte(0),
});

export async function action({ request }: ActionFunctionArgs) {
  const timings = makeTimings("index action");

  const formData = await time(() => request.formData(), {
    type: "get form data",
    timings,
  });

  const submission = parseWithZod(formData, { schema: formSchema });

  if (submission.status !== "success") {
    return json(submission.reply(), {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      headers: combineHeaders({ [serverTiming]: timings.toString() }),
    });
  }

  const refererHeader = request.headers.get(referer);

  if (refererHeader) {
    const refererAsUrl = new URL(refererHeader);
    refererAsUrl.searchParams.set("initial", String(submission.value.initial));
    refererAsUrl.searchParams.set("tick", String(submission.value.tick));
    refererAsUrl.searchParams.set("vers", String(submission.value.vers));
    return redirect(refererAsUrl.toString(), {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      headers: combineHeaders({ [serverTiming]: timings.toString() }),
    });
  }

  const currentUrl = new URL(request.url);
  currentUrl.searchParams.set("initial", String(submission.value.initial));
  currentUrl.searchParams.set("tick", String(submission.value.tick));
  currentUrl.searchParams.set("vers", String(submission.value.vers));
  return redirect(currentUrl.toString(), {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    headers: combineHeaders({ [serverTiming]: timings.toString() }),
  });
}

export async function loader({ request }: ActionFunctionArgs) {
  const timings = makeTimings("index loader");

  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;

  const parsedParams = await time(
    () =>
      paramSchema.safeParseAsync({
        initial: searchParams.get("initial"),
        tick: searchParams.get("tick"),
        vers: searchParams.get("vers"),
      }),
    {
      type: "parse query params",
      timings,
    },
  );
  if (!parsedParams.success) {
    console.error("unable to parse params", parsedParams.error);
    return json(
      {
        initial: 0,
        tick: 0,
        vers: 0,
        calcs: [],
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        headers: combineHeaders({ [serverTiming]: timings.toString() }),
      },
    );
  }

  const data = parsedParams.data;

  const versMultiplier = 1.0 + data.vers / 100;

  const base = calculate(
    "No Multipliers",
    data.tick,
    (data.initial * burningBladesMultiplier) / burningBladesNumberOfTicks,
    `(${String(data.initial)}*${String(burningBladesMultiplier)})/${String(burningBladesNumberOfTicks)}`,
    versMultiplier,
    1,
  );

  const chaosBrand = calculate(
    "Chaos Brand",
    data.tick,
    base.calc,
    base.desc,
    versMultiplier,
    chaosBrandMultiplier,
  );
  const burningBlood = calculate(
    "Burning Blood",
    data.tick,
    base.calc,
    base.desc,
    versMultiplier,
    burningBloodMultiplier,
  );
  const specAura = calculate(
    "Spec Aura",
    data.tick,
    base.calc,
    base.desc,
    versMultiplier,
    specAuraMultiplier,
  );
  const fieryDemise = calculate(
    "Fiery Demise",
    data.tick,
    base.calc,
    base.desc,
    versMultiplier,
    fieryDemiseMultiplier,
  );

  const chaosBrandAndBurningBlood = calculate(
    "Chaos Brand + Burning Blood",
    data.tick,
    chaosBrand.calc,
    chaosBrand.desc,
    versMultiplier,
    burningBloodMultiplier,
  );
  const chaosBrandAndSpecAura = calculate(
    "Chaos Brand + Spec Aura",
    data.tick,
    chaosBrand.calc,
    chaosBrand.desc,
    versMultiplier,
    specAuraMultiplier,
  );
  const chaosBrandAndFieryDemise = calculate(
    "Chaos Brand + Fiery Demise",
    data.tick,
    chaosBrand.calc,
    chaosBrand.desc,
    versMultiplier,
    fieryDemiseMultiplier,
  );

  const burningBloodAndSpecAura = calculate(
    "Burning Blood + Spec Aura",
    data.tick,
    burningBlood.calc,
    burningBlood.desc,
    versMultiplier,
    specAuraMultiplier,
  );

  const chaosBrandAndBurningBloodAndFieryDemise = calculate(
    "Chaos Brand + Burning Blood + Fiery Demise",
    data.tick,
    chaosBrandAndBurningBlood.calc,
    chaosBrandAndBurningBlood.desc,
    versMultiplier,
    fieryDemiseMultiplier,
  );

  return json(
    {
      initial: data.initial,
      tick: data.tick,
      vers: data.vers,
      calcs: [
        base,
        chaosBrand,
        burningBlood,
        specAura,
        fieryDemise,
        chaosBrandAndBurningBlood,
        chaosBrandAndSpecAura,
        chaosBrandAndFieryDemise,
        burningBloodAndSpecAura,
        chaosBrandAndBurningBloodAndFieryDemise,
      ].sort(sortCalcs),
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      headers: combineHeaders({ [serverTiming]: timings.toString() }),
    },
  );
}

export function ErrorBoundary() {
  return (
    <>
      <div className="pb-8 space-y-2">
        <H1>Is Burning Blades doing the right damage?</H1>
        <Lead>
          Even we can&apos;t verify if it did the right amount of damage.
        </Lead>
      </div>
      <section className="hidden md:block">
        <div className="overflow-hidden rounded-lg border bg-background px-4 shadow">
          <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
            <H2>404</H2>
            <Lead>Unable to verify damage</Lead>
          </div>
        </div>
      </section>
    </>
  );
}

function CalculationForm() {
  const data = useLoaderData<typeof loader>();
  // Last submission returned by the server
  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: formSchema });
    },

    defaultValue: {
      initial: data.initial,
      tick: data.tick,
      vers: data.vers,
    },

    // Validate the form on blur event triggered
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Form
      className="flex flex-col md:flex-row md:flex-grow gap-2"
      method="post"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate
    >
      <Field>
        <Label htmlFor={fields.initial.id}>Initial Hit</Label>
        <Input
          {...getInputProps(fields.initial, {
            type: "number",
            ariaAttributes: true,
          })}
        />
        {fields.initial.errors ? (
          <FieldError>{fields.initial.errors}</FieldError>
        ) : null}
      </Field>
      <Field>
        <Label htmlFor={fields.tick.id}>Damage Per Tick</Label>
        <Input
          {...getInputProps(fields.tick, {
            type: "number",
            ariaAttributes: true,
          })}
        />
        {fields.tick.errors ? (
          <FieldError>{fields.tick.errors}</FieldError>
        ) : null}
      </Field>
      <Field>
        <Label htmlFor={fields.vers.id}>Versatility Percentage</Label>
        <Input
          {...getInputProps(fields.vers, {
            type: "number",
            ariaAttributes: true,
          })}
        />
        {fields.vers.errors ? (
          <FieldError>{fields.vers.errors}</FieldError>
        ) : null}
      </Field>
      <div className="flex">
        <Button className="self-end w-full" type="submit">
          Submit
        </Button>
      </div>
    </Form>
  );
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <div className="pb-8 space-y-2">
        <H1>Is Burning Blades doing the right damage?</H1>
        <Lead>
          Verify your Burning Blades damage with all applicable multipliers.
        </Lead>
      </div>
      <div className="space-y-4">
        <CalculationForm />
        {data.calcs.map((calc) => (
          <CalculationCard key={calc.title} calc={calc} />
        ))}
      </div>
    </>
  );
}
