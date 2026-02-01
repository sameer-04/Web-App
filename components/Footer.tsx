'use client';

import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">ShopZilla</h3>
            <p className="footer-copy">© 2025 ShopZilla. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Quick Links</h4>
              <a href="/">Home</a>
              <a href="/products">Products</a>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms & Conditions</a>
            </div>
            <div className="link-group">
              <h4>Support</h4>
              <a href="/contact">Contact Support</a>
              <a href="/faq">FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
