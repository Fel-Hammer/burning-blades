import { useState } from "react";

import { Badge } from "~/components/ui/badge.tsx";
import { Button } from "~/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card.tsx";
import { Icon } from "~/components/ui/icon.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table.tsx";
import type { calculate } from "~/lib/calculate.ts";

function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number;
  onCopy?: () => void;
} = {}) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Can be falsy
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);

      if (onCopy) {
        onCopy();
      }

      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    }, console.error);
  };

  return { isCopied, copyToClipboard };
}

function toPercentString(num: number) {
  return num.toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: 2,
  });
}

function CopyCalculationButton({
  calc,
}: {
  calc: ReturnType<typeof calculate>;
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => {
        copyToClipboard(
          [
            "```",
            calc.title,
            "----------",
            `${calc.desc}=${String(calc.calc.toFixed(0))} (${toPercentString(calc.calcPercentage)})`,
            `${calc.versDesc}=${String(calc.versCalc.toFixed(0))} (${toPercentString(calc.versCalcPercentage)})`,
            `${calc.preArmorMitigationDesc}=${String(calc.preArmorMitigationCalc.toFixed(0))} (${toPercentString(calc.preArmorMitigationCalcPercentage)})`,
            `${calc.preArmorMitigationAndVersDesc}=${String(calc.preArmorMitigationAndVersCalc.toFixed(0))} (${toPercentString(calc.preArmorMitigationAndVersCalcPercentage)})`,
            "```",
          ].join("\n"),
        );
      }}
    >
      <Icon name={isCopied ? "check" : "clipboard-copy"} size="sm" />
    </Button>
  );
}

export function CalculationCard({
  calc,
}: {
  calc: ReturnType<typeof calculate>;
}) {
  return (
    <Card>
      <CardHeader className="flex justify-between md:flex-row md:items-center">
        <CardTitle>{calc.title}</CardTitle>
        <CopyCalculationButton calc={calc} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Formula</TableHead>
              <TableHead className="hidden text-center sm:table-cell">
                Verdict
              </TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="font-medium font-mono">{calc.desc}</div>
              </TableCell>
              <TableCell className="hidden text-center sm:table-cell">
                {calc.isCalcAccurate ? (
                  <Badge>Accurate</Badge>
                ) : (
                  <Badge variant="secondary">Not Accurate</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {String(Math.ceil(calc.calc))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium font-mono">{calc.versDesc}</div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  Multiplied by Versatility
                </div>
              </TableCell>
              <TableCell className="hidden text-center sm:table-cell">
                {calc.isVersCalcAccurate ? (
                  <Badge>Accurate</Badge>
                ) : (
                  <Badge variant="secondary">Not Accurate</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {String(Math.ceil(calc.versCalc))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium font-mono">
                  {calc.preArmorMitigationDesc}
                </div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  Pre-armor Mitigation
                </div>
              </TableCell>
              <TableCell className="hidden text-center sm:table-cell">
                {calc.isPreArmorMitigationCalcAccurate ? (
                  <Badge>Accurate</Badge>
                ) : (
                  <Badge variant="secondary">Not Accurate</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {String(Math.ceil(calc.preArmorMitigationCalc))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="font-medium font-mono">
                  {calc.preArmorMitigationAndVersDesc}
                </div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  Pre-armor Mitigation and multiplied by Versatility
                </div>
              </TableCell>
              <TableCell className="hidden text-center sm:table-cell">
                {calc.isPreArmorMitigationVersCalcAccurate ? (
                  <Badge>Accurate</Badge>
                ) : (
                  <Badge variant="secondary">Not Accurate</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {String(Math.ceil(calc.preArmorMitigationAndVersCalc))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
