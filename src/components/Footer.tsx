import aentsLogo from "figma:asset/ef15999cc6889354f3e15728e1dd00c39e51e98f.png";

export function Footer() {
  return (
    <footer className="bg-[#253238] py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* 로고 */}
        <div className="mb-8">
          <img 
            src={aentsLogo} 
            alt="AENTS 로고" 
            className="w-[123px] h-[34px] mx-auto object-contain"
          />
        </div>
        
        {/* 회사 정보 */}
        <div className="mb-8">
          <p className="text-white text-[11px] font-normal font-['Noto_Sans_KR'] leading-[1.6]">
            주식회사 엔츠 AENTS Co.,Ltd.
            <br />
            02-6956-1130  |  info@aents.co
          </p>
        </div>
        
        {/* 저작권 정보 */}
        <div>
          <p className="text-white/70 text-[11px] font-normal font-['Noto_Sans_KR'] leading-[1.6]">
            Copyright 2025 ©AENTS CO, Ltd. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}