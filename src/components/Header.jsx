function Header({ isDark, toggleTheme, voiceOn, toggleVoice }) {
  return (
    <header className={`${isDark ? 'bg-[#202123] text-white' : 'bg-white text-black'} border-b border-gray-600 p-4 rounded-b-xl`}>
      <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
        <h1 className="text-lg font-semibold">Eva - Your emotional support</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleVoice}
            className="bg-[#10A37F] text-white px-3 py-2 rounded-md hover:bg-[#0D8C6A] transition"
          >
            {voiceOn ? '🔊' : '🔇'}
          </button>
          <button
            onClick={toggleTheme}
            className={`${isDark ? 'bg-gray-500' : 'bg-gray-300'} px-3 py-2 rounded-md hover:opacity-80 transition`}
          >
            🌙
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
