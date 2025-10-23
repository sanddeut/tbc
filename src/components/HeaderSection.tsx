export function HeaderSection() {
  return (
    <div className="bg-white border-b border-gray-200 h-[200px] flex items-center justify-center px-[0px] p-[0px]">
      <div className="text-center px-6">
        <h1 className="text-gray-700 text-xl font-bold mb-[24px] mt-[0px] mr-[0px] ml-[0px]">
          기업용 탄소배출량계산기
        </h1>
        <div className="text-slate-500 text-[12px] max-w-2xl leading-[1.5]">
          <p className="mb-2">
            이 계산기는 국내 배출권거래제 지침의 기본 산정방법을 활용해,
            <br />
            간단한 사업장 배출량을 산정할 수 있도록
            제작되었습니다.
          </p>
          <p>
            더 다양한 종류의 배출량에 대한 정확한 산정은 탄소회계
            플랫폼 엔츠로 문의해 주세요 :)
          </p>
        </div>
      </div>
    </div>
  );
}