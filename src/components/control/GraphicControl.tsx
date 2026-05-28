import type { GraphicType } from '@/types/rally';
import { useRallyStore } from '@/store/rallyStore';
import { label } from '@/lib/i18n';

interface Props {
  label: string;
  graphicId: GraphicType;
  onTake: (id: GraphicType) => void;
  onClear: (id: GraphicType) => void;
  isLive?: boolean;
}

const GraphicControl = ({ label: itemLabel, graphicId, onTake, onClear, isLive }: Props) => {
  const settings = useRallyStore(s => s.settings);
  return (
    <div className="flex items-center gap-2 py-2 px-3 border border-border/50 bg-card">
      <div className="flex-1 flex items-center gap-2">
        {isLive && <div className="w-2 h-2 rounded-full bg-rally-red animate-pulse" />}
        <span className="text-sm font-medium text-foreground">{itemLabel}</span>
      </div>
      <button
        onClick={() => onTake(graphicId)}
        className="px-4 py-1.5 text-xs font-bold tracking-wider bg-rally-green text-white hover:bg-rally-green/80 transition-colors uppercase"
      >
        {label('TAKE', settings.language, settings.customLabels)}
      </button>
      <button
        onClick={() => onClear(graphicId)}
        className="px-4 py-1.5 text-xs font-bold tracking-wider bg-rally-red text-white hover:bg-rally-red/80 transition-colors uppercase"
      >
        {label('CLEAR', settings.language, settings.customLabels)}
      </button>
    </div>
  );
};

export default GraphicControl;
