import { armorMitigationMultiplier } from "~/data/multipliers.ts";

const calcCloseness = 10;
export function calculate(
  title: string,
  target: number,
  previousCalc: number,
  previousDesc: string,
  vers: number,
  multiplier: number,
) {
  const calc = previousCalc * multiplier;
  const desc =
    multiplier != 1 ? `(${previousDesc})*${String(multiplier)}` : previousDesc;
  const calcPercentage = calc / target;
  const isCalcAccurate = Math.abs(calc - target) < calcCloseness;

  const preArmorMitigationCalc = calc * armorMitigationMultiplier;
  const preArmorMitigationDesc = `(${desc})*${String(armorMitigationMultiplier)}`;
  const preArmorMitigationCalcPercentage = preArmorMitigationCalc / target;
  const isPreArmorMitigationCalcAccurate =
    Math.abs(preArmorMitigationCalc - target) < calcCloseness;

  const versCalc = calc * vers;
  const versDesc = `(${desc})*${String(vers)}`;
  const versCalcPercentage = versCalc / target;
  const isVersCalcAccurate = Math.abs(versCalc - target) < calcCloseness;

  const preArmorMitigationAndVersCalc = calc * armorMitigationMultiplier * vers;
  const preArmorMitigationAndVersDesc = `((${desc})*${String(armorMitigationMultiplier)})*${String(vers)}`;
  const preArmorMitigationAndVersCalcPercentage = preArmorMitigationAndVersCalc / target;
  const isPreArmorMitigationVersCalcAccurate =
    Math.abs(preArmorMitigationAndVersCalc - target) < calcCloseness;

  return {
    title,
    calc,
    desc,
    calcPercentage,
    isCalcAccurate,
    preArmorMitigationCalc,
    preArmorMitigationDesc,
    preArmorMitigationCalcPercentage,
    isPreArmorMitigationCalcAccurate,
    versCalc,
    versDesc,
    versCalcPercentage,
    isVersCalcAccurate,
    preArmorMitigationAndVersCalc,
    preArmorMitigationAndVersDesc,
    preArmorMitigationAndVersCalcPercentage,
    isPreArmorMitigationVersCalcAccurate,
  };
}

export function sortCalcs(
  a: ReturnType<typeof calculate>,
  b: ReturnType<typeof calculate>,
): number {
  return (
    Number(b.isCalcAccurate) - Number(a.isCalcAccurate) ||
    Number(b.isVersCalcAccurate) - Number(a.isVersCalcAccurate) ||
    Number(b.isPreArmorMitigationCalcAccurate) -
      Number(a.isPreArmorMitigationCalcAccurate) ||
    Number(b.isPreArmorMitigationVersCalcAccurate) -
      Number(a.isPreArmorMitigationVersCalcAccurate)
  );
}
