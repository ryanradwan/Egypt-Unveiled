import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-heading text-2xl text-foreground mb-2">The Next Stamp Tours</p>
        <p className="text-muted-foreground font-body text-sm mb-6">
          Iconic Giza &amp; Grand Egyptian Museum — guided experiences for the culturally curious.
        </p>
        <div className="flex justify-center gap-6 text-xs font-body text-muted-foreground mb-6">
          <Link to="/terms" className="hover:text-foreground transition-colors underline underline-offset-4">
            Terms & Conditions
          </Link>
          <Link to="/terms#liability" className="hover:text-foreground transition-colors underline underline-offset-4">
            Liability Disclaimer
          </Link>
        </div>
        <p className="text-muted-foreground/50 font-body text-xs">
          © {new Date().getFullYear()} The Next Stamp Tours. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
