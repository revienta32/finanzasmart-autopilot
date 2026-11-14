/**
 * PUREAI STUDIO — MULTILINGUAL INTERACTIVE TOOL MATRIX & RSS SYNDICATION ENGINE
 * Coste operativo: 0,00 €/mes (100% Client-Side + GitHub Pages + GitHub Actions).
 *
 * Genera progresivamente hasta 50 herramientas web interactivas (5 utilidades reales × 10 idiomas)
 * con motores binarios JavaScript reales above-the-fold (anti-Scaled Content Abuse), etiquetas
 * <link rel="alternate" hreflang="..."> cruzadas solo hacia URLs activas, JSON-LD (WebApplication + FAQPage)
 * y feed RSS 2.0 (feed.xml) para indexación automática en buscadores y agregadores.
 */

const SITE_URL = "https://pureaistudios.com";
const ROLLOUT_ANCHOR_ISO = "2026-11-14";
const INITIAL_UNLOCK_COUNT = 15; // Ola 1: 5 herramientas × 3 idiomas principales (EN, ES, PT)
const DAILY_UNLOCK_STEP = 8;     // +8 nuevas páginas interactivas al día automáticamente

const LANG_ORDER = ["en", "es", "pt", "de", "fr", "it", "ja", "ko", "tr", "pl"];

const LANG_PACKS = {
  en: {
    code: "en",
    hreflang: "en",
    label: "English",
    flag: "🇬🇧",
    badgeZeroUpload: "100% Local Browser Engine · 0 Server Uploads",
    dropPrompt: "Drop file here or click to select from your device",
    privacyNote: "Processed 100% in your device RAM. Your files never touch any external server.",
    openFullStudio: "Open Full PureAI Studio (Batch .ZIP + iPhone 16 Pro EXIF) →",
    cleanNowBtn: "⚡ Export Clean Copy (Free 1st File)",
    downloadCertBtn: "🪪 Download Forensic Proof Certificate (PNG)",
    extractFrameBtn: "🎬 Extract Clean HD Frame (PNG)",
    convertJpgBtn: "⚡ Convert to Clean sRGB JPG",
    stripPngBtn: "🧹 Strip Hidden PNG Prompts & Export Clean PNG",
    packOfferBadge: "⚡ One-Time Credit Packs from €2.99 (No Subscription)",
    packOfferTitle: "Need Batch .ZIP, MP4 Scrubbing or iPhone 16 Pro EXIF?",
    packOfferDesc: "Unlock 10 files (€2.99 one-time), 50 files + Batch .ZIP (€9.90), or Unlimited Annual Studio (€39/yr). Credits never expire.",
    packCta: "Open PureAI Studio →",
    dirLabel: "AI Tools Directory",
    extLabel: "Chrome Extension",
    threatsFound: "Hidden Metadata / AI Signatures Detected",
    cleanFound: "0 Hidden AI / GPS Threats Found in Container",
    faqHeading: "Frequently Asked Questions",
    tools: {
      "ai-photo-detector": {
        title: "Is This Photo or Video AI? Free C2PA, SynthID Risk & EXIF Forensic Detector (2026)",
        h1: "🔎 Is This Photo or Video AI? Instant C2PA, JUMBF & EXIF Forensic Scanner",
        lead: "Verify in 1 second why Instagram, TikTok, or stock agencies flag a photo or MP4 as 'Made with AI'. Inspect binary C2PA manifests, ComfyUI chunks, and GPS tags locally—plus download a shareable Forensic Proof Certificate.",
        q1: "How do Instagram and TikTok detect AI photos and videos?",
        a1: "Platforms parse binary C2PA/JUMBF boxes (APP11/uuid), XMP DigitalSourceType tags (trainedAlgorithmicMedia), and missing camera EXIF headers inside JPEG, PNG, WebP, and MP4 containers.",
        q2: "Does this AI detector upload my private images to a server?",
        a2: "No. Every byte is inspected locally inside your browser using JavaScript ArrayBuffers. Zero files or prompts ever leave your device."
      },
      "png-prompt-inspector": {
        title: "PNG Prompt & ComfyUI Workflow Inspector Online: View & Strip Hidden SDXL / Flux JSON",
        h1: "🧩 ComfyUI, Flux.1 & Stable Diffusion PNG Chunk Workflow Inspector",
        lead: "Drop any PNG render to read hidden tEXt / iTXt workflow JSON, positive/negative prompts, seed numbers, and LoRA weights—or strip them in 1 click before sharing publicly.",
        q1: "What metadata is hidden inside a ComfyUI or Automatic1111 PNG?",
        a1: "ComfyUI and Forge embed your entire node graph JSON, LoRA filenames, checkpoints, seeds, and prompts inside uncompressed tEXt and iTXt binary chunks.",
        q2: "How can I share PNG artwork without leaking my workflow?",
        a2: "Use the local PNG chunk stripper above to remove all non-essential text, XMP, and C2PA chunks while preserving lossless RGB pixels."
      },
      "photo-gps-remover": {
        title: "Photo EXIF GPS Location Viewer & Remover Online (100% Private, Zero Upload)",
        h1: "📍 Check & Remove Hidden GPS Coordinates from Smartphone Photos Locally",
        lead: "Audit exact binary EXIF GPS tags (0x8825), capture timestamps, and phone model identifiers hidden in your photos—and export a clean copy before posting to Reddit, Marketplace, or forums.",
        q1: "Do iPhone and Android photos contain my exact home GPS address?",
        a1: "Yes. By default, smartphone cameras write latitude, longitude, altitude, and exact capture time into the APP1 EXIF GPS IFD (0x8825) header.",
        q2: "Is removing EXIF metadata in the browser safer than cloud tools?",
        a2: "Yes. Cloud EXIF removers require uploading unstripped private photos to third-party servers, whereas PureAI Studio cleans them offline in your own browser."
      },
      "webp-png-to-jpg-clean": {
        title: "Convert WebP & PNG to Clean JPG Locally (Zero Upload + Strip C2PA & EXIF)",
        h1: "🖼️ Private WebP / PNG to Clean sRGB JPG Converter (0% C2PA Metadata)",
        lead: "Convert ChatGPT/DALL-E WebP downloads or Midjourney PNGs into universal high-quality sRGB JPEGs locally in your browser while automatically purging C2PA and EXIF tags.",
        q1: "Why convert DALL-E or ChatGPT WebP images to clean JPG?",
        a1: "ChatGPT saves images as WebP files packed with C2PA Content Credentials that many editors reject and social networks flag as AI.",
        q2: "Can I convert 50+ WebP or PNG images at once into a .ZIP?",
        a2: "Yes—click through to the main PureAI Studio to batch-convert up to 100 images into clean JPEGs with optional iPhone 16 Pro EXIF headers."
      },
      "mp4-frame-extractor": {
        title: "Extract HD First & Last Frame from MP4 Video Online (Clean PNG for Kling / Sora / Runway)",
        h1: "🎞️ MP4 Last-Frame & Keyframe HD Extractor (Zero C2PA Metadata)",
        lead: "Extract crisp, uncompressed PNG frames (first frame, exact timestamp, or final frame) from any MP4 video locally in your browser to extend AI video clips seamlessly in Kling, Runway, Luma, or Veo.",
        q1: "Why do AI video creators extract the exact last frame of an MP4?",
        a1: "Extending a 5-second AI video clip seamlessly requires feeding a clean, C2PA-free PNG of the final frame as the starting image for the next generation.",
        q2: "Does extracting a frame locally keep full video resolution?",
        a2: "Yes. The HTML5 video decoder renders the exact native pixel dimensions onto a lossless local canvas with zero server compression."
      }
    }
  },
  es: {
    code: "es",
    hreflang: "es",
    label: "Español",
    flag: "🇪🇸",
    badgeZeroUpload: "Motor 100% Local en tu Navegador · 0 Subidas al Servidor",
    dropPrompt: "Arrastra tu archivo aquí o haz clic para seleccionarlo",
    privacyNote: "Procesado 100% en la memoria RAM de tu dispositivo. Tus archivos jamás salen de tu navegador.",
    openFullStudio: "Abrir Suite Completa PureAI Studio (Lotes .ZIP + EXIF iPhone 16 Pro) →",
    cleanNowBtn: "⚡ Exportar Copia Limpia (1er Archivo Gratis)",
    downloadCertBtn: "🪪 Descargar Certificado Forense Compartible (PNG)",
    extractFrameBtn: "🎬 Extraer Fotograma HD Limpio (PNG)",
    convertJpgBtn: "⚡ Convertir a JPG sRGB Limpio",
    stripPngBtn: "🧹 Borrar Prompts Ocultos PNG y Descargar Limpio",
    packOfferBadge: "⚡ Pases de Pago Único desde 2,99 € (Sin Suscripción)",
    packOfferTitle: "¿Necesitas Lotes .ZIP, Vídeo MP4 o EXIF iPhone 16 Pro?",
    packOfferDesc: "Desbloquea 10 archivos (2,99 € pago único), 50 archivos + Lotes .ZIP (9,90 €) o Plan Anual Ilimitado (39 €/año). Tus créditos no caducan.",
    packCta: "Abrir PureAI Studio →",
    dirLabel: "Directorio IA",
    extLabel: "Extensión Chrome",
    threatsFound: "Rastros Ocultos de IA / Metadatos Detectados",
    cleanFound: "0 Rastros Ocultos de IA / GPS en el Contenedor",
    faqHeading: "Preguntas Frecuentes",
    tools: {
      "ai-photo-detector": {
        title: "Detector de Fotos y Vídeos IA Gratis: Escáner Forense C2PA, JUMBF y EXIF (Sin Subir Archivos)",
        h1: "🔎 ¿Esta Foto o Vídeo tiene Rastro de IA? Escáner Forense C2PA y EXIF Local",
        lead: "Comprueba en 1 segundo por qué Instagram, TikTok o bancos de stock marcan un archivo como 'Creado con IA'. Analiza manifiestos C2PA, prompts ocultos y GPS localmente y descarga tu Certificado Forense.",
        q1: "¿Cómo detectan Instagram y TikTok que una foto o vídeo es de IA?",
        a1: "Analizan cajas binarias C2PA/JUMBF, etiquetas XMP trainedAlgorithmicMedia y la ausencia de cabeceras ópticas EXIF dentro de archivos JPEG, PNG, WebP y MP4.",
        q2: "¿Este detector sube mis fotos o vídeos privados a internet?",
        a2: "No. El análisis binario ocurre 100% dentro de tu propio navegador mediante ArrayBuffers locales, con cero subidas a servidores externos."
      },
      "png-prompt-inspector": {
        title: "Visor y Limpiador de Prompts PNG y Workflows ComfyUI Online (SDXL / Flux JSON)",
        h1: "🧩 Inspector de Prompts Ocultos PNG y Grafos JSON de ComfyUI / Flux",
        lead: "Arrastra cualquier archivo PNG para leer los bloques ocultos tEXt / iTXt (workflow JSON de ComfyUI, seeds, LoRAs y prompts) o bórralos en 1 clic antes de compartir tu imagen.",
        q1: "¿Qué información secreta guarda un PNG generado en ComfyUI?",
        a1: "Guarda el grafo completo de nodos JSON, pesos LoRA, modelo base, semilla y prompt exacto dentro de chunks binarios tEXt e iTXt.",
        q2: "¿Cómo comparto mis renders PNG sin regalar mi workflow?",
        a2: "Pulsa el botón de limpieza local arriba para purgar todos los chunks de texto y C2PA manteniendo intacta la calidad lossless de píxeles."
      },
      "photo-gps-remover": {
        title: "Ver y Borrar Ubicación GPS EXIF de Fotos Online Gratis (100% Privado en Navegador)",
        h1: "📍 Inspector y Eliminador Local de Coordenadas GPS EXIF en Fotos del Móvil",
        lead: "Revisa si una foto del móvil esconde coordenadas binarias GPS (0x8825), fecha exacta y modelo de teléfono, y descarga una copia limpia sin subir tu imagen a la nube.",
        q1: "¿Las fotos del móvil guardan la ubicación exacta de mi casa?",
        a1: "Sí. Las cámaras de iPhone y Android graban latitud, longitud y hora exacta dentro del bloque binario EXIF GPS IFD (0x8825).",
        q2: "¿Por qué es más seguro limpiar el GPS desde el navegador?",
        a2: "Porque tus fotos personales jamás se envían a ningún servidor de terceros; la limpieza ocurre localmente en tu dispositivo."
      },
      "webp-png-to-jpg-clean": {
        title: "Convertir WebP y PNG a JPG Limpio sin Metadatos IA C2PA (100% Local y Gratis)",
        h1: "🖼️ Conversor Privado de WebP / PNG a JPG sRGB Limpio (Sin C2PA ni EXIF)",
        lead: "Convierte imágenes WebP de ChatGPT/DALL-E o PNGs de Midjourney a formato JPG universal de alta calidad eliminando al mismo tiempo cualquier firma oculta C2PA.",
        q1: "¿Por qué convertir los archivos WebP de ChatGPT a JPG limpio?",
        a1: "ChatGPT descarga imágenes en formato WebP con credenciales C2PA incrustadas que provocan avisos automáticos de IA en redes sociales.",
        q2: "¿Puedo convertir decenas de archivos WebP/PNG en un solo .ZIP?",
        a2: "Sí, abre PureAI Studio para procesar hasta 100 archivos en bloque e inyectar cabeceras ópticas iPhone 16 Pro o Sony A7IV."
      },
      "mp4-frame-extractor": {
        title: "Extraer Primer y Último Fotograma HD de un Vídeo MP4 Online (PNG Limpio sin C2PA)",
        h1: "🎞️ Extractor Local del Último Fotograma HD de Vídeos MP4 (Sora · Kling · Runway)",
        lead: "Extrae en máxima resolución el primer fotograma, último fotograma o instante exacto de cualquier vídeo MP4 como PNG limpio sin firmas C2PA para encadenar clips de vídeo IA.",
        q1: "¿Para qué sirve extraer el último fotograma exacto de un MP4?",
        a1: "Permite continuar vídeos generados en Kling, Runway, Sora o Veo usando el último frame limpio de C2PA como imagen inicial del siguiente clip.",
        q2: "¿Se pierde calidad al extraer el fotograma en el navegador?",
        a2: "No. Se exporta a la resolución nativa exacta del vídeo en formato PNG sin compresión en la nube."
      }
    }
  },
  pt: {
    code: "pt",
    hreflang: "pt",
    label: "Português",
    flag: "🇧🇷",
    badgeZeroUpload: "100% Local no Navegador · Zero Upload para Servidores",
    dropPrompt: "Arraste o arquivo aqui ou clique para selecionar",
    privacyNote: "Processado 100% na memória RAM do seu dispositivo. Seus arquivos nunca saem do navegador.",
    openFullStudio: "Abrir PureAI Studio Completo (Lote .ZIP + EXIF iPhone 16 Pro) →",
    cleanNowBtn: "⚡ Exportar Cópia Limpa (1º Arquivo Grátis)",
    downloadCertBtn: "🪪 Baixar Certificado Forense Compartilhável (PNG)",
    extractFrameBtn: "🎬 Extrair Frame HD Limpo (PNG)",
    convertJpgBtn: "⚡ Converter para JPG sRGB Limpo",
    stripPngBtn: "🧹 Remover Prompts Ocultos do PNG",
    packOfferBadge: "⚡ Pacotes sem Assinatura a partir de €2,99",
    packOfferTitle: "Precisa de Lote .ZIP, Vídeo MP4 ou EXIF iPhone 16 Pro?",
    packOfferDesc: "Desbloqueie 10 arquivos (€2,99 pagamento único), 50 arquivos + .ZIP (€9,90) ou Anual Ilimitado (€39/ano). Créditos nunca expiram.",
    packCta: "Abrir PureAI Studio →",
    dirLabel: "Diretório IA",
    extLabel: "Extensão Chrome",
    threatsFound: "Assinaturas Ocultas de IA / Metadados Detectados",
    cleanFound: "0 Ameaças Ocultas de IA / GPS no Arquivo",
    faqHeading: "Perguntas Frequentes",
    tools: {
      "ai-photo-detector": {
        title: "Detector de Fotos e Vídeos IA Grátis: Scanner Forense C2PA, SynthID e EXIF Online",
        h1: "🔎 Esta Foto ou Vídeo foi Feita por IA? Scanner Forense C2PA e EXIF Local",
        lead: "Descubra em 1 segundo por que o Instagram ou TikTok marca seu arquivo como 'Criado com IA'. Analise credenciais C2PA, fluxos ComfyUI e GPS sem enviar arquivos para servidores.",
        q1: "Como o Instagram e o TikTok sabem que uma imagem é de IA?",
        a1: "Eles leem blocos binários C2PA/JUMBF, tags XMP trainedAlgorithmicMedia e ausência de cabeçalho EXIF de câmera em arquivos JPEG, PNG, WebP e MP4.",
        q2: "Meus arquivos são enviados para algum servidor?",
        a2: "Não. Toda a inspeção binária roda localmente no seu navegador com privacidade total."
      },
      "png-prompt-inspector": {
        title: "Inspetor de Prompts PNG e Workflow ComfyUI Online Grátis (Ler e Limpar JSON)",
        h1: "🧩 Visualizador e Limpador de Prompts Ocultos PNG (ComfyUI · Flux · SDXL)",
        lead: "Veja o grafo JSON completo, prompts, seeds e LoRAs ocultos dentro de imagens PNG do ComfyUI ou remova tudo em 1 clique antes de publicar.",
        q1: "Quais dados ficam escondidos em um PNG do ComfyUI?",
        a1: "O arquivo armazena todo o fluxo de nós JSON, pesos LoRA, modelo e prompt nos blocos binários tEXt e iTXt.",
        q2: "Como remover o workflow sem perder qualidade?",
        a2: "Use a limpeza binária local acima para apagar apenas os chunks de texto mantendo os pixels originais intactos."
      },
      "photo-gps-remover": {
        title: "Remover Localização GPS e Dados EXIF de Fotos Online Grátis (100% Privado)",
        h1: "📍 Verificador e Removedor Local de Coordenadas GPS EXIF em Fotos",
        lead: "Verifique se suas fotos de celular contêm coordenadas GPS exatas (0x8825) e remova todos os metadados localmente antes de postar na internet.",
        q1: "Fotos de celular guardam meu endereço exato no GPS?",
        a1: "Sim, câmeras de smartphones gravam latitude, longitude e horário exato no cabeçalho binário EXIF GPS.",
        q2: "É seguro remover o EXIF diretamente no navegador?",
        a2: "Sim, pois nenhuma foto privada é enviada para servidores externos."
      },
      "webp-png-to-jpg-clean": {
        title: "Converter WebP e PNG para JPG Limpo sem Metadados C2PA Online Grátis",
        h1: "🖼️ Conversor Local de WebP / PNG para JPG sRGB Limpo (Zero C2PA)",
        lead: "Converta imagens WebP do ChatGPT/DALL-E ou PNGs do Midjourney em arquivos JPG universais removendo automaticamente credenciais ocultas de IA.",
        q1: "Por que converter WebP do ChatGPT para JPG limpo?",
        a1: "Arquivos WebP gerados por IA trazem manifestos C2PA que ativam rótulos automáticos de IA nas redes sociais.",
        q2: "Posso converter dezenas de imagens em lote .ZIP?",
        a2: "Sim, acesse o PureAI Studio completo para processar até 100 imagens de uma vez."
      },
      "mp4-frame-extractor": {
        title: "Extrair Primeiro e Último Frame HD de Vídeo MP4 Online (PNG Limpo sem C2PA)",
        h1: "🎞️ Extrator Local de Último Frame HD de Vídeos MP4 (Kling · Runway · Sora)",
        lead: "Extraia o último frame exato de qualquer vídeo MP4 em alta definição como PNG limpo de C2PA para continuar vídeos de IA sem cortes.",
        q1: "Por que extrair o último frame limpo de um vídeo MP4?",
        a1: "Para usar como imagem inicial ao estender clipes de vídeo no Kling, Runway, Sora ou Luma sem carregar tags C2PA.",
        q2: "A extração mantém a resolução original do vídeo?",
        a2: "Sim, o frame é renderizado na resolução nativa exata do MP4 diretamente no seu navegador."
      }
    }
  },
  de: {
    code: "de",
    hreflang: "de",
    label: "Deutsch",
    flag: "🇩🇪",
    badgeZeroUpload: "100% Lokal im Browser · Kein Server-Upload (DSGVO-konform)",
    dropPrompt: "Datei hier ablegen oder klicken zum Auswählen",
    privacyNote: "100% lokal im Arbeitsspeicher Ihres Geräts verarbeitet. Keine Datei verlässt Ihren Browser.",
    openFullStudio: "PureAI Studio Vollversion öffnen (Batch .ZIP + iPhone 16 Pro EXIF) →",
    cleanNowBtn: "⚡ Bereinigte Kopie exportieren (1. Datei gratis)",
    downloadCertBtn: "🪪 Forensisches Prüfzertifikat herunterladen (PNG)",
    extractFrameBtn: "🎬 Sauberes HD-Einzelbild extrahieren (PNG)",
    convertJpgBtn: "⚡ In sauberes sRGB-JPG umwandeln",
    stripPngBtn: "🧹 Versteckte PNG-Prompts löschen & exportieren",
    packOfferBadge: "⚡ Einmal-Pakete ab 2,99 € (Kein Abo)",
    packOfferTitle: "Batch-.ZIP, MP4-Bereinigung oder iPhone 16 Pro EXIF benötigt?",
    packOfferDesc: "10 Dateien (2,99 € einmalig), 50 Dateien + Batch-.ZIP (9,90 €) oder Jahreszugang (39 €/Jahr). Credits verfallen nie.",
    packCta: "PureAI Studio öffnen →",
    dirLabel: "KI-Verzeichnis",
    extLabel: "Chrome-Erweiterung",
    threatsFound: "Versteckte KI-Signaturen / Metadaten erkannt",
    cleanFound: "0 Versteckte KI- / GPS-Spuren gefunden",
    faqHeading: "Häufig gestellte Fragen (FAQ)",
    tools: {
      "ai-photo-detector": {
        title: "KI-Foto- & Video-Detektor Kostenlos: C2PA, JUMBF & EXIF Forensik-Scanner Online",
        h1: "🔎 Ist dieses Foto oder Video KI? Lokaler C2PA- & EXIF-Scanner",
        lead: "Prüfen Sie sofort, ob ein Bild oder MP4-Video versteckte C2PA-Herkunftsdaten, ComfyUI-Prompts oder GPS-Koordinaten enthält – 100% lokal ohne Upload.",
        q1: "Wie erkennen Instagram und TikTok KI-generierte Bilder?",
        a1: "Durch binäre C2PA/JUMBF-Manifeste, XMP trainedAlgorithmicMedia-Tags und fehlende Kamera-EXIF-Header.",
        q2: "Werden meine Dateien auf einen Server hochgeladen?",
        a2: "Nein. Die Analyse erfolgt vollständig lokal in Ihrem Browser (DSGVO-konform)."
      },
      "png-prompt-inspector": {
        title: "PNG Prompt & ComfyUI Workflow Inspector Online: Versteckte JSON-Metadaten lesen & löschen",
        h1: "🧩 ComfyUI, Flux & Stable Diffusion PNG-Workflow-Inspektor",
        lead: "Lesen Sie versteckte tEXt/iTXt-Workflow-Daten, Prompts, Seeds und LoRAs aus PNG-Dateien aus oder entfernen Sie diese mit einem Klick.",
        q1: "Welche Daten speichert ComfyUI unsichtbar in PNG-Bildern?",
        a1: "Den kompletten Node-Graphen als JSON sowie Prompts, Checkpoints und Seeds in tEXt-Chunks.",
        q2: "Wie teile ich PNGs ohne Preisgabe meines Workflows?",
        a2: "Entfernen Sie alle Text- und C2PA-Chunks verlustfrei direkt hier im Browser."
      },
      "photo-gps-remover": {
        title: "EXIF GPS-Standort aus Fotos anzeigen & entfernen Online Kostenlos (Ohne Upload)",
        h1: "📍 Versteckte GPS-Koordinaten & Smartphone-EXIF lokal prüfen und löschen",
        lead: "Überprüfen Sie Fotos auf eingebettete GPS-Koordinaten (0x8825) und Gerätedaten und speichern Sie sofort eine bereinigte Kopie.",
        q1: "Enthalten Smartphone-Fotos meine genaue Wohnadresse?",
        a1: "Ja, iPhones und Android-Geräte speichern standardmäßig exakte Breiten- und Längengrade im EXIF-Header.",
        q2: "Warum ist lokale Browser-Bereinigung sicherer?",
        a2: "Ihre privaten Aufnahmen verlassen niemals Ihr Endgerät."
      },
      "webp-png-to-jpg-clean": {
        title: "WebP & PNG in sauberes JPG umwandeln Online Kostenlos (Ohne C2PA & EXIF)",
        h1: "🖼️ Lokaler WebP / PNG zu sRGB-JPG Konverter (0% C2PA-Metadaten)",
        lead: "Konvertieren Sie ChatGPT-WebP-Dateien oder PNG-Bilder lokal in saubere JPGs ohne versteckte KI-Content-Credentials.",
        q1: "Warum ChatGPT-WebP-Bilder in saubere JPGs umwandeln?",
        a1: "WebP-Downloads aus KI-Tools enthalten C2PA-Manifeste, die KI-Kennzeichnungen auf Social Media auslösen.",
        q2: "Kann ich viele Bilder gleichzeitig als .ZIP konvertieren?",
        a2: "Ja, im Hauptstudio können Sie bis zu 100 Dateien im Stapel verarbeiten."
      },
      "mp4-frame-extractor": {
        title: "Erstes & Letztes Frame aus MP4-Video in HD extrahieren Online (Sauberes PNG ohne C2PA)",
        h1: "🎞️ MP4 HD-Einzelbild & Last-Frame Extraktor (Für Kling · Runway · Sora)",
        lead: "Extrahieren Sie das exakte Start- oder Endbild eines MP4-Videos verlustfrei als C2PA-freies PNG direkt im Browser.",
        q1: "Wozu braucht man das letzte Einzelbild eines KI-Videos?",
        a1: "Um KI-Videoclips nahtlos ohne sichtbaren Schnitt und ohne C2PA-Tags fortzusetzen.",
        q2: "Bleibt die volle Videoauflösung erhalten?",
        a2: "Ja, der Export erfolgt in der exakten Originalauflösung Ihres MP4-Videos."
      }
    }
  },
  fr: {
    code: "fr",
    hreflang: "fr",
    label: "Français",
    flag: "🇫🇷",
    badgeZeroUpload: "100% Local dans le Navigateur · Aucun Envoi Serveur (RGPD)",
    dropPrompt: "Glissez votre fichier ici ou cliquez pour sélectionner",
    privacyNote: "Traité à 100% dans la mémoire RAM de votre appareil. Aucun fichier ne quitte votre navigateur.",
    openFullStudio: "Ouvrir PureAI Studio Complet (Lot .ZIP + EXIF iPhone 16 Pro) →",
    cleanNowBtn: "⚡ Exporter une Copie Propre (1er Fichier Gratuit)",
    downloadCertBtn: "🪪 Télécharger le Certificat Forensique (PNG)",
    extractFrameBtn: "🎬 Extraire l'Image HD Propre (PNG)",
    convertJpgBtn: "⚡ Convertir en JPG sRGB Propre",
    stripPngBtn: "🧹 Supprimer les Prompts Cachés du PNG",
    packOfferBadge: "⚡ Packs Sans Abonnement dès 2,99 €",
    packOfferTitle: "Besoin du Mode Lot .ZIP, Vidéo MP4 ou EXIF iPhone 16 Pro ?",
    packOfferDesc: "Débloquez 10 fichiers (2,99 € paiement unique), 50 fichiers + .ZIP (9,90 €) ou Annuel Illimité (39 €/an). Sans expiration.",
    packCta: "Ouvrir PureAI Studio →",
    dirLabel: "Annuaire IA",
    extLabel: "Extension Chrome",
    threatsFound: "Signatures IA / Métadonnées Cachées Détectées",
    cleanFound: "0 Trace Cachée d'IA / GPS dans le Conteneur",
    faqHeading: "Questions Fréquentes",
    tools: {
      "ai-photo-detector": {
        title: "Détecteur Photo & Vidéo IA Gratuit : Scanner Forensique C2PA, JUMBF & EXIF en Ligne",
        h1: "🔎 Cette Photo ou Vidéo vient-elle d'une IA ? Scanner C2PA & EXIF Local",
        lead: "Vérifiez en 1 seconde pourquoi Instagram ou TikTok affiche 'Créé avec l'IA'. Inspectez les manifestes C2PA, prompts ComfyUI et coordonnées GPS sans téléversement.",
        q1: "Comment Instagram et TikTok détectent-ils les images IA ?",
        a1: "Ils analysent les blocs binaires C2PA/JUMBF, les balises XMP trainedAlgorithmicMedia et l'absence d'EXIF optique.",
        q2: "Mes fichiers privés sont-ils envoyés sur un serveur ?",
        a2: "Non, l'analyse binaire s'exécute à 100% localement dans votre navigateur."
      },
      "png-prompt-inspector": {
        title: "Inspecteur de Prompts PNG & Workflow ComfyUI en Ligne : Lire et Nettoyer le JSON",
        h1: "🧩 Inspecteur de Workflows PNG ComfyUI, Flux.1 & Stable Diffusion",
        lead: "Affichez les chunks cachés tEXt / iTXt (graphe JSON ComfyUI, prompts, seeds, LoRA) d'un fichier PNG ou supprimez-les en un clic.",
        q1: "Quelles données sont cachées dans un PNG ComfyUI ?",
        a1: "Le graphe complet des nœuds JSON, les poids LoRA, la seed et les prompts exacts.",
        q2: "Comment nettoyer un PNG sans perte de qualité ?",
        a2: "Supprimez localement les segments tEXt/iTXt et C2PA tout en conservant les pixels intacts."
      },
      "photo-gps-remover": {
        title: "Voir et Supprimer la Localisation GPS EXIF d'une Photo en Ligne Gratuitement",
        h1: "📍 Vérificateur et Nettoyeur Local de Coordonnées GPS EXIF Photo",
        lead: "Détectez les coordonnées GPS exactes (0x8825) cachées dans vos photos de smartphone et exportez une copie propre localement.",
        q1: "Les photos iPhone et Android contiennent-elles mon adresse GPS ?",
        a1: "Oui, la latitude, la longitude et l'heure exacte sont enregistrées dans l'en-tête EXIF GPS.",
        q2: "Pourquoi nettoyer les données EXIF localement ?",
        a2: "Vos photos personnelles ne sont jamais envoyées vers un serveur tiers."
      },
      "webp-png-to-jpg-clean": {
        title: "Convertir WebP et PNG en JPG Propre sans Métadonnées C2PA (100% Local)",
        h1: "🖼️ Convertisseur Privé WebP / PNG vers JPG sRGB Propre (0% C2PA)",
        lead: "Convertissez vos images WebP ChatGPT/DALL-E ou PNG Midjourney en JPG universel tout en purgeant les balises C2PA.",
        q1: "Pourquoi convertir un fichier WebP ChatGPT en JPG ?",
        a1: "Les fichiers WebP générés par IA contiennent des manifestes C2PA détectés par les réseaux sociaux.",
        q2: "Puis-je convertir un lot complet en .ZIP ?",
        a2: "Oui, ouvrez PureAI Studio pour convertir jusqu'à 100 fichiers simultanément."
      },
      "mp4-frame-extractor": {
        title: "Extraire la Première et Dernière Image HD d'une Vidéo MP4 en Ligne (PNG Sans C2PA)",
        h1: "🎞️ Extracteur Local d'Image Clé & Dernière Frame MP4 HD (Kling · Sora · Runway)",
        lead: "Extrayez la dernière image exacte d'une vidéo MP4 en PNG haute définition sans métadonnées C2PA pour prolonger vos vidéos IA.",
        q1: "Pourquoi extraire la dernière image d'une vidéo IA ?",
        a1: "Pour enchaîner deux générations vidéo dans Kling, Runway ou Sora avec une continuité visuelle parfaite.",
        q2: "La résolution native de la vidéo est-elle conservée ?",
        a2: "Oui, l'extraction s'effectue à la résolution exacte du fichier MP4 localement."
      }
    }
  },
  it: {
    code: "it",
    hreflang: "it",
    label: "Italiano",
    flag: "🇮🇹",
    badgeZeroUpload: "100% Locale nel Browser · Zero Upload su Server",
    dropPrompt: "Trascina qui il file o clicca per selezionarlo",
    privacyNote: "Elaborato al 100% nella RAM del tuo dispositivo. Nessun file lascia il tuo browser.",
    openFullStudio: "Apri PureAI Studio Completo (Batch .ZIP + EXIF iPhone 16 Pro) →",
    cleanNowBtn: "⚡ Esporta Copia Pulita (1° File Gratis)",
    downloadCertBtn: "🪪 Scarica Certificato Forense (PNG)",
    extractFrameBtn: "🎬 Estrai Fotogramma HD Pulito (PNG)",
    convertJpgBtn: "⚡ Converti in JPG sRGB Pulito",
    stripPngBtn: "🧹 Rimuovi Prompt Nascosti dal PNG",
    packOfferBadge: "⚡ Pacchetti Senza Abbonamento da 2,99 €",
    packOfferTitle: "Ti serve Batch .ZIP, Video MP4 o EXIF iPhone 16 Pro?",
    packOfferDesc: "Sblocca 10 file (2,99 € una tantum), 50 file + .ZIP (9,90 €) o Annuale Illimitato (39 €/anno). I crediti non scadono mai.",
    packCta: "Apri PureAI Studio →",
    dirLabel: "Directory IA",
    extLabel: "Estensione Chrome",
    threatsFound: "Tracce IA / Metadati Nascosti Rilevati",
    cleanFound: "0 Tracce IA / GPS Nascoste nel Contenitore",
    faqHeading: "Domande Frequenti",
    tools: {
      "ai-photo-detector": {
        title: "Rilevatore Foto e Video IA Gratis: Scanner Forense C2PA, JUMBF ed EXIF Online",
        h1: "🔎 Questa Foto o Video è creata con IA? Scanner C2PA ed EXIF Locale",
        lead: "Controlla in 1 secondo se un'immagine o video MP4 contiene credenziali C2PA, prompt ComfyUI o coordinate GPS senza caricare file online.",
        q1: "Come fanno Instagram e TikTok a riconoscere i contenuti IA?",
        a1: "Leggono i blocchi binari C2PA/JUMBF, i tag XMP trainedAlgorithmicMedia e l'assenza di EXIF fotocamera.",
        q2: "I miei file vengono caricati su un server esterno?",
        a2: "No, l'analisi avviene interamente nel tuo browser in totale privacy."
      },
      "png-prompt-inspector": {
        title: "Ispettore Prompt PNG e Workflow ComfyUI Online: Leggi e Rimuovi JSON Nascosti",
        h1: "🧩 Visualizzatore e Pulitore Workflow PNG (ComfyUI · Flux · SDXL)",
        lead: "Ispeziona i chunk nascosti tEXt / iTXt con workflow JSON, prompt, seed e LoRA nei file PNG o rimuovili con un clic.",
        q1: "Quali metadati nasconde un file PNG di ComfyUI?",
        a1: "Contiene l'intero grafo JSON dei nodi, pesi LoRA, seed e prompt nei chunk binari tEXt.",
        q2: "Come rimuovere il workflow mantenendo la qualità?",
        a2: "Elimina localmente i soli chunk testuali e C2PA lasciando intatti i pixel."
      },
      "photo-gps-remover": {
        title: "Vedere e Rimuovere Posizione GPS EXIF dalle Foto Online Gratis (Zero Upload)",
        h1: "📍 Controllo e Rimozione Locale Coordinate GPS EXIF dalle Foto",
        lead: "Verifica se le foto dello smartphone contengono coordinate GPS esatte (0x8825) ed esporta subito una copia pulita.",
        q1: "Le foto dello smartphone salvano l'indirizzo GPS di casa?",
        a1: "Sì, latitudine, longitudine e orario vengono salvati nell'header binario EXIF GPS.",
        q2: "Perché pulire gli EXIF nel browser è più sicuro?",
        a2: "Perché le tue foto private non lasciano mai il tuo dispositivo."
      },
      "webp-png-to-jpg-clean": {
        title: "Convertire WebP e PNG in JPG Pulito senza Metadati C2PA Online Gratis",
        h1: "🖼️ Convertitore Locale da WebP / PNG a JPG sRGB Pulito (Zero C2PA)",
        lead: "Converti immagini WebP di ChatGPT/DALL-E o PNG di Midjourney in JPG ad alta qualità rimuovendo le firme C2PA.",
        q1: "Perché convertire i WebP di ChatGPT in JPG puliti?",
        a1: "I file WebP scaricati da ChatGPT includono manifesti C2PA che attivano avvisi IA sui social.",
        q2: "Posso convertire decine di immagini insieme in .ZIP?",
        a2: "Sì, apri PureAI Studio per elaborare fino a 100 file in blocco."
      },
      "mp4-frame-extractor": {
        title: "Estrarre Primo e Ultimo Fotogramma HD da Video MP4 Online (PNG Senza C2PA)",
        h1: "🎞️ Estrattore Locale Ultimo Frame HD da Video MP4 (Kling · Runway · Sora)",
        lead: "Estrai l'ultimo fotogramma esatto da qualsiasi video MP4 come PNG ad alta risoluzione privo di metadati C2PA.",
        q1: "Perché estrarre l'ultimo fotogramma di un video IA?",
        a1: "Per estendere clip video su Kling, Runway o Sora senza stacchi visivi né firme C2PA.",
        q2: "La qualità originale viene mantenuta?",
        a2: "Sì, il fotogramma viene salvato alla risoluzione nativa esatta del video."
      }
    }
  },
  ja: {
    code: "ja",
    hreflang: "ja",
    label: "日本語",
    flag: "🇯🇵",
    badgeZeroUpload: "ブラウザ内100%ローカル処理 · サーバー送信ゼロ",
    dropPrompt: "ここにファイルをドロップ、またはクリックして選択",
    privacyNote: "お使いの端末のRAM内で100%処理されます。画像や動画が外部サーバーに送信されることはありません。",
    openFullStudio: "PureAI Studio フル版を開く（一括.ZIP + iPhone 16 Pro EXIF） →",
    cleanNowBtn: "⚡ クリーンなコピーを書き出す（初回無料）",
    downloadCertBtn: "🪪 フォレンジック証明カード（PNG）を保存",
    extractFrameBtn: "🎬 高画質フレーム（PNG）を抽出",
    convertJpgBtn: "⚡ クリーンなsRGB JPGに変換",
    stripPngBtn: "🧹 PNGの隠しプロンプトを削除して保存",
    packOfferBadge: "⚡ 買い切りクレジット €2.99〜（サブスク不要）",
    packOfferTitle: "一括.ZIP出力・MP4動画消去・iPhone 16 Pro EXIFが必要ですか？",
    packOfferDesc: "10ファイル（€2.99 買い切り）、50ファイル＋.ZIP（€9.90）、年間無制限（€39/年）。有効期限なし。",
    packCta: "PureAI Studio を開く →",
    dirLabel: "AIツール一覧",
    extLabel: "Chrome拡張機能",
    threatsFound: "AI署名・隠しメタデータを検出しました",
    cleanFound: "AI / GPS メタデータは検出されませんでした",
    faqHeading: "よくある質問（FAQ）",
    tools: {
      "ai-photo-detector": {
        title: "AI画像・動画判定ツール無料：C2PA・JUMBF・EXIFメタデータ解析スキャナー（サーバー送信なし）",
        h1: "🔎 この画像やMP4動画はAI製？ C2PA・EXIFローカル解析ツール",
        lead: "InstagramやTikTokで「AI情報」ラベルが付く原因（C2PAマニフェスト・ComfyUIプロンプト・GPS位置情報）をブラウザ内で瞬時に検査し、証明カードを発行できます。",
        q1: "InstagramやTikTokはどうやってAI画像を検出していますか？",
        a1: "JPEG・PNG・WebP・MP4内部のC2PA/JUMBFバイナリ情報やXMPタグ、カメラEXIFの有無を自動判定しています。",
        q2: "アップロードした画像は外部サーバーに保存されますか？",
        a2: "いいえ。すべてブラウザ内のローカルメモリで解析されるため、外部送信はゼロです。"
      },
      "png-prompt-inspector": {
        title: "PNGプロンプト＆ComfyUIワークフロー確認・削除ツール（SDXL / Flux JSON対応）",
        h1: "🧩 ComfyUI・Stable Diffusion・Flux PNGプロンプト解析＆消去",
        lead: "PNGファイル内のtEXt / iTXtチャンクに隠されたComfyUIノード構成JSON・プロンプト・Seed値・LoRAを確認し、ワンクリックで安全に消去できます。",
        q1: "ComfyUIのPNG画像にはどんな情報が隠れていますか？",
        a1: "ノード全体のJSONワークフロー、使用モデル、LoRA、Seed値、プロンプト全文がそのまま埋め込まれています。",
        q2: "画質を落とさずにプロンプト情報だけ消せますか？",
        a2: "はい。テキストチャンクとC2PA署名のみをローカルで除去し、ピクセル画質を維持します。"
      },
      "photo-gps-remover": {
        title: "写真のGPS位置情報・EXIF確認＆削除ツール無料（ブラウザ完結・送信なし）",
        h1: "📍 スマホ写真のGPS座標（0x8825）・撮影日時をローカル検査＆消去",
        lead: "SNSやフリマ投稿前に、写真に埋め込まれた正確な緯度・経度GPS情報や機種名をブラウザ上でチェックして安全に削除します。",
        q1: "iPhoneやAndroidの写真には自宅のGPS座標が入っていますか？",
        a1: "はい。初期設定ではEXIF GPSヘッダー（0x8825）に正確な撮影場所と日時が記録されます。",
        q2: "オンラインサイトよりブラウザ完結型が安全な理由は？",
        a2: "プライベートな写真を第三者のサーバーへ一切送信せずに処理できるためです。"
      },
      "webp-png-to-jpg-clean": {
        title: "WebP・PNGをクリーンなJPGに変換（C2PA・EXIF自動削除 / ローカル処理）",
        h1: "🖼️ WebP / PNG → 高画質sRGB JPG変換ツール（C2PAメタデータ完全除去）",
        lead: "ChatGPT（DALL-E）のWebP画像やMidjourneyのPNG画像を、AI署名のない汎用JPGへブラウザ内で高速変換します。",
        q1: "ChatGPTのWebP画像をJPGに変換するメリットは？",
        a1: "互換性が高まるだけでなく、埋め込まれたC2PAコンテンツ認証情報を同時にクリアできます。",
        q2: "複数ファイルをまとめて.ZIPで変換できますか？",
        a2: "はい。PureAI Studio本体では最大100枚の一括変換とiPhone 16 Pro EXIF付与に対応しています。"
      },
      "mp4-frame-extractor": {
        title: "MP4動画の最初・最終フレームを高画質PNG抽出（Kling・Runway・Sora動画延長用）",
        h1: "🎞️ MP4最終フレーム＆キーフレームHD抽出ツール（C2PAなしPNG出力）",
        lead: "MP4動画の最終フレームや指定秒数を、C2PAメタデータを含まない無劣化PNGとしてブラウザ内で瞬時に書き出します。",
        q1: "なぜAI動画クリエイターは最終フレームを抽出するのですか？",
        a1: "Kling・Runway・Sora・Veoで動画を自然につなげて延長する際、C2PAを含まない最終フレーム画像が必要になるためです。",
        q2: "元の動画の解像度は維持されますか？",
        a2: "はい、動画本来のネイティブ解像度のままローカル出力されます。"
      }
    }
  },
  ko: {
    code: "ko",
    hreflang: "ko",
    label: "한국어",
    flag: "🇰🇷",
    badgeZeroUpload: "100% 브라우저 로컬 처리 · 서버 업로드 제로",
    dropPrompt: "파일을 여기에 드롭하거나 클릭하여 선택하세요",
    privacyNote: "기기 RAM에서 100% 로컬로 처리됩니다. 파일이 외부 서버로 전송되지 않습니다.",
    openFullStudio: "PureAI Studio 전체 열기 (일괄 .ZIP + iPhone 16 Pro EXIF) →",
    cleanNowBtn: "⚡ 깨끗한 사본 내보내기 (첫 파일 무료)",
    downloadCertBtn: "🪪 포렌식 검증 인증서 다운로드 (PNG)",
    extractFrameBtn: "🎬 고화질 프레임 추출 (PNG)",
    convertJpgBtn: "⚡ 깨끗한 sRGB JPG로 변환",
    stripPngBtn: "🧹 PNG 숨겨진 프롬프트 삭제 및 저장",
    packOfferBadge: "⚡ 구독 없는 단건 크레딧 팩 €2.99부터",
    packOfferTitle: "일괄 .ZIP, MP4 메타데이터 제거 또는 iPhone 16 Pro EXIF가 필요하신가요?",
    packOfferDesc: "10개 파일(€2.99 단건 결제), 50개 파일+.ZIP(€9.90), 연간 무제한(€39/년). 유효기간 없음.",
    packCta: "PureAI Studio 열기 →",
    dirLabel: "AI 도구 모음",
    extLabel: "Chrome 확장 프로그램",
    threatsFound: "숨겨진 AI 서명 / 메타데이터 감지됨",
    cleanFound: "숨겨진 AI / GPS 위협 없음 (클린 컨테이너)",
    faqHeading: "자주 묻는 질문 (FAQ)",
    tools: {
      "ai-photo-detector": {
        title: "무료 AI 사진·동영상 판독기: C2PA, JUMBF 및 EXIF 포렌식 스캐너 (서버 업로드 없음)",
        h1: "🔎 이 사진이나 MP4 영상에 AI 흔적이 있을까? 로컬 C2PA & EXIF 스캐너",
        lead: "인스타그램·틱톡에서 'AI 생성 정보' 라벨이 붙는 이유(C2PA 매니페스트, ComfyUI 프롬프트, GPS 위치)를 1초 만에 브라우저에서 확인하세요.",
        q1: "인스타그램과 틱톡은 어떻게 AI 이미지를 감지하나요?",
        a1: "파일 내부의 C2PA/JUMBF 바이너리 블록, XMP 태그 및 카메라 EXIF 누락 여부를 검사합니다.",
        q2: "내 사진이 서버에 업로드되나요?",
        a2: "아니요. 모든 바이너리 검사는 브라우저 내부 메모리에서만 수행됩니다."
      },
      "png-prompt-inspector": {
        title: "PNG 프롬프트 및 ComfyUI 워크플로우 뷰어·제거기 (SDXL / Flux JSON 확인)",
        h1: "🧩 ComfyUI · Flux · 스테이블 디퓨전 PNG 프롬프트 인스펙터",
        lead: "PNG 이미지 속 숨겨진 tEXt / iTXt 청크(워크플로우 JSON, 프롬프트, 시드, LoRA)를 확인하거나 클릭 한 번으로 제거하세요.",
        q1: "ComfyUI PNG 파일에는 어떤 데이터가 숨겨져 있나요?",
        a1: "전체 노드 그래프 JSON, 체크포인트, LoRA 가중치 및 프롬프트 원문이 그대로 저장됩니다.",
        q2: "화질 저하 없이 워크플로우만 지울 수 있나요?",
        a2: "네, 텍스트 및 C2PA 청크만 로컬에서 제거하고 픽셀 원본을 유지합니다."
      },
      "photo-gps-remover": {
        title: "사진 GPS 위치정보 및 EXIF 확인·삭제 무료 도구 (100% 브라우저 로컬)",
        h1: "📍 스마트폰 사진 숨겨진 GPS 좌표(0x8825) 확인 및 즉시 제거",
        lead: "커뮤니티나 중고거래 업로드 전, 사진에 포함된 정확한 위도·경도 GPS 정보와 기기 메타데이터를 안전하게 삭제하세요.",
        q1: "아이폰·갤럭시 사진에 집 주소 GPS가 들어있나요?",
        a1: "네, 기본 설정 시 EXIF GPS 헤더(0x8825)에 정확한 촬영 좌표와 시간이 기록됩니다.",
        q2: "서버 업로드 없는 로컬 방식이 왜 안전한가요?",
        a2: "개인 사진이 외부 서버로 절대 전송되지 않기 때문입니다."
      },
      "webp-png-to-jpg-clean": {
        title: "WebP·PNG를 깨끗한 JPG로 변환 (C2PA 및 EXIF 자동 삭제 · 무설치 로컬)",
        h1: "🖼️ WebP / PNG → 클린 sRGB JPG 로컬 변환기 (C2PA 메타데이터 0%)",
        lead: "ChatGPT WebP 이미지나 Midjourney PNG 파일을 AI 서명이 제거된 고화질 JPG로 즉시 변환합니다.",
        q1: "ChatGPT WebP 파일을 왜 클린 JPG로 변환해야 하나요?",
        a1: "생성형 AI WebP 파일에는 SNS AI 라벨을 유발하는 C2PA 인증서가 포함되어 있기 때문입니다.",
        q2: "여러 장을 한 번에 .ZIP으로 변환할 수 있나요?",
        a2: "네, PureAI Studio 메인 화면에서 최대 100장을 일괄 처리할 수 있습니다."
      },
      "mp4-frame-extractor": {
        title: "MP4 동영상 첫 프레임·마지막 프레임 고화질 PNG 추출기 (Kling · Runway · Sora)",
        h1: "🎞️ MP4 마지막 프레임 & 키프레임 HD 추출 도구 (무손실 클린 PNG)",
        lead: "Kling, Runway, Sora 영상 연장 작업에 필요한 마지막 프레임을 C2PA 흔적 없는 고해상도 PNG로 추출하세요.",
        q1: "AI 영상 제작 시 왜 마지막 프레임을 추출하나요?",
        a1: "다음 클립의 시작 이미지로 사용하여 끊김 없는 연속 영상을 만들기 위해서입니다.",
        q2: "원본 영상 해상도가 그대로 유지되나요?",
        a2: "네, 브라우저에서 원본 MP4 해상도 그대로 무손실 추출됩니다."
      }
    }
  },
  tr: {
    code: "tr",
    hreflang: "tr",
    label: "Türkçe",
    flag: "🇹🇷",
    badgeZeroUpload: "Tarayıcıda %100 Yerel İşlem · Sunucuya Yükleme Yok",
    dropPrompt: "Dosyayı buraya sürükleyin veya seçmek için tıklayın",
    privacyNote: "Dosyalarınız %100 cihazınızın RAM'inde işlenir, hiçbir sunucuya gönderilmez.",
    openFullStudio: "Tam PureAI Studio'yu Aç (Toplu .ZIP + iPhone 16 Pro EXIF) →",
    cleanNowBtn: "⚡ Temiz Kopyayı İndir (İlk Dosya Ücretsiz)",
    downloadCertBtn: "🪪 Adli Analiz Sertifikasını İndir (PNG)",
    extractFrameBtn: "🎬 Temiz HD Kare Çıkar (PNG)",
    convertJpgBtn: "⚡ Temiz sRGB JPG'ye Dönüştür",
    stripPngBtn: "🧹 Gizli PNG Promptlarını Sil ve İndir",
    packOfferBadge: "⚡ Aboneliksiz Tek Seferlik Paketler €2,99'dan",
    packOfferTitle: "Toplu .ZIP, MP4 Temizleme veya iPhone 16 Pro EXIF mi Lazım?",
    packOfferDesc: "10 dosya (€2,99 tek çekim), 50 dosya + .ZIP (€9,90) veya Yıllık Sınırsız (€39/yıl). Krediler asla silinmez.",
    packCta: "PureAI Studio'yu Aç →",
    dirLabel: "AI Araç Dizini",
    extLabel: "Chrome Uzantısı",
    threatsFound: "Gizli Yapay Zeka İmzası / Meta Veri Tespit Edildi",
    cleanFound: "Gizli Yapay Zeka / GPS İzi Bulunamadı",
    faqHeading: "Sıkça Sorulan Sorular",
    tools: {
      "ai-photo-detector": {
        title: "Ücretsiz Yapay Zeka Fotoğraf ve Video Dedektörü: C2PA ve EXIF Tarayıcı",
        h1: "🔎 Bu Fotoğraf veya Video Yapay Zeka mı? Yerel C2PA & EXIF Analizi",
        lead: "Instagram ve TikTok'un neden 'Yapay Zeka ile Oluşturuldu' etiketi eklediğini 1 saniyede görün. C2PA, ComfyUI ve GPS verilerini dosya yüklemeden inceleyin.",
        q1: "Instagram ve TikTok yapay zeka görsellerini nasıl anlıyor?",
        a1: "Dosya içindeki C2PA/JUMBF kutularını, XMP etiketlerini ve eksik kamera EXIF başlıklarını tarar.",
        q2: "Dosyalarım bir sunucuya yükleniyor mu?",
        a2: "Hayır, tüm analiz %100 tarayıcınızın içinde yerel olarak yapılır."
      },
      "png-prompt-inspector": {
        title: "PNG Prompt ve ComfyUI Workflow Görüntüleyici & Temizleyici Online",
        h1: "🧩 ComfyUI, Flux ve Stable Diffusion Gizli PNG Prompt İnceleyici",
        lead: "PNG görsellerindeki gizli tEXt / iTXt JSON iş akışlarını, promptları ve LoRA verilerini okuyun veya tek tıkla silin.",
        q1: "ComfyUI PNG dosyalarında hangi bilgiler gizlidir?",
        a1: "Tüm düğüm grafiği (JSON), kullanılan modeller, seed ve prompt metni dosya içinde saklanır.",
        q2: "Kalite bozulmadan gizli promptlar nasıl silinir?",
        a2: "Yukarıdaki yerel temizleyici piksellere dokunmadan yalnızca metin ve C2PA bloklarını kaldırır."
      },
      "photo-gps-remover": {
        title: "Fotoğraftan GPS Konum ve EXIF Bilgisi Silme Online Ücretsiz (%100 Gizli)",
        h1: "📍 Akıllı Telefon Fotoğraflarından Gizli GPS Koordinatlarını Temizleyin",
        lead: "Fotoğraflarınızdaki gizli GPS koordinatlarını (0x8825) ve cihaz bilgilerini kontrol edin, internete yüklemeden temizleyin.",
        q1: "Telefon fotoğrafları ev adresimin GPS konumunu içerir mi?",
        a1: "Evet, telefon kameraları enlem, boylam ve çekim saatini EXIF GPS alanına kaydeder.",
        q2: "Tarayıcıda yerel temizleme neden daha güvenlidir?",
        a2: "Özel fotoğraflarınız hiçbir dış sunucuya gönderilmez."
      },
      "webp-png-to-jpg-clean": {
        title: "WebP ve PNG'yi Temiz JPG'ye Dönüştür (C2PA Meta Verilerini Otomatik Sil)",
        h1: "🖼️ Gizli WebP / PNG -> Temiz sRGB JPG Dönüştürücü (%0 C2PA)",
        lead: "ChatGPT WebP görsellerini veya Midjourney PNG dosyalarını C2PA izi olmayan yüksek kaliteli JPG formatına dönüştürün.",
        q1: "ChatGPT WebP görsellerini neden JPG'ye çevirmeliyim?",
        a1: "WebP çıktıları sosyal medyada yapay zeka uyarısı tetikleyen C2PA imzaları taşır.",
        q2: "Çoklu dosyaları toplu .ZIP olarak dönüştürebilir miyim?",
        a2: "Evet, PureAI Studio ile tek seferde 100 dosyaya kadar işlem yapabilirsiniz."
      },
      "mp4-frame-extractor": {
        title: "MP4 Videodan İlk ve Son Kareyi HD PNG Olarak Çıkar (Kling / Sora / Runway)",
        h1: "🎞️ MP4 Son Kare (Last Frame) HD Çıkarıcı (C2PA İzsiz PNG)",
        lead: "Yapay zeka videolarını kesintisiz uzatmak için MP4 videoların son karesini C2PA verisi olmadan tam çözünürlüklü PNG olarak indirin.",
        q1: "Yapay zeka videolarında neden son kare çıkarılır?",
        a1: "Kling, Runway veya Sora'da videoyu devam ettirirken başlangıç karesi olarak kullanmak için.",
        q2: "Video çözünürlüğü korunuyor mu?",
        a2: "Evet, kare doğrudan videonun orijinal HD çözünürlüğünde çıkarılır."
      }
    }
  },
  pl: {
    code: "pl",
    hreflang: "pl",
    label: "Polski",
    flag: "🇵🇱",
    badgeZeroUpload: "100% Lokalnie w Przeglądarce · Zero Wysyłania na Serwer",
    dropPrompt: "Upuść plik tutaj lub kliknij, aby wybrać z urządzenia",
    privacyNote: "Przetwarzane w 100% lokalnie w pamięci RAM urządzenia. Twoje pliki nigdy nie opuszczają przeglądarki.",
    openFullStudio: "Otwórz Pełne PureAI Studio (Wsadowy .ZIP + EXIF iPhone 16 Pro) →",
    cleanNowBtn: "⚡ Eksportuj Czystą Kopię (1. Plik Gratis)",
    downloadCertBtn: "🪪 Pobierz Certyfikat Analizy (PNG)",
    extractFrameBtn: "🎬 Wyodrębnij Czystą Klatkę HD (PNG)",
    convertJpgBtn: "⚡ Konwertuj do Czystego JPG sRGB",
    stripPngBtn: "🧹 Usuń Ukryte Prompty z PNG",
    packOfferBadge: "⚡ Pakiety Jednorazowe od 2,99 € (Bez Subskrypcji)",
    packOfferTitle: "Potrzebujesz Paczek .ZIP, Czyszczenia MP4 lub EXIF iPhone 16 Pro?",
    packOfferDesc: "Odblokuj 10 plików (2,99 € jednorazowo), 50 plików + .ZIP (9,90 €) lub Plan Roczny (39 €/rok). Kredyty nie wygasają.",
    packCta: "Otwórz PureAI Studio →",
    dirLabel: "Katalog Narzędzi AI",
    extLabel: "Wtyczka Chrome",
    threatsFound: "Wykryto Ukryte Sygnatury AI / Metadane",
    cleanFound: "0 Ukrytych Śladów AI / GPS w Pliku",
    faqHeading: "Najczęściej Zadawane Pytania (FAQ)",
    tools: {
      "ai-photo-detector": {
        title: "Darmowy Detektor Zdjęć i Wideo AI: Skaner C2PA, JUMBF i EXIF Online (Bez Uploadu)",
        h1: "🔎 Czy to Zdjęcie lub Wideo jest z AI? Lokalny Skaner C2PA i EXIF",
        lead: "Sprawdź w 1 sekundę, dlaczego Instagram lub TikTok oznacza plik jako 'Utworzono przez AI'. Zbadaj manifesty C2PA, prompty ComfyUI i tagi GPS lokalnie.",
        q1: "Jak Instagram i TikTok wykrywają zdjęcia wygenerowane przez AI?",
        a1: "Analizują binarne bloki C2PA/JUMBF, tagi XMP trainedAlgorithmicMedia oraz brak nagłówków EXIF aparatu.",
        q2: "Czy moje prywatne zdjęcia trafiają na zewnętrzny serwer?",
        a2: "Nie, cała inspekcja binarna odbywa się lokalnie w Twojej przeglądarce."
      },
      "png-prompt-inspector": {
        title: "Inspektor Promptów PNG i Workflow ComfyUI Online: Odczyt i Usuwanie JSON",
        h1: "🧩 Podgląd i Usuwanie Ukrytych Promptów PNG (ComfyUI · Flux · SDXL)",
        lead: "Odczytaj ukryte bloki tEXt / iTXt (graf JSON ComfyUI, prompty, seed, LoRA) z plików PNG lub wyczyść je jednym kliknięciem.",
        q1: "Jakie dane ukrywa plik PNG wygenerowany w ComfyUI?",
        a1: "Zapisuje pełny schemat węzłów JSON, użyte modele, wagi LoRA oraz dokładną treść promptu.",
        q2: "Jak usunąć workflow bez utraty jakości obrazu?",
        a2: "Skorzystaj z lokalnego czyszczenia chunków powyżej, zachowując 100% oryginalnych pikseli."
      },
      "photo-gps-remover": {
        title: "Usuwanie Lokalizacji GPS i Danych EXIF ze Zdjęć Online Za Darmo (100% Prywatnie)",
        h1: "📍 Lokalny Skaner i Usuwanie Współrzędnych GPS EXIF ze Zdjęć",
        lead: "Sprawdź, czy zdjęcia ze smartfona zawierają dokładne współrzędne GPS (0x8825) i pobierz czystą kopię bez wysyłania plików do chmury.",
        q1: "Czy zdjęcia z telefonu zawierają dokładny adres GPS domu?",
        a1: "Tak, smartfony domyślnie zapisują szerokość i długość geograficzną oraz czas wykonania zdjęcia w EXIF.",
        q2: "Dlaczego czyszczenie w przeglądarce jest bezpieczniejsze?",
        a2: "Ponieważ prywatne zdjęcia nigdy nie opuszczają Twojego urządzenia."
      },
      "webp-png-to-jpg-clean": {
        title: "Konwersja WebP i PNG na Czysty JPG bez Metadanych C2PA Online Za Darmo",
        h1: "🖼️ Lokalny Konwerter WebP / PNG na Czysty JPG sRGB (0% C2PA)",
        lead: "Zamień obrazy WebP z ChatGPT/DALL-E lub PNG z Midjourney na uniwersalny format JPG z jednoczesnym usunięciem podpisów C2PA.",
        q1: "Dlaczego warto konwertować pliki WebP z ChatGPT na JPG?",
        a1: "Pobrane pliki WebP zawierają poświadczenia C2PA powodujące oznaczanie treści jako AI.",
        q2: "Czy mogę przekonwertować wiele plików naraz do .ZIP?",
        a2: "Tak, w pełnym PureAI Studio przetworzysz do 100 zdjęć jednocześnie."
      },
      "mp4-frame-extractor": {
        title: "Wyodrębnij Pierwszą i Ostatnią Klatkę HD z Wideo MP4 Online (Czysty PNG bez C2PA)",
        h1: "🎞️ Lokalny Ekstraktor Ostatniej Klatki HD z MP4 (Kling · Runway · Sora)",
        lead: "Zapisz dokładną ostatnią klatkę z dowolnego pliku MP4 jako bezstratny PNG bez metadanych C2PA do przedłużania wideo AI.",
        q1: "Po co wyciągać ostatnią klatkę z wideo wygenerowanego przez AI?",
        a1: "Aby użyć jej jako obrazu startowego w Kling, Runway lub Sora i płynnie przedłużyć ujęcie.",
        q2: "Czy zachowana jest oryginalna rozdzielczość filmu?",
        a2: "Tak, klatka jest renderowana w pełnej natywnej rozdzielczości pliku MP4."
      }
    }
  }
};

const TOOL_KEYS = [
  "ai-photo-detector",
  "png-prompt-inspector",
  "photo-gps-remover",
  "webp-png-to-jpg-clean",
  "mp4-frame-extractor"
];

function computeMatrixEntrySlug(langCode, toolKey) {
  return langCode === "en" ? `${toolKey}.html` : `${langCode}-${toolKey}.html`;
}

function getAllMatrixEntries() {
  const entries = [];
  // Ordenado por idioma para que la Ola 1 cubra las 5 herramientas completas en EN, ES y PT (15 páginas)
  for (const langCode of LANG_ORDER) {
    const langPack = LANG_PACKS[langCode];
    for (const toolKey of TOOL_KEYS) {
      const toolCopy = langPack.tools[toolKey];
      entries.push({
        lang: langCode,
        hreflang: langPack.hreflang,
        toolKey,
        slug: computeMatrixEntrySlug(langCode, toolKey),
        title: toolCopy.title,
        h1: toolCopy.h1,
        lead: toolCopy.lead,
        q1: toolCopy.q1,
        a1: toolCopy.a1,
        q2: toolCopy.q2,
        a2: toolCopy.a2,
        langPack
      });
    }
  }
  return entries;
}

function getUnlockedMatrixPages(nowInput, options = {}) {
  const all = getAllMatrixEntries();
  if (options && options.unlockAll) return all;
  const nowMs = nowInput ? new Date(nowInput).getTime() : Date.now();
  const anchorMs = new Date(ROLLOUT_ANCHOR_ISO + "T00:00:00Z").getTime();
  const daysElapsed = Number.isFinite(nowMs) && nowMs > anchorMs
    ? Math.floor((nowMs - anchorMs) / (24 * 3600 * 1000))
    : 0;
  const limit = Math.min(all.length, INITIAL_UNLOCK_COUNT + daysElapsed * DAILY_UNLOCK_STEP);
  return all.slice(0, limit);
}

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildInteractiveWidgetMarkup(entry) {
  const lp = entry.langPack;
  const studioLangParam = entry.lang === "es" ? "es" : entry.lang === "de" ? "de" : "en";
  const studioHref = `clean-ai-studio.html?lang=${studioLangParam}&utm_source=matrix_${entry.toolKey}`;

  let acceptAttr = "image/jpeg,image/png,image/webp,video/mp4";
  let extraControlsHtml = "";
  let primaryActionButtonsHtml = "";

  if (entry.toolKey === "ai-photo-detector") {
    acceptAttr = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime";
    primaryActionButtonsHtml = `
      <button id="mtx-cert-btn" type="button" onclick="window.__mtxDownloadCert()" style="display:none;padding:0.65rem 1.1rem;border-radius:9px;border:1px solid #a855f7;background:rgba(168,85,247,0.2);color:#f8fafc;font-weight:700;cursor:pointer;">${lp.downloadCertBtn}</button>
      <a id="mtx-studio-cta" href="${studioHref}" style="display:inline-block;padding:0.65rem 1.15rem;border-radius:9px;background:#10b981;color:#022c22;font-weight:800;text-decoration:none;">${lp.openFullStudio}</a>
    `;
  } else if (entry.toolKey === "png-prompt-inspector") {
    acceptAttr = "image/png,image/webp,image/jpeg";
    extraControlsHtml = `
      <pre id="mtx-png-dump" style="display:none;margin-top:10px;padding:10px;max-height:220px;overflow:auto;background:#020617;border:1px solid #334155;border-radius:8px;color:#6ee7b7;font-size:0.76rem;white-space:pre-wrap;word-break:break-word;"></pre>
    `;
    primaryActionButtonsHtml = `
      <button id="mtx-action-btn" type="button" onclick="window.__mtxExportCleanImage('image/png', 0.95)" style="display:none;padding:0.65rem 1.15rem;border-radius:9px;border:none;background:#10b981;color:#022c22;font-weight:800;cursor:pointer;">${lp.stripPngBtn}</button>
      <a href="${studioHref}" style="display:inline-block;padding:0.65rem 1.1rem;border-radius:9px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-weight:700;text-decoration:none;">${lp.openFullStudio}</a>
    `;
  } else if (entry.toolKey === "photo-gps-remover") {
    acceptAttr = "image/jpeg,image/png,image/webp";
    primaryActionButtonsHtml = `
      <button id="mtx-action-btn" type="button" onclick="window.__mtxExportCleanImage('image/jpeg', 0.94)" style="display:none;padding:0.65rem 1.15rem;border-radius:9px;border:none;background:#10b981;color:#022c22;font-weight:800;cursor:pointer;">${lp.cleanNowBtn}</button>
      <a href="${studioHref}" style="display:inline-block;padding:0.65rem 1.1rem;border-radius:9px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-weight:700;text-decoration:none;">${lp.openFullStudio}</a>
    `;
  } else if (entry.toolKey === "webp-png-to-jpg-clean") {
    acceptAttr = "image/webp,image/png,image/jpeg,image/avif";
    extraControlsHtml = `
      <div style="margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:0.82rem;color:#cbd5e1;">
        <label for="mtx-jpg-q"><strong>sRGB JPEG Quality:</strong></label>
        <input id="mtx-jpg-q" type="range" min="80" max="98" value="94" oninput="document.getElementById('mtx-jpg-q-val').textContent=this.value+'%'" />
        <span id="mtx-jpg-q-val" style="color:#10b981;font-weight:700;">94%</span>
      </div>
    `;
    primaryActionButtonsHtml = `
      <button id="mtx-action-btn" type="button" onclick="window.__mtxConvertJpg()" style="display:none;padding:0.65rem 1.15rem;border-radius:9px;border:none;background:#10b981;color:#022c22;font-weight:800;cursor:pointer;">${lp.convertJpgBtn}</button>
      <a href="${studioHref}" style="display:inline-block;padding:0.65rem 1.1rem;border-radius:9px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-weight:700;text-decoration:none;">${lp.openFullStudio}</a>
    `;
  } else if (entry.toolKey === "mp4-frame-extractor") {
    acceptAttr = "video/mp4,video/webm,video/quicktime";
    extraControlsHtml = `
      <video id="mtx-video-el" controls muted playsinline style="display:none;width:100%;max-height:280px;margin-top:10px;border-radius:10px;background:#000;"></video>
      <div id="mtx-frame-bar" style="display:none;margin-top:10px;gap:8px;flex-wrap:wrap;">
        <button type="button" onclick="window.__mtxSeekVideo('first')" style="padding:0.45rem 0.85rem;border-radius:7px;border:1px solid #334155;background:#1e293b;color:#f8fafc;cursor:pointer;font-weight:600;">⏮ 0.00s (First Frame)</button>
        <button type="button" onclick="window.__mtxSeekVideo('last')" style="padding:0.45rem 0.85rem;border-radius:7px;border:1px solid #10b981;background:rgba(16,185,129,0.18);color:#6ee7b7;cursor:pointer;font-weight:700;">⏭ Last Frame (-0.04s)</button>
      </div>
    `;
    primaryActionButtonsHtml = `
      <button id="mtx-action-btn" type="button" onclick="window.__mtxCaptureVideoFrame()" style="display:none;padding:0.65rem 1.15rem;border-radius:9px;border:none;background:#10b981;color:#022c22;font-weight:800;cursor:pointer;">${lp.extractFrameBtn}</button>
      <a href="${studioHref}" style="display:inline-block;padding:0.65rem 1.1rem;border-radius:9px;border:1px solid #334155;background:#0f172a;color:#e2e8f0;font-weight:700;text-decoration:none;">${lp.openFullStudio}</a>
    `;
  }

  return `
    <section style="margin:1.25rem 0 1.65rem;padding:1.35rem;background:linear-gradient(145deg,rgba(16,185,129,0.14),rgba(15,23,42,0.98));border:2px solid #10b981;border-radius:14px;box-shadow:0 12px 32px rgba(0,0,0,0.45);">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
        <span style="font-size:0.78rem;font-weight:800;color:#6ee7b7;letter-spacing:0.03em;">🛡️ ${escapeXml(lp.badgeZeroUpload)}</span>
        <span style="font-size:0.75rem;background:rgba(168,85,247,0.2);color:#e9d5ff;padding:3px 9px;border-radius:99px;font-weight:700;">${lp.flag} ${escapeXml(lp.label)}</span>
      </div>

      <label for="mtx-file-inp" id="mtx-dropzone" style="display:block;padding:1.35rem 1rem;border:2px dashed rgba(16,185,129,0.55);border-radius:12px;text-align:center;cursor:pointer;background:rgba(2,6,23,0.65);transition:border-color 0.2s;">
        <div style="font-size:1.55rem;margin-bottom:4px;">📂</div>
        <div style="font-weight:700;color:#f8fafc;font-size:0.95rem;">${escapeXml(lp.dropPrompt)}</div>
        <div style="font-size:0.76rem;color:#94a3b8;margin-top:4px;">${escapeXml(lp.privacyNote)}</div>
        <input id="mtx-file-inp" type="file" accept="${acceptAttr}" style="display:none;" onchange="window.__mtxHandleFile(this.files && this.files[0])" />
      </label>

      <div id="mtx-audit-box" style="display:none;margin-top:12px;padding:11px 13px;border-radius:10px;background:#020617;border:1px solid #334155;font-size:0.84rem;line-height:1.5;"></div>
      ${extraControlsHtml}

      <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
        ${primaryActionButtonsHtml}
      </div>
    </section>

    <script>
    (function(){
      var TOOL_KEY = ${JSON.stringify(entry.toolKey)};
      var MSG_THREATS = ${JSON.stringify(lp.threatsFound)};
      var MSG_CLEAN = ${JSON.stringify(lp.cleanFound)};
      var STUDIO_URL = ${JSON.stringify(studioHref)};
      var currentFile = null;
      var currentFindings = [];
      var loadedImg = null;

      function esc(s) {
        return String(s || "").replace(/[&<>"']/g, function(c){
          return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
        });
      }

      function parsePngTextChunks(bytes) {
        var out = [];
        if (bytes.length < 16 || bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4E || bytes[3] !== 0x47) return out;
        var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        var off = 8;
        var dec = new TextDecoder("utf-8", { fatal: false });
        while (off + 8 <= bytes.length) {
          var len = dv.getUint32(off, false);
          var type = String.fromCharCode(bytes[off+4], bytes[off+5], bytes[off+6], bytes[off+7]);
          if (off + 12 + len > bytes.length) break;
          if (type === "tEXt" || type === "iTXt") {
            var raw = dec.decode(bytes.subarray(off + 8, off + 8 + Math.min(len, 16384))).replace(/\\0+/g, ": ");
            out.push("[" + type + "] " + raw.slice(0, 2400));
          } else if (type === "caBX" || type === "jumb" || type === "eXIf") {
            out.push("[" + type + "] Binary metadata segment (" + len + " bytes)");
          }
          off += 12 + len;
          if (type === "IEND") break;
        }
        return out;
      }

      window.__mtxHandleFile = async function(file) {
        if (!file || !file.size || file.size > 150 * 1024 * 1024) return;
        currentFile = file;
        currentFindings = [];
        loadedImg = null;
        var buf = await file.arrayBuffer();
        var bytes = new Uint8Array(buf);
        var head = bytes.subarray(0, Math.min(bytes.length, 262144));
        var tail = bytes.length > 262144 ? bytes.subarray(Math.max(262144, bytes.length - 131072)) : new Uint8Array(0);
        var dec = new TextDecoder("latin1");
        var ascii = dec.decode(head) + (tail.length ? "\\n" + dec.decode(tail) : "");

        var hasGpsBin = false;
        for (var i = 0; i + 3 < Math.min(head.length, 65536); i++) {
          if ((head[i] === 0x25 && head[i+1] === 0x88 && head[i+2] === 0x04 && head[i+3] === 0x00) ||
              (head[i] === 0x88 && head[i+1] === 0x25 && head[i+2] === 0x00 && head[i+3] === 0x04)) {
            hasGpsBin = true; break;
          }
        }

        if (/c2pa|jumbf|c2ma|contentcredentials/i.test(ascii)) currentFindings.push("C2PA / JUMBF Content Credentials");
        if (/trainedAlgorithmicMedia|DigitalSourceType/i.test(ascii)) currentFindings.push("IPTC / XMP trainedAlgorithmicMedia");
        if (/GPSInfo|GPSLatitude|GPSLongitude/.test(ascii) || hasGpsBin) currentFindings.push("EXIF Binary GPS Coordinates (0x8825)");
        if (/Exif\\0\\0/.test(ascii)) currentFindings.push("Camera / Device EXIF APP1 Header");
        if (/ComfyUI|workflow|parameters|Midjourney|Stable Diffusion|DALL-E|Sora|Runway|Kling/i.test(ascii)) currentFindings.push("AI Generator / Prompt Signature");

        var box = document.getElementById("mtx-audit-box");
        if (box) {
          box.style.display = "block";
          var cleanName = esc(file.name);
          var kb = (file.size / 1024).toFixed(1) + " KB";
          if (currentFindings.length > 0) {
            box.innerHTML = "<div style='color:#fda4af;font-weight:700;'>⚠️ " + esc(MSG_THREATS) + " — " + cleanName + " (" + kb + ")</div>" +
              "<div style='margin-top:6px;display:flex;flex-wrap:wrap;gap:5px;'>" +
              currentFindings.map(function(f){ return "<span style='background:rgba(244,63,94,0.18);border:1px solid rgba(244,63,94,0.45);color:#fecdd3;padding:2px 8px;border-radius:6px;font-size:0.75rem;'>" + esc(f) + "</span>"; }).join("") +
              "</div>";
          } else {
            box.innerHTML = "<div style='color:#6ee7b7;font-weight:700;'>✅ " + esc(MSG_CLEAN) + " — " + cleanName + " (" + kb + ")</div>";
          }
        }

        var certBtn = document.getElementById("mtx-cert-btn");
        if (certBtn) certBtn.style.display = "inline-block";

        var pngDump = document.getElementById("mtx-png-dump");
        if (pngDump) {
          var chunks = parsePngTextChunks(bytes);
          pngDump.style.display = "block";
          pngDump.textContent = chunks.length ? chunks.join("\\n\\n") : "0 PNG tEXt / iTXt / C2PA chunks found in container.";
        }

        if (/^video\\//i.test(file.type) || /\\.(mp4|mov|webm)$/i.test(file.name)) {
          var vid = document.getElementById("mtx-video-el");
          var fbar = document.getElementById("mtx-frame-bar");
          var actBtn = document.getElementById("mtx-action-btn");
          if (vid) {
            vid.src = URL.createObjectURL(file);
            vid.style.display = "block";
            vid.onloadedmetadata = function() {
              if (fbar) fbar.style.display = "flex";
              if (actBtn) actBtn.style.display = "inline-block";
            };
          }
        } else {
          var img = new Image();
          img.onload = function() {
            loadedImg = img;
            var actBtn2 = document.getElementById("mtx-action-btn");
            if (actBtn2) actBtn2.style.display = "inline-block";
          };
          img.src = URL.createObjectURL(file);
        }
      };

      window.__mtxExportCleanImage = function(mime, quality) {
        if (!loadedImg || !currentFile) return;
        var used = parseInt(localStorage.getItem("pureai_free_img_uses_v2") || "0", 10) || 0;
        var hasPro = Boolean(localStorage.getItem("pureai_studio_pro"));
        if (used >= 1 && !hasPro) {
          window.location.href = STUDIO_URL;
          return;
        }
        var c = document.createElement("canvas");
        c.width = loadedImg.naturalWidth || 1024;
        c.height = loadedImg.naturalHeight || 1024;
        var ctx = c.getContext("2d");
        ctx.drawImage(loadedImg, 0, 0);
        c.toBlob(function(blob) {
          if (!blob) return;
          if (!hasPro) localStorage.setItem("pureai_free_img_uses_v2", String(used + 1));
          var a = document.createElement("a");
          var ext = mime === "image/png" ? ".png" : ".jpg";
          a.href = URL.createObjectURL(blob);
          a.download = currentFile.name.replace(/\\.[^.]+$/, "") + "-clean" + ext;
          a.click();
        }, mime || "image/jpeg", quality || 0.94);
      };

      window.__mtxConvertJpg = function() {
        var qEl = document.getElementById("mtx-jpg-q");
        var q = qEl ? Math.max(0.8, Math.min(0.98, Number(qEl.value) / 100)) : 0.94;
        window.__mtxExportCleanImage("image/jpeg", q);
      };

      window.__mtxSeekVideo = function(pos) {
        var vid = document.getElementById("mtx-video-el");
        if (!vid || !vid.duration) return;
        vid.currentTime = pos === "last" ? Math.max(0, vid.duration - 0.04) : 0;
      };

      window.__mtxCaptureVideoFrame = function() {
        var vid = document.getElementById("mtx-video-el");
        if (!vid || !vid.videoWidth) return;
        var c = document.createElement("canvas");
        c.width = vid.videoWidth;
        c.height = vid.videoHeight;
        c.getContext("2d").drawImage(vid, 0, 0, c.width, c.height);
        c.toBlob(function(blob) {
          if (!blob) return;
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = (currentFile ? currentFile.name.replace(/\\.[^.]+$/, "") : "video") + "-frame-hd.png";
          a.click();
        }, "image/png");
      };

      window.__mtxDownloadCert = function() {
        if (!currentFile) return;
        var c = document.createElement("canvas");
        c.width = 1080; c.height = 1350;
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#060913";
        ctx.fillRect(0, 0, 1080, 1350);
        ctx.strokeStyle = currentFindings.length ? "#f43f5e" : "#10b981";
        ctx.lineWidth = 8;
        ctx.strokeRect(36, 36, 1008, 1278);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 44px system-ui, sans-serif";
        ctx.fillText("PUREAI STUDIO — FORENSIC AUDIT", 84, 130);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "28px system-ui, sans-serif";
        ctx.fillText("File: " + String(currentFile.name).slice(0, 44), 84, 200);
        ctx.fillText("Size: " + (currentFile.size / 1024).toFixed(1) + " KB · 100% Local RAM Inspection", 84, 248);
        ctx.fillStyle = currentFindings.length ? "#fda4af" : "#6ee7b7";
        ctx.font = "bold 38px system-ui, sans-serif";
        ctx.fillText(currentFindings.length ? ("⚠️ " + currentFindings.length + " METADATA SIGNATURES FOUND") : "✅ 0 HIDDEN AI / C2PA / GPS THREATS", 84, 350);
        var list = currentFindings.length ? currentFindings : ["0 C2PA / JUMBF Provenance Boxes", "0 EXIF GPS Coordinates (0x8825)", "0 Hidden Prompt / XMP AI Tags"];
        ctx.font = "30px system-ui, sans-serif";
        ctx.fillStyle = "#e2e8f0";
        for (var i = 0; i < list.length && i < 6; i++) {
          ctx.fillText("• " + list[i], 96, 440 + i * 64);
        }
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 32px system-ui, sans-serif";
        ctx.fillText("Verified 100% Locally at PureAIStudios.com", 84, 1210);
        ctx.fillStyle = "#64748b";
        ctx.font = "24px system-ui, sans-serif";
        ctx.fillText(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC · Zero Server Upload", 84, 1255);
        c.toBlob(function(blob) {
          if (!blob) return;
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "pureai-forensic-certificate.png";
          a.click();
        }, "image/png");
      };
    })();
    </script>
  `;
}

function buildMatrixToolHtml(entry, unlockedEntries) {
  const lp = entry.langPack;
  const clusterPeers = (Array.isArray(unlockedEntries) ? unlockedEntries : [entry]).filter(
    (e) => e.toolKey === entry.toolKey
  );
  const enPeer = clusterPeers.find((e) => e.lang === "en") || entry;

  const hreflangLinks = [
    ...clusterPeers.map(
      (peer) => `  <link rel="alternate" hreflang="${peer.hreflang}" href="${SITE_URL}/${peer.slug}" />`
    ),
    `  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/${enPeer.slug}" />`
  ].join("\n");

  const langSwitcherPills = clusterPeers
    .map((peer) => {
      const active = peer.lang === entry.lang;
      return `<a href="${peer.slug}" style="padding:3px 9px;border-radius:99px;font-size:0.76rem;text-decoration:none;border:1px solid ${active ? "#10b981" : "#334155"};background:${active ? "rgba(16,185,129,0.2)" : "#0f172a"};color:${active ? "#6ee7b7" : "#cbd5e1"};font-weight:${active ? "700" : "500"};">${peer.langPack.flag} ${peer.lang.toUpperCase()}</a>`;
    })
    .join(" ");

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: entry.title,
        url: `${SITE_URL}/${entry.slug}`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any (100% Browser Client-Side)",
        inLanguage: entry.lang,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR"
        }
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: entry.q1,
            acceptedAnswer: { "@type": "Answer", text: entry.a1 }
          },
          {
            "@type": "Question",
            name: entry.q2,
            acceptedAnswer: { "@type": "Answer", text: entry.a2 }
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="${entry.lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';" />
  <title>${escapeXml(entry.title)} | PureAI Studio</title>
  <meta name="description" content="${escapeXml(entry.lead)}" />
  <link rel="canonical" href="${SITE_URL}/${entry.slug}" />
${hreflangLinks}
  <link rel="alternate" type="application/rss+xml" title="PureAI Studio Tools RSS" href="${SITE_URL}/feed.xml" />
  <link rel="stylesheet" href="styles.css" />
  <script type="application/ld+json">${JSON.stringify(schemaGraph)}</script>
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <a href="clean-ai-studio.html" class="brand" style="text-decoration:none;color:inherit;">
        <span class="brand-icon">🧬</span>
        <div>
          <strong>PureAI Studio</strong>
          <span class="brand-tag">C2PA · EXIF · MP4 · ComfyUI</span>
        </div>
      </a>
      <nav class="tabs">
        <a href="clean-ai-studio.html" class="tab-btn active" style="text-decoration:none;">🖼️ PureAI Studio</a>
        <a href="https://chromewebstore.google.com/detail/pureai-studio-%E2%80%94-c2pa-meta/pdebjlkmjdhpgiigepojdcpfbfimcgmo" target="_blank" rel="noopener" class="tab-btn" style="text-decoration:none;">🧩 ${escapeXml(lp.extLabel)}</a>
        <a href="https://t.me/PureAIScannerBot" target="_blank" rel="noopener" class="tab-btn" style="text-decoration:none;border-color:#38bdf8;color:#7dd3fc;">✈️ @PureAIScannerBot</a>
        <a href="directorio-guias.html" class="tab-btn" style="text-decoration:none;">🗂️ ${escapeXml(lp.dirLabel)}</a>
      </nav>
    </div>
  </header>

  <main class="container main-grid">
    <article class="calc-card" style="line-height:1.72;">
      <div style="margin-bottom:0.85rem;display:flex;flex-wrap:wrap;gap:6px;">${langSwitcherPills}</div>
      <h1>${escapeXml(entry.h1)}</h1>
      <p class="subtitle">${escapeXml(entry.lead)}</p>

      ${buildInteractiveWidgetMarkup(entry)}

      <section style="margin-top:1.75rem;border-top:1px solid #1e293b;padding-top:1.25rem;">
        <h2 style="font-size:1.15rem;margin-bottom:0.85rem;">${escapeXml(lp.faqHeading)}</h2>
        <div style="margin-bottom:1rem;">
          <h3 style="font-size:0.98rem;color:#f8fafc;margin-bottom:0.3rem;">${escapeXml(entry.q1)}</h3>
          <p style="color:#cbd5e1;font-size:0.92rem;">${escapeXml(entry.a1)}</p>
        </div>
        <div>
          <h3 style="font-size:0.98rem;color:#f8fafc;margin-bottom:0.3rem;">${escapeXml(entry.q2)}</h3>
          <p style="color:#cbd5e1;font-size:0.92rem;">${escapeXml(entry.a2)}</p>
        </div>
      </section>
    </article>

    <aside class="affiliate-sidebar">
      <div class="offer-card" style="border-color:#10b981;background:linear-gradient(160deg,#0f172a 0%,#064e3b 100%);">
        <span class="offer-badge">${escapeXml(lp.packOfferBadge)}</span>
        <h2>${escapeXml(lp.packOfferTitle)}</h2>
        <p>${escapeXml(lp.packOfferDesc)}</p>
        <a href="clean-ai-studio.html" class="cta-button">${escapeXml(lp.packCta)}</a>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">
          <a href="https://buy.stripe.com/9B6cN6e669uZ4vmeTE0000f" target="_blank" rel="noopener" style="text-align:center;padding:0.5rem;border-radius:8px;background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.2);color:#e2e8f0;font-size:0.78rem;font-weight:700;text-decoration:none;">10 Files · €2.99</a>
          <a href="https://buy.stripe.com/3cIdRae66bD74vm6n80000g" target="_blank" rel="noopener" style="text-align:center;padding:0.5rem;border-radius:8px;background:rgba(168,85,247,0.25);border:1px solid #a855f7;color:#fff;font-size:0.78rem;font-weight:700;text-decoration:none;">50 + .ZIP · €9.90</a>
        </div>
      </div>
    </aside>
  </main>

  <footer class="footer">
    <div class="container">
      <p>© 2026 PureAI Studio — 100% Client-Side C2PA, EXIF, MP4 &amp; ComfyUI Privacy Suite · <a href="privacy-policy.html" style="color:#10b981;">Privacy</a> · <a href="terms.html" style="color:#10b981;">Terms</a> · <a href="embed-scanner.html" style="color:#10b981;">Free Embed Scanner</a> · <a href="https://t.me/PureAIScannerBot" target="_blank" rel="noopener" style="color:#38bdf8;">Telegram Bot (@PureAIScannerBot)</a></p>
    </div>
  </footer>
  <script src="telemetria-soporte.js" defer></script>
</body>
</html>`;
}

function buildRssFeedXml(items, nowInput) {
  const pubDate = (nowInput ? new Date(nowInput) : new Date()).toUTCString();
  const itemNodes = (Array.isArray(items) ? items : [])
    .slice(0, 60)
    .map(
      (it) => `    <item>
      <title>${escapeXml(it.title)}</title>
      <link>${escapeXml(it.url)}</link>
      <guid isPermaLink="true">${escapeXml(it.url)}</guid>
      <description>${escapeXml(it.description || it.title)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PureAI Studio — Free Local C2PA, EXIF, MP4 &amp; AI Forensic Tools</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>100% client-side C2PA metadata scrubber, iPhone 16 Pro EXIF camera profile injector, MP4 video cleaner, ComfyUI PNG workflow inspector, and invisible Unicode remover.</description>
    <language>en</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
${itemNodes}
  </channel>
</rss>`;
}

module.exports = {
  LANG_ORDER,
  LANG_PACKS,
  TOOL_KEYS,
  INITIAL_UNLOCK_COUNT,
  DAILY_UNLOCK_STEP,
  computeMatrixEntrySlug,
  getAllMatrixEntries,
  getUnlockedMatrixPages,
  buildMatrixToolHtml,
  buildRssFeedXml
};
