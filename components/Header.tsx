import Link from 'next/link';

const Header = () => {
  return (
    <header className="glassmorphism p-4 mb-8">
     <Link href="/" className="text-xl font-bold">
  Bibel-Symbolraum
</Link>
    </header>
  );
};

export default Header;