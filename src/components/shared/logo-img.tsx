import logo from "@/assets/logo.png";
import Image from "next/image";

export default function LogoImage() {
  return <Image src={logo} alt="Lighthouse logo" priority />;
}
