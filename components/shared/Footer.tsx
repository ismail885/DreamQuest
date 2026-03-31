import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer mt-auto">
      <div className="footer-content px-6 py-12">
        <div className="footer-grid">
          <div className="footer-section footer-brand">
            <Link
              href="/"
              className="footer-logo hover:opacity-80 transition-opacity"
            >
              <Image src="/Logo_DreamQuest.png" alt="DreamQuest" width={36} height={36} className="object-contain" />
              <span className="logo-text">DreamQuest</span>
            </Link>
            <p className="footer-description">
              Vivez des aventures interactives uniques. Créez votre personnage,
              façonnez votre destin et partagez vos histoires avec la
              communauté.
            </p>
            <div className="footer-social">
              <a
                href="https://twitter.com/dreamquest"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com/ismail885/DreamQuest"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Aventures</h3>
            <ul className="footer-links">
              <li>
                <Link href="/dashboard">Découvrir</Link>
              </li>
              <li>
                <Link href="/create-character">Créer un personnage</Link>
              </li>
              <li>
                <Link href="/adventure">Mes aventures</Link>
              </li>
              <li>
                <Link href="/classement">Classement</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Communauté</h3>
            <ul className="footer-links">
              <li>
                <Link href="/forum">Forum</Link>
              </li>
              <li>
                <Link href="/guides">Guides</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Ressources</h3>
            <ul className="footer-links">
              <li>
                <Link href="/about">À propos</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/support">Support</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Légal</h3>
            <ul className="footer-links">
              <li>
                <Link href="/privacy">Confidentialité</Link>
              </li>
              <li>
                <Link href="/terms">Conditions d&apos;utilisation</Link>
              </li>
              <li>
                <Link href="/cookies">Cookies</Link>
              </li>
              <li>
                <Link href="/licenses">Licences</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} DreamQuest. Tous droits réservés.
          </p>
          <div className="footer-meta">
            <span>Made by Ismail Abou-zaid</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
