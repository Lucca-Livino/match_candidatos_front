import { Phone, MapPin, ExternalLink } from 'lucide-react';

interface ContatoLinhasProps {
  telefone?: string;
  cidade?: string;
  linkedin?: string;
}

// Reaproveitado pelo diálogo do recrutador: o mesmo contato, lido pelos dois lados.
export function ContatoLinhas({ telefone, cidade, linkedin }: ContatoLinhasProps) {
  if (!telefone && !cidade && !linkedin) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[13px] text-on-surface-variant">
      {telefone && (
        <span className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          {telefone}
        </span>
      )}
      {cidade && (
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {cidade}
        </span>
      )}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-secondary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          LinkedIn
        </a>
      )}
    </div>
  );
}
