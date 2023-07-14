"use client"

import Link from 'next/link';

export default function Linker({ href, color="text-white", text, fontSize }) {
  return (
    <Link href={href}>
      <span className={`${color} ${fontSize}`}>{text}</span>
    </Link>
  );
}
