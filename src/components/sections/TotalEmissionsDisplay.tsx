import { useState } from "react";
import {
  CalculationInputs,
  ElectricityResult,
  SectionResult,
} from "../../utils/calculations";
import { EmissionTypeModal } from "../EmissionTypeModal";
import { MethodTypeModal } from "../MethodTypeModal";

interface TotalEmissionsDisplayProps {
  showResults: boolean;
  results: {
    electricity: ElectricityResult | null;
    districtHeating: SectionResult | null;
    cityGas: SectionResult | null;
    oilBoiler: SectionResult | null;
    vehicle: SectionResult | null;
    totals: any;
  };
  inputs: CalculationInputs;
  onReset: () => void;
}

export function TotalEmissionsDisplay({
  showResults,
  results,
  inputs,
  onReset,
}: TotalEmissionsDisplayProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "direct" | "indirect" | null;
  }>({
    isOpen: false,
    type: null,
  });

  const [methodModalState, setMethodModalState] = useState<{
    isOpen: boolean;
    type: "location" | "market" | null;
  }>({
    isOpen: false,
    type: null,
  });

  // 초기 상태에서도 표시하되, 결과가 없으면 0으로 표시
  const hasValidResults = results?.totals && inputs.industry;
  const displayTotals = hasValidResults ? results.totals : {
    direct: "0.000",
    indirect: {
      location: "0.000",
      market: "0.000"
    },
    total: {
      location: "0.000",
      market: "0.000"
    }
  };

  const openModal = (type: "direct" | "indirect") => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  const openMethodModal = (type: "location" | "market") => {
    setMethodModalState({ isOpen: true, type });
  };

  const closeMethodModal = () => {
    setMethodModalState({ isOpen: false, type: null });
  };

  return (
    <>
      <div className={`p-6 min-h-full flex flex-col transition-opacity duration-300 ${
        !inputs.industry ? 'opacity-50' : 'opacity-100'
      }`}>
        {/* 제목 */}
        <h2 className="text-gray-700 text-[16px] font-bold text-center mx-[0px] mt-[24px] mr-[0px] mb-[40px] ml-[0px]">
          총 탄소배출량
        </h2>

        {/* 초기 상태 안내 메시지 */}
        {!hasValidResults && inputs.industry && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              배출량 데이터를 입력해주세요
            </p>
          </div>
        )}

        {/* 가로 레이아웃 */}
        <div className="w-full min-w-[480px] max-w-[550px] mx-auto px-[0px] py-[8px] mx-[32px] my-[0px] flex-grow">
          {/* 헤더 */}
          <div className="grid grid-cols-3 gap-8 mb-3">
            <div className="text-center">
              <button
                onClick={() => hasValidResults && openModal("direct")}
                className={`block w-full text-sm font-medium transition-colors ${
                  hasValidResults 
                    ? "text-gray-700 hover:text-primary cursor-pointer" 
                    : "text-gray-400 cursor-default"
                }`}
              >
                직접배출
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => hasValidResults && openModal("indirect")}
                className={`block w-full text-sm font-medium transition-colors ${
                  hasValidResults 
                    ? "text-gray-700 hover:text-primary cursor-pointer" 
                    : "text-gray-400 cursor-default"
                }`}
              >
                간접배출
              </button>
            </div>
            <div className="text-center">
              <div className={`text-sm font-medium ${hasValidResults ? "text-gray-700" : "text-gray-400"}`}>
                총 배출량
              </div>
            </div>
          </div>
          
          {/* 헤더 아래 통합 구분선 */}
          <div className="border-t border-[#9CA3AF] mb-4"></div>
          
          {/* 데이터 영역 */}
          <div className="grid grid-cols-3 gap-8">
            {/* 직접배출 데이터 */}
            <div className="text-center">
              {/* 병합된 행 - 간접배출 열과 같은 높이로 세로 중앙 정렬 */}
              <div className="flex items-center justify-center" style={{height: '4.5rem'}}>
                <div className="text-center">
                  <span className={`text-base font-semibold ${hasValidResults ? "text-gray-900" : "text-gray-400"}`}>
                    {displayTotals.direct}
                  </span>
                  <span className={`text-sm ml-1 ${hasValidResults ? "text-gray-600" : "text-gray-400"}`}>
                    tCO₂e
                  </span>
                </div>
              </div>
            </div>

            {/* 간접배출 데이터 */}
            <div className="text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => hasValidResults && openMethodModal("location")}
                    className={`text-xs transition-colors whitespace-nowrap ${
                      hasValidResults 
                        ? "text-gray-500 hover:text-primary cursor-pointer" 
                        : "text-gray-400 cursor-default"
                    }`}
                  >
                    지역기반
                  </button>
                  <div>
                    <span className={`text-base font-semibold ${hasValidResults ? "text-gray-900" : "text-gray-400"}`}>
                      {displayTotals.indirect.location}
                    </span>
                    <span className={`text-sm ml-1 ${hasValidResults ? "text-gray-600" : "text-gray-400"}`}>
                      tCO₂e
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => hasValidResults && openMethodModal("market")}
                    className={`text-xs transition-colors whitespace-nowrap ${
                      hasValidResults 
                        ? "text-gray-500 hover:text-primary cursor-pointer" 
                        : "text-gray-400 cursor-default"
                    }`}
                  >
                    시장기반
                  </button>
                  <div>
                    <span className={`text-base font-semibold ${hasValidResults ? "text-gray-900" : "text-gray-400"}`}>
                      {displayTotals.indirect.market}
                    </span>
                    <span className={`text-sm ml-1 ${hasValidResults ? "text-gray-600" : "text-gray-400"}`}>
                      tCO₂e
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 총 배출량 데이터 */}
            <div className="text-center">
              <div className="space-y-2">
                <div className="text-center">
                  <div>
                    <span className={`text-base font-bold ${hasValidResults ? "text-primary" : "text-gray-400"}`}>
                      {displayTotals.total.location}
                    </span>
                    <span className={`text-sm ml-1 ${hasValidResults ? "text-gray-600" : "text-gray-400"}`}>
                      tCO₂e
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div>
                    <span className={`text-base font-bold ${hasValidResults ? "text-primary" : "text-gray-400"}`}>
                      {displayTotals.total.market}
                    </span>
                    <span className={`text-sm ml-1 ${hasValidResults ? "text-gray-600" : "text-gray-400"}`}>
                      tCO₂e
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 서비스 소개 카드 */}
        <div className="px-6 py-[32px] mt-auto px-[24px] py-[48px]">
        <div className="bg-white bg-opacity-80 border border-gray-200 rounded-[8px] p-6 text-center max-w-[396px] mx-auto">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-600 leading-6">
              <span className="block">모든 사업장의 배출량을</span>
              <span className="text-[#157859]">한번에 </span>계산하고 싶다면?
            </h3>

            <p className="text-xs text-slate-500 leading-5">
              엔스코프로 탄소배출량 산정부터 공시와 감축까지<br />
              탄소중립의 A to Z를 손쉽게 관리해보세요.
            </p>

            <div className="pt-2">
              <a
                href="https://aents.co/service-brochure-request/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#3bc184] text-white px-5 py-2 rounded-md text-xs font-bold hover:bg-[#2ea66d] transition-colors"
              >
                서비스소개서 다운로드
              </a>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* 배출 유형 설명 모달 */}
      <EmissionTypeModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type || "direct"}
      />

      {/* 계산 방법 설명 모달 */}
      <MethodTypeModal
        isOpen={methodModalState.isOpen}
        onClose={closeMethodModal}
        type={methodModalState.type || "location"}
      />
    </>
  );
}