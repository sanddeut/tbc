import imgImage3 from "figma:asset/20a7003aab6c6fee4bca253cefa9e7528d829089.png";

export default function Frame4() {
  return (
    <div className="bg-[#253238] relative size-full">
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium leading-[0] text-[11px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[177px] translate-x-[-50%]" style={{ left: "calc(50% + 1.5px)" }}>
        <p className="leading-[1.6] whitespace-pre">Copyright 2025 ©AENTS CO, Ltd. All Rights Reserved.</p>
      </div>
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium leading-[0] left-1/2 text-[#ffffff] text-[11px] text-center text-nowrap top-[121px] translate-x-[-50%]">
        <p className="leading-[1.6] whitespace-pre">
          주식회사 엔츠 AENTS Co.,Ltd.
          <br aria-hidden="true" />
          {` 02-6956-1130  |  info@aents.co`}
        </p>
      </div>
      <div className="absolute bg-center bg-cover bg-no-repeat h-[34px] top-[53px] translate-x-[-50%] w-[123px]" data-name="image 3" style={{ left: "calc(50% + 0.5px)", backgroundImage: `url('${imgImage3}')` }} />
    </div>
  );
}