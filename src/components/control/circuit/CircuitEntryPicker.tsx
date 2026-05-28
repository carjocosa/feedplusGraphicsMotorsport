import { useCircuitStore } from '@/store/circuitStore';
import EntryPicker from '../EntryPicker';
import type { CircuitEntry } from '@/types/circuit';

interface Props {
  label?: string;
  onPick: (entry: CircuitEntry) => void;
  buttonClassName?: string;
}

const CircuitEntryPicker = ({ label, onPick, buttonClassName }: Props) => {
  const entries = useCircuitStore((s) => s.entries);

  return (
    <EntryPicker<CircuitEntry>
      entries={entries}
      label={label}
      onPick={onPick}
      buttonClassName={buttonClassName}
      entryLabel="pilotos"
    />
  );
};

export default CircuitEntryPicker;
