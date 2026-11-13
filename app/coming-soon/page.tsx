import { MessageCircle, Mail } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';
import { whatsappLink } from '@/lib/commerce/business';

const EMAIL = 'hello@lunarasarees.com';

/**
 * "Coming soon" (founder decision 2026-11-14): the logo, the promise in all
 * three languages, and two ways to reach us. Plain text on white, no
 * photograph, nothing to load from the database.
 */
export default function ComingSoonPage() {
  return (
    <main className="coming-soon">
      <div className="coming-soon-inner">
        <Wordmark className="coming-soon-logo" />
        <span className="coming-soon-rule" aria-hidden="true" />
        <p className="coming-soon-eyebrow">Coming soon</p>
        <h1 className="coming-soon-title">Our online shop opens soon</h1>
        <p className="coming-soon-body">
          Cotton sarees with unstitched jacket material, photographed in daylight so the colour you see is the colour you
          receive.
        </p>
        <p className="coming-soon-other" lang="si">
          අපගේ ඔන්ලයින් සාප්පුව ළඟදීම විවෘත වේ.
        </p>
        <p className="coming-soon-other" lang="ta">
          எங்கள் இணையக் கடை விரைவில் திறக்கப்படும்.
        </p>
        <div className="coming-soon-actions">
          <a href={whatsappLink('Hello Lunara Sarees')} className="coming-soon-action coming-soon-action-primary focus-ring" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="icon icon-inline" aria-hidden="true" />
            WhatsApp us
          </a>
          <a href={`mailto:${EMAIL}`} className="coming-soon-action focus-ring">
            <Mail className="icon icon-inline" aria-hidden="true" />
            {EMAIL}
          </a>
        </div>
      </div>
    </main>
  );
}
