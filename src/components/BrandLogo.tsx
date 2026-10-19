type BrandLogoProps = {
  className?: string;
  showWordmark?: boolean;
  institutional?: boolean;
};

/** Uses the supplied mark itself, preserving the exact gear, profile and metallic shading. */
export default function BrandLogo({ className = '', showWordmark = true, institutional = false }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${institutional ? 'brand-logo--institutional' : ''} ${className}`.trim()}>
      <svg className="brand-logo__mark" viewBox="0 0 391 391" role="img" aria-label={showWordmark ? undefined : 'Símbolo de Mr. Robot Bolivia'} aria-hidden={showWordmark || undefined}>
        <image href="/images/mr-robot-mark.png" width="391" height="391" />
      </svg>
      {showWordmark && <span className="brand-name">MR<span className="text-accent">.</span> ROBOT <small>{institutional ? 'SOFTWARE A MEDIDA · BOLIVIA' : 'BOLIVIA'}</small></span>}
    </span>
  );
}
