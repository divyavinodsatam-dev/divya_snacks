export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h4 className="font-bold text-gray-800 text-lg mb-1">Divyam Foods</h4>
            <p>Swad Apulki Cha</p>
          </div>
          <div className="text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
            <p>Made with ❤️ for good food.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}