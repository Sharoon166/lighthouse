import Image from "next/image";
import logo from "@/assets/logo.png";
import darkLogo from "@/assets/logo-dark.png";

export default function LogoImage({ dark }: { dark?: boolean }) {
  return (
    <Image
      src={dark ? darkLogo : logo}
      alt="Lighthouse logo"
      priority
      className="w-24"
    />
  );
}
