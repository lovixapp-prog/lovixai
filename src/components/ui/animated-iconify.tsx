import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

type AnimatedIconifyProps = {
  icon: string;
  className?: string;
  wrapperClassName?: string;
  spin?: boolean;
  pulse?: boolean;
  glow?: boolean;
  ambient?: boolean;
  title?: string;
};

const AnimatedIconify = ({
  icon,
  className,
  wrapperClassName,
  spin = false,
  pulse = false,
  glow = true,
  ambient = true,
  title,
}: AnimatedIconifyProps) => (
  <span
    className={cn(
      "group/icon relative inline-flex items-center justify-center align-middle",
      wrapperClassName
    )}
    title={title}
  >
    {glow && (
      <span className="absolute inset-0 rounded-full bg-current opacity-0 blur-md transition-all duration-300 group-hover/icon:scale-125 group-hover/icon:opacity-25 group-hover:opacity-25" />
    )}
    <Icon
      icon={icon}
      className={cn(
        "relative z-10 transition-transform duration-300 group-hover/icon:-translate-y-0.5 group-hover/icon:scale-110 group-hover:-translate-y-0.5 group-hover:scale-110",
        ambient && !spin && "lovix-icon-ambient",
        spin && "animate-spin",
        pulse && "animate-pulse",
        className
      )}
      aria-hidden="true"
    />
  </span>
);

export default AnimatedIconify;
