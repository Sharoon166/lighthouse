"use client";

import {
  Call02Icon,
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
  Mail01Icon,
  MessageCircle,
  NewTwitterIcon,
  TiktokIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactInfo, socialLinks } from "@/lib/constants";

const socialIconMap: Record<string, typeof Facebook01Icon> = {
  Facebook: Facebook01Icon,
  Instagram: InstagramIcon,
  Twitter: NewTwitterIcon,
  Linkedin: Linkedin01Icon,
  Tiktok: TiktokIcon,
};

export function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form */}
      <div className="lg:col-span-3 space-y-6">
        <div className="space-y-2">
          <h2>Send us a message</h2>
          <p>
            Do you have a question? A complaint? Or need help to choose the
            right product from Light House. Feel free to contact us.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-xs tracking-widest uppercase text-muted-foreground"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Enter Your First Name..."
                value={form.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-xs tracking-widest uppercase text-muted-foreground"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Enter Your Last Name..."
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs tracking-widest uppercase text-muted-foreground"
            >
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter Your Email..."
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-xs tracking-widest uppercase text-muted-foreground"
            >
              Phone
            </Label>
            <div className="flex gap-2">
              <select className="h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="+92">🇵🇰 +92</option>
              </select>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter Your Phone..."
                value={form.phone}
                onChange={handleChange}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="text-xs tracking-widest uppercase text-muted-foreground"
            >
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Enter Your Message..."
              rows={5}
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" size="lg">
            Send a Message
          </Button>
        </form>
      </div>

      {/* Contact Info Card */}
      <div className="lg:col-span-2 bg-noise rounded-lg p-8 space-y-8">
        <div className="space-y-2">
          <h3 className="text-xl font-heading font-semibold text-primary">
            Hi! We are always here to help you.
          </h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-foreground/10">
              <HugeiconsIcon
                icon={Call02Icon}
                size={18}
                className="text-gold"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs tracking-widest uppercase text-secondary-foreground/60">
                Hotline
              </p>
              <p className="font-medium">{contactInfo.hotline}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-foreground/10">
              <HugeiconsIcon
                icon={MessageCircle}
                size={18}
                className="text-gold"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs tracking-widest uppercase text-secondary-foreground/60">
                SMS / WhatsApp
              </p>
              <p className="font-medium">{contactInfo.sms}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-foreground/10">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={18}
                className="text-gold"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs tracking-widest uppercase text-secondary-foreground/60">
                Email
              </p>
              <p className="font-medium">{contactInfo.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-secondary-foreground/20">
          <p className="text-xs tracking-widest uppercase text-secondary-foreground/60">
            Connect with us
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => {
              const Icon = socialIconMap[link.name];
              return (
                <a
                  key={link.name}
                  href={link.url}
                  aria-label={link.name}
                  className="flex size-9 items-center justify-center rounded-full bg-secondary-foreground/10 transition-colors hover:bg-secondary-foreground/20"
                >
                  {Icon && <HugeiconsIcon icon={Icon} size={16} />}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
