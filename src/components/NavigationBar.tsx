import imgCiDarkHorizontal1 from "figma:asset/5c1621529cd6a34730c112f9449c9a91a424b924.png";

interface NavigationBarProps {
  onReset?: () => void;
}

export function NavigationBar({ onReset }: NavigationBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="h-[63px] flex items-center justify-center">
        <a 
          href="https://aents.co/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <img 
            src={imgCiDarkHorizontal1} 
            alt="AENTS Logo" 
            className="h-7 w-[101px] object-contain hover:opacity-80 transition-opacity"
          />
        </a>
      </div>
    </div>
  );
}