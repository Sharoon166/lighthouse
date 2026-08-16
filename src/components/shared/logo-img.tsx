import Image from "next/image";
import logo from "@/assets/logo.png";

export default function LogoImage() {
  return <Image src={logo} alt="Lighthouse logo" priority />;
}
