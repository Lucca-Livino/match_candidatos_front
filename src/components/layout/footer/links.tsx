interface FooterColProps {
  title: string;
  links: string[];
}

export function FooterCol({ title, links }: FooterColProps) {
  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-[12px] font-bold uppercase tracking-[0.3em]">{title}</h4>
      <div className="flex flex-col gap-3">
        {links.map(link => (
          <a key={link} href="#" className="text-[10px] opacity-60 hover:opacity-100">{link}</a>
        ))}
      </div>
    </div>
  );
}
