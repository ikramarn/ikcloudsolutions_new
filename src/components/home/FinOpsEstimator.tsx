'use client';

import { useId, useState } from 'react';
import { ConsultationButton } from '@/components/forms/ConsultationButton';
import { Card } from '@/components/ui/Card';
import { RadioGroup } from '@/components/ui/FormControls';
import { finopsCaption, finopsInputs } from '@/content/finops';
import { clampSavingPercent, clampSpend, estimateSaving, formatPounds } from '@/lib/finops';

const providers = ['AWS', 'Azure', 'GCP', 'Oracle Cloud', 'Multi-cloud'] as const;

const architectures = [
  {
    value: 'vms',
    label: 'Virtual machines and a monolith',
    focus: 'Rightsizing, commitment planning and storage tiers.',
  },
  {
    value: 'containers',
    label: 'Basic containers',
    focus: 'Cluster sizing, node pools and idle environments.',
  },
  {
    value: 'microservices',
    label: 'Distributed microservices',
    focus: 'Cost allocation per service, autoscaling limits and data transfer.',
  },
] as const;

type ArchitectureValue = (typeof architectures)[number]['value'];

/** An illustration driven by the saving percentage the visitor chooses. It is never a quote. */
export function FinOpsEstimator() {
  const spendId = useId();
  const savingId = useId();
  const [provider, setProvider] = useState<string>(providers[0]);
  const [architecture, setArchitecture] = useState<ArchitectureValue>('vms');
  const [spend, setSpend] = useState<number>(finopsInputs.spend.initial);
  const [saving, setSaving] = useState<number>(finopsInputs.savingPercent.initial);

  const result = estimateSaving(spend, saving);
  const focus = architectures.find((item) => item.value === architecture)?.focus;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <Card className="space-y-6 lg:col-span-7">
        <RadioGroup
          name="finops-provider"
          legend="Cloud provider"
          value={provider}
          onChange={setProvider}
          options={providers.map((item) => ({ value: item, label: item }))}
        />
        <RadioGroup
          name="finops-architecture"
          legend="Current architecture"
          value={architecture}
          onChange={(value) => {
            const match = architectures.find((item) => item.value === value);
            if (match) setArchitecture(match.value);
          }}
          options={architectures.map((item) => ({ value: item.value, label: item.label }))}
        />
        <div>
          <label
            htmlFor={spendId}
            className="flex justify-between text-sm font-semibold text-slate-100"
          >
            <span>Monthly cloud spend</span>
            <span className="text-cyan-300">{formatPounds(spend)}</span>
          </label>
          <input
            id={spendId}
            type="range"
            min={finopsInputs.spend.min}
            max={finopsInputs.spend.max}
            step={finopsInputs.spend.step}
            value={spend}
            onChange={(event) => setSpend(clampSpend(Number(event.target.value)))}
            aria-valuetext={formatPounds(spend)}
            className="mt-2 h-11 w-full accent-cyan-400"
          />
        </div>
        <div>
          <label
            htmlFor={savingId}
            className="flex justify-between text-sm font-semibold text-slate-100"
          >
            <span>Saving you want to test (your assumption)</span>
            <span className="text-cyan-300">{saving}%</span>
          </label>
          <input
            id={savingId}
            type="range"
            min={finopsInputs.savingPercent.min}
            max={finopsInputs.savingPercent.max}
            step={finopsInputs.savingPercent.step}
            value={saving}
            onChange={(event) => setSaving(clampSavingPercent(Number(event.target.value)))}
            aria-valuetext={`${saving} percent`}
            className="mt-2 h-11 w-full accent-cyan-400"
          />
        </div>
      </Card>
      <Card variant="glow" className="space-y-4 lg:col-span-5">
        <h3 className="font-mono text-sm font-bold tracking-wider text-cyan-300 uppercase">
          Illustration
        </h3>
        <div aria-live="polite" className="space-y-3">
          <p className="text-slate-300">
            At {saving}% of {formatPounds(spend)} a month on {provider}:
          </p>
          <p className="text-3xl font-extrabold text-white">
            {formatPounds(result.monthly)} <span className="text-base font-normal">a month</span>
          </p>
          <p className="text-slate-200">{formatPounds(result.annual)} over twelve months</p>
        </div>
        <p className="text-sm text-slate-300">Where we would usually look first: {focus}</p>
        <p className="text-sm text-slate-300">{finopsCaption}</p>
        <ConsultationButton preset={{ focus: 'FinOps review' }}>
          Request a cloud cost review
        </ConsultationButton>
      </Card>
    </div>
  );
}
