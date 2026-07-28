// Shared link taxonomy for the Nav dropdowns and the Footer columns, so the
// two stay in sync instead of drifting into two separately-maintained lists.
export interface NavLink {
  title: string;
  href: string;
}

export interface NavLinkGroup {
  label: string;
  links: NavLink[];
}

export const NAV_LINK_GROUPS: NavLinkGroup[] = [
  {
    label: "Product",
    links: [
      { title: "How It Works", href: "/#how-it-works" },
      { title: "Features", href: "/#features" },
      { title: "Live Demo", href: "/#demo" },
      { title: "Missed Call Calculator", href: "/#tool" },
      { title: "Who It's For", href: "/#who-its-for" },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Research", href: "/#research" },
      { title: "Build My Receptionist", href: "/build" },
      { title: "Login", href: "/login" },
    ],
  },
  {
    label: "Legal",
    links: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms & Conditions", href: "/terms" },
      { title: "Service Agreement", href: "/service-agreement" },
    ],
  },
];
