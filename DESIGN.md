# DESIGN.md — echo karaoke

## Color (OKLCH, neutros tintados ao roxo da marca; nunca #000/#fff)

### Marca
- `--brand-magenta: oklch(0.61 0.235 354)`   /* #DF2F9E */
- `--brand-purple:  oklch(0.40 0.20 295)`    /* #5124AF */
- `--brand-blue:    oklch(0.585 0.18 260)`   /* #2871E7 */
- `--brand-gradient: linear-gradient(120deg, magenta → purple → blue)`

### Neutros escuros (hue 295)
- `--bg:        oklch(0.16 0.02 295)`
- `--surface:   oklch(0.21 0.025 295)`
- `--surface-2: oklch(0.26 0.03 295)`
- `--border:    oklch(0.32 0.03 295)`
- `--text:      oklch(0.96 0.012 295)`
- `--text-dim:  oklch(0.72 0.02 295)`

Estratégia de cor: **committed** — o gradiente da marca carrega os momentos de destaque
(splash, "Cantar agora", barra do player, acentos), sobre uma base escura neutra.

## Typography (self-hosted, frontend/fonts/)
- Display: **Clash Display** (600/700) — wordmark, títulos, números grandes.
- Corpo/UI: **General Sans** (400/500/600) — textos, botões, listas.
- Escala com contraste ≥1.25. Corpo 15-16px; títulos 28-56px.
- Fallback: system-ui, sans-serif.

## Motion
- Easing: `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`. Sem bounce/elastic.
- Reveal de entrada em stagger (animation-delay). Onda sonora: `transform: scaleY`.
- Nunca animar propriedades de layout. Respeitar `prefers-reduced-motion`.

## Components / regras
- Raio padrão `--radius: 16px`; pílulas para botões principais.
- Bordas completas (sem side-stripe). Glass só intencional, não padrão.
- Sem gradient-text: o gradiente vive no logo/superfícies, texto em cor sólida.
- Foto de fundo (img/background.jpg) tratada com scrim escuro + tint da marca.
