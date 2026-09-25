import { FooterCol } from './links';

export function Footer() {
  return (
    <footer className="bg-primary pt-16 text-white">
      <div className="container mx-auto px-8 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
          <div className="max-w-[300px] space-y-6">
            <div className="flex flex-col leading-none">
              <span className="text-[20px] font-black tracking-[-0.02em]">RECURSOS</span>
              <span className="text-[20px] font-normal">HUMANOS</span>
            </div>
            <p className="text-[10px] leading-relaxed opacity-70 tracking-wider">
              TRANSFORMANDO A GESTÃO DE TALENTOS COM TECNOLOGIA E INTELIGÊNCIA EDITORIAL.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 lg:gap-16">
            <FooterCol title="EMPRESA"  links={['SOBRE NÓS', 'CARREIRAS']} />
            <FooterCol title="RECURSOS" links={['PRIVACIDADE', 'TERMOS DE USO']} />
            <FooterCol title="SUPORTE"  links={['AJUDA', 'CONFIGURAÇÕES']} />
            <FooterCol title="CONTATO"  links={['0800 NOVA HR', 'EMAIL']} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center py-8 border-t border-white/10 gap-6">
          <p className="text-[10px] opacity-40">© 2024 NOVA INTELLECTUAL ARCHIVE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            {['LINKEDIN', 'TWITTER', 'INSTAGRAM'].map(s => (
              <a key={s} href="#" className="text-[10px] opacity-60 hover:opacity-100">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
