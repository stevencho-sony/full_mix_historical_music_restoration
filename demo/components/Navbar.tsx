"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";

const links = [
  ["Demo", "#demo"],
  ["Method", "#method"],
  ["Results", "#results"],
  ["Dataset", "#dataset"],
  ["Paper", "#paper"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const allLinks = siteConfig.githubUrl ? [...links, ["GitHub", siteConfig.githubUrl]] : links;
  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="nav-inner">
        <a className="nav-brand" href="#top">Historical Music Restoration</a>
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
          <span className="sr-only">Toggle menu</span>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <div className="desktop-nav">
          {allLinks.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </div>
      </div>
      {open && (
        <div className="mobile-nav" id="mobile-menu">
          {allLinks.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        </div>
      )}
    </nav>
  );
}
