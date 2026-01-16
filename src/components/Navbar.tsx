import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button, buttonVariants } from "./ui/button";
import { Menu } from "lucide-react";
import { siteConfig, navLinks } from "@/config/content";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-16 px-4 w-screen flex justify-between items-center">
          {/* Logo - Signature Style */}
          <NavigationMenuItem className="font-bold flex">
            <a
              rel="noreferrer noopener"
              href="/"
              className="font-display italic text-xl text-primary hover:text-primary/80 transition-colors"
            >
              {siteConfig.name}
            </a>
          </NavigationMenuItem>

          {/* Mobile Menu */}
          <span className="flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu className="flex md:hidden h-5 w-5 text-foreground">
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>

              <SheetContent side={"left"} className="bg-background">
                <SheetHeader>
                  <SheetTitle className="font-display italic text-xl text-primary">
                    {siteConfig.name}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {navLinks.map(({ href, label }) => (
                    <a
                      rel="noreferrer noopener"
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      {label}
                    </a>
                  ))}
                  <Button asChild className="mt-4 w-full">
                    <a
                      href={siteConfig.cta.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {siteConfig.cta.text}
                    </a>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1">
            {navLinks.map((route, i) => (
              <a
                rel="noreferrer noopener"
                href={route.href}
                key={i}
                className={`text-sm tracking-wide ${buttonVariants({
                  variant: "ghost",
                })}`}
              >
                {route.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Button asChild size="sm" className="px-6">
              <a
                href={siteConfig.cta.href}
                target="_blank"
                rel="noreferrer"
              >
                {siteConfig.cta.text}
              </a>
            </Button>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
