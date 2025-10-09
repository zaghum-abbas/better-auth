import React, { ReactNode, ElementType } from "react";
import clsx from "clsx";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "pxl"
  | "plg"
  | "psm"
  | "pxs"
  | "pxsm";

type Color = "primary" | "secondary" | "dark" | "light";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant: Variant;
  children: ReactNode;
  className?: string;
  color?: Color;
  font?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  color = "primary",
  className = "",
  font,
  ...props
}) => {
  const variantMapping: Record<
    Variant,
    {
      variant: ElementType;
      classes: string;
    }
  > = {
    h1: {
      variant: "h1",
      classes:
        "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-serif",
    },
    h2: {
      variant: "h2",
      classes:
        "text-3xl md:text-4xl lg:text-5xl font-semibold leading-snug font-serif text-neutral-800",
    },
    h3: {
      variant: "h3",
      classes:
        "text-2xl md:text-3xl lg:text-4xl font-serif font-semibold leading-snug",
    },
    h4: {
      variant: "h4",
      classes: "text-xl md:text-2xl lg:text-3xl font-medium leading-snug",
    },
    h5: {
      variant: "h5",
      classes:
        "text-lg md:text-xl lg:text-2xl font-medium leading-normal font-serif",
    },
    h6: {
      variant: "h6",
      classes: "text-base md:text-lg lg:text-xl font-medium leading-normal",
    },
    p: {
      variant: "p",
      classes: "text-base md:text-lg font-sans text-neutral-800",
    },
    pxl: {
      variant: "p",
      classes: "text-lg md:text-xl ",
    },
    plg: {
      variant: "p",
      classes: "text-base md:text-lg",
    },
    psm: {
      variant: "p",
      classes: "text-sm md:text-base ",
    },
    pxs: {
      variant: "p",
      classes: "text-xs sm:text-sm",
    },
    pxsm: {
      variant: "p",
      classes: "text-xs text-neutral-500",
    },
  };

  const colors: Record<Color, string> = {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    dark: "text-black",
    light: "text-white",
  };

  const { variant: Component, classes } = variantMapping[variant];

  const colorClass = colors[color] || "";

  return (
    <Component className={clsx(classes, colorClass, className)} {...props}>
      {children}
    </Component>
  );
};
