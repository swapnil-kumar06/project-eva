function Footer({ isDark }) {
  return (
    <footer
      className={`${isDark ? 'bg-[#202123] text-gray-400' : 'bg-white text-gray-600'} border-t border-gray-600 text-center p-3 text-xs`}
    >
      © 2025 Project Eva — Built with ❤️ by Team Swapnil
    </footer>
  );
}

export default Footer;
