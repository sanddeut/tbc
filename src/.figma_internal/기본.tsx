import svgPaths from "./svg-rmle3c4vol";

function Add() {
  return (
    <div className="relative shrink-0 size-8" data-name="add">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="add">
          <path d={svgPaths.p26635d80} fill="var(--fill-0, white)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame92() {
  return (
    <div
      className="absolute bg-[#006788] box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-[20px] rounded-[30px] size-[72px] top-[732px]"
      style={{ left: "calc(25% + 61.5px)" }}
    >
      <Add />
    </div>
  );
}

function Frame15() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-5 h-[543px] items-center justify-center left-1/2 overflow-clip pb-5 pt-0 px-6 top-[120px] translate-x-[-50%] w-[390px]">
      <div className="flex flex-col font-['Pretendard:SemiBold',_sans-serif] justify-center leading-[1.5] not-italic relative shrink-0 text-[16px] text-center text-gray-400 text-nowrap whitespace-pre">
        <p className="block mb-0">새로운 디데이를</p>
        <p className="block">등록해보세요!</p>
      </div>
    </div>
  );
}

function Menu() {
  return (
    <div className="relative shrink-0 size-6" data-name="menu">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="menu">
          <path d={svgPaths.p32dc8f00} fill="var(--fill-0, black)" id="icon" />
        </g>
      </svg>
    </div>
  );
}

function Frame18() {
  return (
    <div className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-[10px] relative shrink-0">
      <Menu />
    </div>
  );
}

function NumberThree() {
  return (
    <div className="relative shrink-0 size-6" data-name="NumberThree">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="NumberThree">
          <path
            d={svgPaths.p16077970}
            fill="var(--fill-0, #BBC1CA)"
            id="Vector"
            stroke="var(--stroke-0, #BBC1CA)"
            strokeWidth="0.2"
          />
          <path
            d={svgPaths.p74afe80}
            fill="var(--fill-0, #BBC1CA)"
            id="Vector_2"
            stroke="var(--stroke-0, #BBC1CA)"
            strokeWidth="0.2"
          />
        </g>
      </svg>
    </div>
  );
}

function Percent() {
  return (
    <div className="relative shrink-0 size-6" data-name="Percent">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Percent">
          <path
            d={svgPaths.p3bb63f00}
            fill="var(--fill-0, white)"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeWidth="0.2"
          />
        </g>
      </svg>
    </div>
  );
}

function Frame414() {
  return (
    <div className="bg-[#006788] box-border content-stretch flex flex-row gap-2.5 items-center justify-center px-1.5 py-[5px] relative rounded-[100px] shrink-0 size-7">
      <Percent />
    </div>
  );
}

function Frame413() {
  return (
    <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
      <NumberThree />
      <Frame414 />
    </div>
  );
}

function Switch() {
  return (
    <div
      className="bg-[#ffffff] box-border content-stretch flex flex-col gap-2.5 items-start justify-start px-2 py-1.5 relative rounded-[100px] shrink-0 w-[72px]"
      data-name="Switch"
    >
      <div
        aria-hidden="true"
        className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[100px]"
      />
      <Frame413 />
    </div>
  );
}

function Frame433() {
  return (
    <div className="absolute box-border content-stretch flex flex-row items-center justify-between left-6 p-0 top-10 w-[342px]">
      <Frame18 />
      <Switch />
    </div>
  );
}

function Wifi() {
  return (
    <div className="absolute right-[43px] size-3.5 top-[5px]" data-name="Wifi">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Wifi">
          <g id="Path"></g>
          <g id="Rectangle"></g>
          <g id="Path_2"></g>
          <path d={svgPaths.p10b6f000} fill="var(--fill-0, black)" id="Path_3" opacity="0.1" />
        </g>
      </svg>
    </div>
  );
}

function Signal() {
  return (
    <div className="absolute right-7 size-3.5 top-[5px]" data-name="Signal">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Signal">
          <g id="Path"></g>
          <path d="M13 1L1 13H13V1V1Z" fill="var(--fill-0, black)" id="Path_2" />
        </g>
      </svg>
    </div>
  );
}

function Battery() {
  return (
    <div className="absolute h-3.5 right-4 top-[5px] w-[7px]" data-name="Battery">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 14">
        <g id="Battery">
          <path d={svgPaths.pe5a5800} fill="var(--fill-0, black)" id="Base" opacity="0.3" />
          <path d={svgPaths.p3a600a80} fill="var(--fill-0, black)" id="Charge" />
        </g>
      </svg>
    </div>
  );
}

function RightIcons() {
  return (
    <div className="absolute contents right-4 top-[5px]" data-name="right icons">
      <Wifi />
      <Signal />
      <Battery />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute contents left-4 top-[3px]" data-name="Status bar">
      <RightIcons />
      <div className="absolute flex flex-col font-['Pretendard:Medium',_sans-serif] justify-center leading-[0] left-4 not-italic text-[#000000] text-[12px] text-left text-nowrap top-3 tracking-[0.144px] translate-y-[-50%]">
        <p className="adjustLetterSpacing block leading-[18px] whitespace-pre">9:30</p>
      </div>
    </div>
  );
}

function Group395() {
  return (
    <div className="absolute contents left-0 top-0">
      <StatusBar />
      <div className="absolute h-6 left-0 top-0 w-[390px]" />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#fbfcfd] relative size-full" data-name="기본">
      <Group395 />
      <Frame92 />
      <Frame15 />
      <div className="absolute bg-gradient-to-b from-[#fcfcfc00] h-5 left-0 to-[#fcfcfc] top-[644px] w-[390px]" />
      <Frame433 />
    </div>
  );
}