import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  CalculationInputs,
  IndustryType,
  DistrictHeatingProvider,
  EMISSION_FACTORS,
  calculateElectricityEmissions,
  calculateDistrictHeatingEmissions,
  calculateCityGasEmissions,
  calculatePropaneEmissions,
  calculateLiquidFuelEmissions,
  calculateVehicleEmissions,
  calculateElectricVehicleEmissions,
} from "../utils/calculations";

interface CalculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  section:
    | "electricity"
    | "gasFuel"
    | "liquidFuel"
    | "districtHeating"
    | "vehicle"
    | "electricVehicle";
  // 실제 계산을 위한 전체 입력 데이터
  allInputs: CalculationInputs;
  
  // 기존 호환성을 위해 유지 (deprecated)
  inputValue?: number;
  resultValue?: number;
  unit?: string;
  industry?: string;
  provider?: string;
  electricityData?: {
    hasRenewable: boolean;
    renewableUsage: number;
    conventionalUsage: number;
    totalUsage: number;
    locationResult: number;
    marketResult: number;
  };
  fuelData?: {
    gasFuel?: {
      cityGas: { amount: number; emissions: number };
      propane: { amount: number; emissions: number };
    };
    liquidFuel?: {
      diesel: { amount: number; emissions: number };
      kerosene: { amount: number; emissions: number };
      gasoline: { amount: number; emissions: number };
    };
    vehicle?: {
      gasoline: {
        amount: number;
        emissions: number;
        inputType: "volume" | "cost";
      };
      diesel: {
        amount: number;
        emissions: number;
        inputType: "volume" | "cost";
      };
      lpg: {
        amount: number;
        emissions: number;
        inputType: "volume" | "cost";
      };
      inputType: "volume" | "cost";
    };
  };
}

export function CalculationModal({
  isOpen,
  onClose,
  section,
  allInputs,
  inputValue = 0,
  resultValue = 0,
  unit = "",
  industry = "energy",
  provider = "",
  electricityData,
  fuelData,
}: CalculationModalProps) {
  // 숫자 포맷 헬퍼 함수 - 정수면 소수점 없이, 아니면 적절한 소수점으로
  const formatNumber = (num: number, decimalPlaces: number = 3) => {
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return num.toFixed(decimalPlaces);
  };

  // 실제 계산 함수를 호출하여 정확한 결과 얻기
  const getActualCalculationResult = () => {
    switch (section) {
      case "electricity":
        const totalElectricity = allInputs.electricity.hasRenewable 
          ? (allInputs.electricity.renewable || 0) + (allInputs.electricity.conventional || 0)
          : allInputs.electricity.total;
        
        return calculateElectricityEmissions(
          totalElectricity,
          allInputs.electricity.renewable,
          allInputs.electricity.hasRenewable,
          allInputs.electricity.unit
        );

      case "districtHeating":
        return calculateDistrictHeatingEmissions(
          allInputs.districtHeating.amount,
          allInputs.districtHeating.provider,
          allInputs.districtHeating.unit,
          allInputs.districtHeating.customEmissionFactors
        );

      case "gasFuel":
        const cityGasResult = calculateCityGasEmissions(
          allInputs.cityGas.amount,
          allInputs.industry as IndustryType
        );
        const propaneResult = calculatePropaneEmissions(
          allInputs.propane.amount,
          allInputs.industry as IndustryType
        );
        return {
          cityGas: cityGasResult,
          propane: propaneResult,
          total: {
            emissions: cityGasResult.emissions + propaneResult.emissions,
            type: 'direct' as const
          }
        };

      case "liquidFuel":
        return calculateLiquidFuelEmissions(
          allInputs.liquidFuel.diesel.amount,
          allInputs.liquidFuel.kerosene.amount,
          allInputs.liquidFuel.gasoline.amount,
          allInputs.industry as IndustryType
        );

      case "vehicle":
        return calculateVehicleEmissions(
          allInputs.vehicle.fuels,
          allInputs.vehicle.inputType
        );

      case "electricVehicle":
        return calculateElectricVehicleEmissions(
          allInputs.electricVehicle?.amount || 0,
          allInputs.electricVehicle?.cost || 0,
          allInputs.electricVehicle?.inputType || 'volume',
          allInputs.electricVehicle?.unit || 'kWh'
        );

      default:
        return { emissions: 0, type: 'direct' as const };
    }
  };

  // 실제 계산 결과 가져오기
  const actualResult = getActualCalculationResult();
  
  // 섹션별 실제 배출량 얻기
  const getActualEmissions = () => {
    if (section === "electricity") {
      return (actualResult as any).market || 0; // 시장기반 기준
    } else if (section === "gasFuel") {
      return (actualResult as any).total?.emissions || 0; // gasFuel은 total 객체 사용
    } else {
      return (actualResult as any).emissions || 0; // 다른 섹션들은 직접 emissions 사용
    }
  };
  
  // 입력값을 계산식에 맞는 단위로 변환
  const getConvertedInputValue = () => {
    switch (section) {
      case "electricity":
        // kWh -> MWh 변환 (kWh일 때만)
        return unit === "kWh" ? inputValue / 1000 : inputValue;
      case "districtHeating":
        // 단위를 TJ로 변환
        if (unit === "Mcal") {
          return inputValue * 0.0000041868;
        } else if (unit === "MWh") {
          return inputValue * 0.0036;
        } else if (unit === "MJ") {
          return inputValue * 0.000001;
        }
        return inputValue;
      case "electricVehicle":
        // 전기차량의 경우
        if (allInputs?.electricVehicle?.inputType === 'cost') {
          // 비용 -> kWh -> MWh 변환
          const costValue = allInputs.electricVehicle.cost || 0;
          const usageInKwh = costValue / EMISSION_FACTORS.electricityPrice;
          return usageInKwh / 1000;
        } else {
          // kWh -> MWh 변환 (kWh일 때만)
          const originalUnit = allInputs?.electricVehicle?.unit || 'kWh';
          const originalAmount = allInputs?.electricVehicle?.amount || 0;
          return originalUnit === "kWh" ? originalAmount / 1000 : originalAmount;
        }
      default:
        return inputValue;
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "electricity":
        return "전기";
      case "gasFuel":
        return "기체연료";
      case "liquidFuel":
        return "액체연료";
      case "districtHeating":
        return "열(스팀)";
      case "vehicle":
        return "내연기관차";
      case "electricVehicle":
        return "전기차";
      default:
        return "";
    }
  };

  // 출처 정보
  const getSourceInfo = (section: string) => {
    const commonSource = {
      title: "출처: 온실가스 배출권거래제의 배출량 보고 및 인증에 관한 지침",
      method: "배출량 산정방법: Tier 1 (IPCC 2006)",
      heating: "순발열량: Tier 2 (국가고유발열량)"
    };

    let emissionFactor = "배출계수: Tier 1 (IPCC 2006, CO₂, CH₄, N₂O)";

    if (section === "electricity" || section === "electricVehicle") {
      emissionFactor = "배출계수: Tier 2 (국가고유배출계수)";
    } else if (section === "districtHeating") {
      if (provider === "national") {
        emissionFactor = "배출계수: Tier 2 (2013 국가 열(스팀) 배출계수)";
      } else if (provider === "others") {
        emissionFactor = "배출계수: 직접 입력";
      } else {
        emissionFactor = "배출계수: Tier 3 (한국지역난방공사 배출계수, 2024년, 4기 배출권할당시)";
      }
    }

    return {
      ...commonSource,
      emissionFactor
    };
  };

  // 사용한 산정방법
  const getCalculationMethod = (section: string) => {
    switch (section) {
      case "electricity":
        return (
          <div className="leading-relaxed">
            <div className="font-medium text-gray-800 mb-2 text-[13px]">배출량(tGHG) = 외부에서 공급받은 전력 사용량(MWh) × 온실가스별 전력배출계수(tGHG/MWh)</div>
          </div>
        );
      case "electricVehicle":
        return (
          <div className="leading-relaxed">
            <div className="font-medium text-gray-800 mb-2 text-[13px]">배출량(tGHG) = 외부에서 공급받은 전력 사용량(MWh) × 온실가스별 전력배출계수(tGHG/MWh)</div>
            
            {/* 비용 입력 모드일 때 변환 기준 표시 */}
            {allInputs?.electricVehicle?.inputType === "cost" && (
              <div className="text-[13px] text-gray-600 mt-2">
                <div className="font-medium text-gray-700 mb-1">사용량 변환 기준</div>
                <div className="ml-2">
                  <div>• 전기요금: 324.4원/kWh</div>
                  <div className="text-[12px] mt-1">(출처: 환경부 100kW급 미만)</div>
                </div>
              </div>
            )}
          </div>
        );
      case "districtHeating":
        return (
          <div className="leading-relaxed">
            <div className="font-medium text-gray-800 mb-2 text-[13px]">배출량(tGHG) = 열(스팀) 사용량(TJ) × 온실가스별 배출계수</div>
          </div>
        );
      case "gasFuel":
        return (
          <div className="leading-relaxed">
            <div className="text-[13px] text-gray-600 space-y-2">
              <div className="text-[13px]">
                <span className="font-medium text-gray-700">CO₂:</span><br/>
                (연료 사용량 × 열량계수 × 온실가스별 배출계수 × 산화계수 × 10⁻⁶) × GWP
              </div>
              <div className="text-[13px]">
                <span className="font-medium text-gray-700">CH₄, N₂O:</span><br/>
                (연료 사용량 × 열량계수 × 온실가스별 배출계수 × 10⁻⁶) × GWP
              </div>
            </div>
          </div>
        );
      case "liquidFuel":
        return (
          <div className="leading-relaxed">
            <div className="text-[13px] text-gray-600 space-y-2">
              <div>
                <span className="font-medium text-gray-700">CO₂:</span><br/>
                (연료 사용량 × 열량계수 × 온실가스별 배출계수 × 산화계수 × 10⁻⁶) × GWP
              </div>
              <div>
                <span className="font-medium text-gray-700">CH₄, N₂O:</span><br/>
                (연료 사용량 × 열량계수 × 온실가스별 배출계수 × 10⁻⁶) × GWP
              </div>
            </div>
          </div>
        );
      case "vehicle":
        return (
          <div className="leading-relaxed">
            <div className="font-medium text-gray-800 mb-3 text-[13px]">배출량(tGHG) = 연료 사용량(KL) × 열량계수 × 배출계수 × 10⁻⁶</div>
            
            {/* 비용 입력 모드일 때만 사용량 변환 기준 표시 */}
            {allInputs?.vehicle.inputType === "cost" && (
              <div className="text-[13px] text-gray-600">
                <div className="font-medium text-gray-700 mb-1">사용량 변환 기준</div>
                <div className="ml-2 space-y-1">
                  <div>• 휘발유: 1,646.71원/L</div>
                  <div>• 경유: 1,502.69원/L</div>
                  <div>• LPG: 995.25원/L</div>
                  <div className="text-[12px] mt-1">(출처: Opinet, 2024년 연간평균)</div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return "";
    }
  };


  const renderCalculationProcess = (section: string) => {
    // 전기는 지역기반과 시장기반 모두 표시
    if (section === "electricity" && allInputs) {
      const totalElectricity = allInputs.electricity.hasRenewable 
        ? (allInputs.electricity.renewable || 0) + (allInputs.electricity.conventional || 0)
        : allInputs.electricity.total;

      const convertedTotalUsage = allInputs.electricity.unit === "kWh" ? totalElectricity / 1000 : totalElectricity;
      const convertedRenewableUsage = allInputs.electricity.unit === "kWh" ? (allInputs.electricity.renewable || 0) / 1000 : (allInputs.electricity.renewable || 0);
      const convertedConventionalUsage = allInputs.electricity.unit === "kWh" ? (allInputs.electricity.conventional || 0) / 1000 : (allInputs.electricity.conventional || 0);

      // 실제 계산 결과 사용 (actualResult가 ElectricityResult 타입)
      const electricityResult = actualResult as any; // ElectricityResult 타입

      // 온실가스별 계산 결과
      const co2 = convertedTotalUsage * 0.4567;
      const ch4 = convertedTotalUsage * 0.0036 / 1000 * 21;
      const n2o = convertedTotalUsage * 0.0085 / 1000 * 310;

      if (!allInputs.electricity.hasRenewable) {
        // 재생에너지 토글 OFF - 단일 계산식
        return (
          <div className="space-y-3">
            {/* 지역기반 */}
            <div className="bg-white border border-gray-200 rounded-[8px] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  지역기반 (Location-based)
                </span>
                <span className="text-sm font-bold text-[#3BC184]">
                  {electricityResult.location.toFixed(2)} tCO₂e
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono leading-relaxed">
                <div className="mb-2">
                  <span className="text-gray-500">입력값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(totalElectricity)}</span> {allInputs.electricity.unit}<br/>
                  {allInputs.electricity.unit === "kWh" && (
                    <><span className="text-gray-500">변환값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(convertedTotalUsage)}</span> MWh<br/></>
                  )}
                </div>
                <span className="text-[#3BC184] font-semibold">
                  {electricityResult.location.toFixed(2)} tCO₂e
                </span> = <br/>
                <span className="text-gray-500">CO₂:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.4567) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
                <span className="text-gray-500">CH₄:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.0036/1000*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
                <span className="text-gray-500">N₂O:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.0085/1000*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
              </div>
            </div>

            {/* 시장기반 */}
            <div className="bg-white border border-gray-200 rounded-[8px] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  시장기반 (Market-based)
                </span>
                <span className="text-sm font-bold text-[#3BC184]">
                  {electricityResult.market.toFixed(2)} tCO₂e
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono leading-relaxed">
                <div className="mb-2">
                  <span className="text-gray-500">입력값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(totalElectricity)}</span> {allInputs.electricity.unit}<br/>
                  {allInputs.electricity.unit === "kWh" && (
                    <><span className="text-gray-500">변환값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(convertedTotalUsage)}</span> MWh<br/></>
                  )}
                </div>
                <span className="text-[#3BC184] font-semibold">
                  {electricityResult.market.toFixed(2)} tCO₂e
                </span> = <br/>
                <span className="text-gray-500">CO₂:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.4567) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
                <span className="text-gray-500">CH₄:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.0036/1000*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
                <span className="text-gray-500">N₂O:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.0085/1000*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
              </div>
            </div>
          </div>
        );
      } else {
        // 재생에너지 토글 ON - 분리 계산식
        const conventionalCo2 = convertedConventionalUsage * 0.4567;
        const conventionalCh4 = convertedConventionalUsage * 0.0036 / 1000 * 21;
        const conventionalN2o = convertedConventionalUsage * 0.0085 / 1000 * 310;

        return (
          <div className="space-y-3">
            {/* 지역기반 */}
            <div className="bg-white border border-gray-200 rounded-[8px] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  지역기반 (Location-based)
                </span>
                <span className="text-sm font-bold text-[#3BC184]">
                  {electricityResult.location.toFixed(2)} tCO₂e
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono leading-relaxed">
                <div className="mb-2">
                  <span className="text-gray-500">총 전기사용량:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(totalElectricity)}</span> {allInputs.electricity.unit}<br/>
                  <span className="text-gray-500">재생전기:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(allInputs.electricity.renewable || 0)}</span> {allInputs.electricity.unit}<br/>
                  <span className="text-gray-500">일반전기:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(allInputs.electricity.conventional || 0)}</span> {allInputs.electricity.unit}<br/>
                  {allInputs.electricity.unit === "kWh" && (
                    <><span className="text-gray-500">변환값(총):</span> <span className="font-semibold text-[#3BC184]">{formatNumber(convertedTotalUsage)}</span> MWh<br/></>
                  )}
                </div>
                <span className="text-[#3BC184] font-semibold">
                  {electricityResult.location.toFixed(2)} tCO₂e
                </span> = <br/>
                <span className="text-gray-500">CO₂:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.4567) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
                <span className="text-gray-500">CH₄:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.0036/1000*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
                <span className="text-gray-500">N₂O:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedTotalUsage)}
                </span>*0.0085/1000*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
              </div>
            </div>

            {/* 시장기반 */}
            <div className="bg-white border border-gray-200 rounded-[8px] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  시장기반 (Market-based)
                </span>
                <span className="text-sm font-bold text-[#3BC184]">
                  {electricityResult.market.toFixed(2)} tCO₂e
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono leading-relaxed">
                <div className="mb-2">
                  <span className="text-gray-500">일반전기만 계산:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(allInputs.electricity.conventional || 0)}</span> {allInputs.electricity.unit}<br/>
                  {allInputs.electricity.unit === "kWh" && (
                    <><span className="text-gray-500">변환값(일반):</span> <span className="font-semibold text-[#3BC184]">{formatNumber(convertedConventionalUsage)}</span> MWh<br/></>
                  )}
                </div>
                <span className="text-[#3BC184] font-semibold">
                  {electricityResult.market.toFixed(2)} tCO₂e
                </span> = <br/>
                <span className="text-gray-500">CO₂:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedConventionalUsage)}
                </span>*0.4567) = <span className="text-[#3BC184] font-semibold">{conventionalCo2.toFixed(3)}</span> +<br/>
                <span className="text-gray-500">CH₄:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedConventionalUsage)}
                </span>*0.0036/1000*21) = <span className="text-[#3BC184] font-semibold">{conventionalCh4.toFixed(3)}</span> +<br/>
                <span className="text-gray-500">N₂O:</span> (<span className="font-semibold text-[#3BC184]">
                  {formatNumber(convertedConventionalUsage)}
                </span>*0.0085/1000*310) = <span className="text-[#3BC184] font-semibold">{conventionalN2o.toFixed(3)}</span>
              </div>
            </div>
          </div>
        );
      }
    }

    // 전기차량 처리
    if (section === "electricVehicle") {
      const convertedUsage = getConvertedInputValue();
      const co2 = convertedUsage * 0.4567;
      const ch4 = convertedUsage * 0.0036 / 1000 * 21;
      const n2o = convertedUsage * 0.0085 / 1000 * 310;

      // 입력 유형에 따른 표시
      let inputDisplay = '';
      let convertedDisplay = '';
      
      if (allInputs.electricVehicle?.inputType === 'cost') {
        inputDisplay = `${formatNumber(allInputs.electricVehicle.cost || 0)}원`;
        convertedDisplay = `${formatNumber(convertedUsage)} MWh`;
      } else {
        const originalAmount = allInputs.electricVehicle?.amount || 0;
        const originalUnit = allInputs.electricVehicle?.unit || 'kWh';
        inputDisplay = `${formatNumber(originalAmount)} ${originalUnit}`;
        if (originalUnit === 'kWh') {
          convertedDisplay = `${formatNumber(convertedUsage)} MWh`;
        }
      }

      return (
        <div className="bg-white border border-gray-200 rounded-[8px] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              전기차량 배출량
            </span>
            <span className="text-sm font-bold text-[#3BC184]">
              {getActualEmissions().toFixed(2)} tCO₂e
            </span>
          </div>
          <div className="text-xs text-gray-600 font-mono leading-relaxed">
            <div className="mb-2">
              <span className="text-gray-500">입력값:</span> <span className="font-semibold text-[#3BC184]">{inputDisplay}</span><br/>
              {convertedDisplay && (
                <><span className="text-gray-500">변환값:</span> <span className="font-semibold text-[#3BC184]">{convertedDisplay}</span><br/></>
              )}
            </div>
            <span className="text-[#3BC184] font-semibold">
              {getActualEmissions().toFixed(2)} tCO₂e
            </span> = <br/>
            <span className="text-gray-500">CO₂:</span> (<span className="font-semibold text-[#3BC184]">
              {formatNumber(convertedUsage)}
            </span>*0.4567) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
            <span className="text-gray-500">CH₄:</span> (<span className="font-semibold text-[#3BC184]">
              {formatNumber(convertedUsage)}
            </span>*0.0036/1000*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
            <span className="text-gray-500">N₂O:</span> (<span className="font-semibold text-[#3BC184]">
              {formatNumber(convertedUsage)}
            </span>*0.0085/1000*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
          </div>
        </div>
      );
    }

    // 기체연료는 도시가스와 프로판 계산과정 표시
    if (section === "gasFuel" && fuelData?.gasFuel) {
      const { cityGas, propane } = fuelData.gasFuel;
      let calculations: Array<{
        fuel: string;
        input: number;
        result: string;
        formula: React.ReactNode;
      }> = [];

      if (cityGas.amount > 0) {
        const convertedCityGasInput = cityGas.amount / 1000; // Nm³ -> 천m³
        const ch4Factor = 
          industry === "energy" || industry === "manufacturing" ? "1" : "5";
        
        const co2 = convertedCityGasInput * 38.9 * 56100 * 1.0 * Math.pow(10, -6);
        const ch4 = convertedCityGasInput * 38.9 * Number(ch4Factor) * Math.pow(10, -6) * 21;
        const n2o = convertedCityGasInput * 38.9 * 0.1 * Math.pow(10, -6) * 310;

        calculations.push({
          fuel: "도시가스(LNG)",
          input: cityGas.amount,
          result: cityGas.emissions.toFixed(2),
          formula: (
            <div className="leading-relaxed">
              <span className="text-gray-500">CO₂:</span> ({formatNumber(convertedCityGasInput)}*38.9*56,100*1.0*10⁻⁶*1) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">CH₄:</span> ({formatNumber(convertedCityGasInput)}*38.9*{ch4Factor}*10⁻⁶*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">N₂O:</span> ({formatNumber(convertedCityGasInput)}*38.9*0.1*10⁻⁶*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
            </div>
          ),
        });
      }

      if (propane.amount > 0) {
        const ch4Factor = 
          industry === "energy" || industry === "manufacturing" ? "1" : "5";
        
        const co2 = propane.amount * 46.3 * 63100 * 1.0 * Math.pow(10, -6);
        const ch4 = propane.amount * 46.3 * Number(ch4Factor) * Math.pow(10, -6) * 21;
        const n2o = propane.amount * 46.3 * 0.1 * Math.pow(10, -6) * 310;

        calculations.push({
          fuel: "프로판",
          input: propane.amount,
          result: propane.emissions.toFixed(2),
          formula: (
            <div className="leading-relaxed">
              <span className="text-gray-500">CO₂:</span> ({formatNumber(propane.amount)}*46.3*63,100*1.0*10⁻⁶*1) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">CH₄:</span> ({formatNumber(propane.amount)}*46.3*{ch4Factor}*10⁻⁶*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">N₂O:</span> ({formatNumber(propane.amount)}*46.3*0.1*10⁻⁶*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
            </div>
          ),
        });
      }

      return (
        <div className="space-y-3">
          {calculations.map((calc, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-[8px] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {calc.fuel}
                </span>
                <span className="text-sm font-bold text-[#3BC184]">
                  {calc.result} tCO₂e
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono">
                <div className="mb-2">
                  <span className="text-gray-500">입력값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(calc.input)}</span> {calc.fuel === "도시가스(LNG)" ? "Nm³" : "kg"}<br/>
                  {calc.fuel === "도시가스(LNG)" && (
                    <><span className="text-gray-500">변환값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(calc.input / 1000)}</span> 천m³<br/></>
                  )}
                </div>
                <span className="text-[#3BC184] font-semibold">
                  {calc.result} tCO₂e
                </span> = <br/>
                {calc.formula}
              </div>
            </div>
          ))}
          {calculations.length > 1 && (
            <div className="bg-[rgba(243,244,246,1)] border border-gray-200 rounded-[8px] p-4 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  총 배출량
                </span>
                <span className="text-base font-bold text-[#3BC184]">
                  {getActualEmissions().toFixed(2)} tCO₂e
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 액체연료 계산과정 표시
    if (section === "liquidFuel" && allInputs) {
      let calculations: Array<{
        fuel: string;
        amount: number;
        result: number;
        formula: React.ReactNode;
      }> = [];

      // 경유 계산
      if (allInputs.liquidFuel.diesel.amount > 0) {
        const convertedAmount = allInputs.liquidFuel.diesel.amount / 1000; // L -> KL
        let co2: number, ch4: number, n2o: number;
        
        if (allInputs.industry === 'energy' || allInputs.industry === 'manufacturing') {
          // 에너지산업, 제조업건설업: CH₄ 배출계수 3
          co2 = convertedAmount * 35.2 * 74100 * 1.0 * Math.pow(10, -6);
          ch4 = convertedAmount * 35.2 * 3 * Math.pow(10, -6) * 21;
          n2o = convertedAmount * 35.2 * 0.6 * Math.pow(10, -6) * 310;
        } else {
          // 상업공공, 가정기타: CH₄ 배출계수 10
          co2 = convertedAmount * 35.2 * 74100 * 1.0 * Math.pow(10, -6);
          ch4 = convertedAmount * 35.2 * 10 * Math.pow(10, -6) * 21;
          n2o = convertedAmount * 35.2 * 0.6 * Math.pow(10, -6) * 310;
        }
        const total = co2 + ch4 + n2o;

        calculations.push({
          fuel: "경유",
          amount: allInputs.liquidFuel.diesel.amount,
          result: total,
          formula: (
            <div className="leading-relaxed">
              <span className="text-gray-500">CO₂:</span> ({formatNumber(convertedAmount)}*35.2*74,100*1.0*10⁻⁶*1) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">CH₄:</span> ({formatNumber(convertedAmount)}*35.2*{allInputs.industry === 'energy' || allInputs.industry === 'manufacturing' ? '3' : '10'}*10⁻⁶*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">N₂O:</span> ({formatNumber(convertedAmount)}*35.2*0.6*10⁻⁶*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
            </div>
          ),
        });
      }

      // 등유 계산
      if (allInputs.liquidFuel.kerosene.amount > 0) {
        const convertedAmount = allInputs.liquidFuel.kerosene.amount / 1000; // L -> KL
        let co2: number, ch4: number, n2o: number;
        
        if (allInputs.industry === 'energy' || allInputs.industry === 'manufacturing') {
          // 에너지산업, 제조업건설업: CH₄ 배출계수 3
          co2 = convertedAmount * 34.2 * 71900 * 1.0 * Math.pow(10, -6);
          ch4 = convertedAmount * 34.2 * 3 * Math.pow(10, -6) * 21;
          n2o = convertedAmount * 34.2 * 0.6 * Math.pow(10, -6) * 310;
        } else {
          // 상업공공, 가정기타: CH₄ 배출계수 10
          co2 = convertedAmount * 34.2 * 71900 * 1.0 * Math.pow(10, -6);
          ch4 = convertedAmount * 34.2 * 10 * Math.pow(10, -6) * 21;
          n2o = convertedAmount * 34.2 * 0.6 * Math.pow(10, -6) * 310;
        }
        const total = co2 + ch4 + n2o;

        calculations.push({
          fuel: "등유",
          amount: allInputs.liquidFuel.kerosene.amount,
          result: total,
          formula: (
            <div className="leading-relaxed">
              <span className="text-gray-500">CO₂:</span> ({formatNumber(convertedAmount)}*34.2*71,900*1.0*10⁻⁶*1) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">CH₄:</span> ({formatNumber(convertedAmount)}*34.2*{allInputs.industry === 'energy' || allInputs.industry === 'manufacturing' ? '3' : '10'}*10⁻⁶*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">N₂O:</span> ({formatNumber(convertedAmount)}*34.2*0.6*10⁻⁶*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
            </div>
          ),
        });
      }

      // 휘발유 계산 (현재 calculations.ts의 오류 그대로 반영)
      if (allInputs.liquidFuel.gasoline.amount > 0) {
        const convertedAmount = allInputs.liquidFuel.gasoline.amount / 1000; // L -> KL
        let co2: number, ch4: number, n2o: number;
        
        if (allInputs.industry === 'energy' || allInputs.industry === 'manufacturing') {
          // 에너지산업, 제조업건설업: CH₄ 배출계수 3
          // CO₂는 올바른 열량계수(30.4) 사용, CH₄/N₂O는 잘못된 열량계수(34.2) 사용 (calculations.ts와 일치)
          co2 = convertedAmount * 30.4 * 69300 * 1.0 * Math.pow(10, -6);
          ch4 = convertedAmount * 34.2 * 3 * Math.pow(10, -6) * 21;
          n2o = convertedAmount * 34.2 * 0.6 * Math.pow(10, -6) * 310;
        } else {
          // 상업공공, 가정기타: CH₄ 배출계수 10
          co2 = convertedAmount * 30.4 * 69300 * 1.0 * Math.pow(10, -6);
          ch4 = convertedAmount * 34.2 * 10 * Math.pow(10, -6) * 21;
          n2o = convertedAmount * 34.2 * 0.6 * Math.pow(10, -6) * 310;
        }
        const total = co2 + ch4 + n2o;

        calculations.push({
          fuel: "휘발유",
          amount: allInputs.liquidFuel.gasoline.amount,
          result: total,
          formula: (
            <div className="leading-relaxed">
              <span className="text-gray-500">CO₂:</span> ({formatNumber(convertedAmount)}*30.4*69,300*1.0*10⁻⁶*1) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">CH₄:</span> ({formatNumber(convertedAmount)}*34.2*{allInputs.industry === 'energy' || allInputs.industry === 'manufacturing' ? '3' : '10'}*10⁻⁶*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">N₂O:</span> ({formatNumber(convertedAmount)}*34.2*0.6*10⁻⁶*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
            </div>
          ),
        });
      }

      return (
        <div className="space-y-3">
          {calculations.map((calc, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-[8px] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {calc.fuel} ({calc.amount.toLocaleString()} L)
                </span>
                <span className="text-sm font-bold text-[#3BC184]">
                  {calc.result.toFixed(2)} tCO₂e
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono">
                <span className="text-[#3BC184] font-semibold">
                  {calc.result.toFixed(2)} tCO₂e
                </span> = <br/>
                {calc.formula}
              </div>
            </div>
          ))}
          {calculations.length > 1 && (
            <div className="bg-[rgba(243,244,246,1)] border border-gray-200 rounded-[8px] p-4 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  총 배출량
                </span>
                <span className="text-base font-bold text-[#3BC184]">
                  {getActualEmissions().toFixed(2)} tCO₂e
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 차량이용 계산과정 표시
    if (section === "vehicle" && fuelData?.vehicle) {
      const { gasoline, diesel, lpg } = fuelData.vehicle;
      let calculations: Array<{
        fuel: string;
        amount: number;
        result: number;
        formula: React.ReactNode;
        inputType: "volume" | "cost";
      }> = [];

      if (gasoline.amount > 0) {
        const convertedAmount = gasoline.amount / 1000; // L -> KL
        const co2 = convertedAmount * 30.4 * 69300 * 1.0 * Math.pow(10, -6);
        const ch4 = convertedAmount * 30.4 * 25 * Math.pow(10, -6) * 21;
        const n2o = convertedAmount * 30.4 * 8 * Math.pow(10, -6) * 310;
        const total = co2 + ch4 + n2o;

        calculations.push({
          fuel: "휘발유",
          amount: gasoline.amount,
          result: total,
          inputType: gasoline.inputType,
          formula: (
            <div className="leading-relaxed">
              <span className="text-gray-500">CO₂:</span> ({formatNumber(convertedAmount)}*30.4*69,300*1.0*10⁻⁶*1) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">CH₄:</span> ({formatNumber(convertedAmount)}*30.4*25*10⁻⁶*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">N₂O:</span> ({formatNumber(convertedAmount)}*30.4*8*10⁻⁶*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
            </div>
          ),
        });
      }

      if (diesel.amount > 0) {
        const convertedAmount = diesel.amount / 1000; // L -> KL
        const co2 = convertedAmount * 35.2 * 74100 * 1.0 * Math.pow(10, -6);
        const ch4 = convertedAmount * 35.2 * 3.9 * Math.pow(10, -6) * 21;
        const n2o = convertedAmount * 35.2 * 3.9 * Math.pow(10, -6) * 310;
        const total = co2 + ch4 + n2o;

        calculations.push({
          fuel: "경유",
          amount: diesel.amount,
          result: total,
          inputType: diesel.inputType,
          formula: (
            <div className="leading-relaxed">
              <span className="text-gray-500">CO₂:</span> ({formatNumber(convertedAmount)}*35.2*74,100*1.0*10⁻⁶*1) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">CH₄:</span> ({formatNumber(convertedAmount)}*35.2*3.9*10⁻⁶*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">N₂O:</span> ({formatNumber(convertedAmount)}*35.2*3.9*10⁻⁶*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
            </div>
          ),
        });
      }

      if (lpg.amount > 0) {
        const convertedAmount = lpg.amount / 1000; // L -> KL
        const co2 = convertedAmount * 45.7 * 63100 * 1.0 * Math.pow(10, -6);
        const ch4 = convertedAmount * 45.7 * 62 * Math.pow(10, -6) * 21;
        const n2o = convertedAmount * 45.7 * 0.2 * Math.pow(10, -6) * 310;
        const total = co2 + ch4 + n2o;

        calculations.push({
          fuel: "LPG",
          amount: lpg.amount,
          result: total,
          inputType: lpg.inputType,
          formula: (
            <div className="leading-relaxed">
              <span className="text-gray-500">CO₂:</span> ({formatNumber(convertedAmount)}*45.7*63,100*1.0*10⁻⁶*1) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">CH₄:</span> ({formatNumber(convertedAmount)}*45.7*62*10⁻⁶*21) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
              <span className="text-gray-500">N₂O:</span> ({formatNumber(convertedAmount)}*45.7*0.2*10⁻⁶*310) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
            </div>
          ),
        });
      }

      return (
        <div className="space-y-3">
          {calculations.map((calc, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-[8px] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {calc.fuel}
                </span>
                <span className="text-sm font-bold text-[#3BC184]">
                  {calc.result.toFixed(2)} tCO₂e
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono">
                <div className="mb-2">
                  <span className="text-gray-500">입력값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(calc.amount)}</span> {calc.inputType === "cost" ? "원" : "L"}<br/>
                  <span className="text-gray-500">변환값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(calc.amount / 1000)}</span> KL<br/>
                </div>
                <span className="text-[#3BC184] font-semibold">
                  {calc.result.toFixed(2)} tCO₂e
                </span> = <br/>
                {calc.formula}
              </div>
            </div>
          ))}
          {calculations.length > 1 && (
            <div className="bg-[rgba(243,244,246,1)] border border-gray-200 rounded-[8px] p-4 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  총 배출량
                </span>
                <span className="text-base font-bold text-[#3BC184]">
                  {getActualEmissions().toFixed(2)} tCO₂e
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 열(스팀) 계산과정 표시
    if (section === "districtHeating" && allInputs) {
      // 단위를 TJ로 변환
      let amountInTJ: number;
      if (allInputs.districtHeating.unit === 'MWh') {
        amountInTJ = allInputs.districtHeating.amount * 0.0036; // 1MWh = 0.0036 TJ
      } else if (allInputs.districtHeating.unit === 'MJ') {
        amountInTJ = allInputs.districtHeating.amount * 0.000001; // 1MJ = 0.000001 TJ
      } else {
        amountInTJ = allInputs.districtHeating.amount * 0.0000041868; // 1Mcal = 0.0000041868 TJ
      }

      // 업체별 배출계수 및 계산
      let co2Factor: number, ch4Factor: number, n2oFactor: number;
      let providerName: string;

      switch (allInputs.districtHeating.provider) {
        case 'sudogwon':
          co2Factor = 35058; ch4Factor = 0.634; n2oFactor = 0.064; providerName = '수도권지사';
          break;
        case 'pyeongtaek':
          co2Factor = 15717; ch4Factor = 0.3793; n2oFactor = 0.0301; providerName = '평택지사';
          break;
        case 'cheongju':
          co2Factor = 56642; ch4Factor = 1.4574; n2oFactor = 0.2295; providerName = '청주지사';
          break;
        case 'sejong':
          co2Factor = 42672; ch4Factor = 0.7667; n2oFactor = 0.0767; providerName = '세종지사';
          break;
        case 'daegu':
          co2Factor = 48249; ch4Factor = 2.5138; n2oFactor = 0.3705; providerName = '대구지사';
          break;
        case 'yangsan':
          co2Factor = 35444; ch4Factor = 0.6346; n2oFactor = 0.0635; providerName = '양산지사';
          break;
        case 'gimhae':
          co2Factor = 35747; ch4Factor = 0.6372; n2oFactor = 0.0637; providerName = '김해지사';
          break;
        case 'gwangju':
          co2Factor = 34068; ch4Factor = 16.9847; n2oFactor = 2.2506; providerName = '광주지사';
          break;
        case 'national':
          co2Factor = 59510; ch4Factor = 1.832; n2oFactor = 0.44; providerName = '국가평균';
          break;
        case 'others':
          // 기타(배출계수 직접 입력)
          if (allInputs.districtHeating.customEmissionFactors) {
            co2Factor = allInputs.districtHeating.customEmissionFactors.co2;
            ch4Factor = allInputs.districtHeating.customEmissionFactors.ch4;
            n2oFactor = allInputs.districtHeating.customEmissionFactors.n2o;
            providerName = '기타업체(직접입력)';
          } else {
            // 기본값 사용 (이 경우는 발생하지 않아야 함)
            co2Factor = 0; ch4Factor = 0; n2oFactor = 0; providerName = '기타업체';
          }
          break;
        default:
          co2Factor = 0; ch4Factor = 0; n2oFactor = 0; providerName = '알수없음';
      }

      // 온실가스별 계산
      const co2 = (amountInTJ * co2Factor * 1) / 1000;
      const ch4 = (amountInTJ * ch4Factor * 21) / 1000;
      const n2o = (amountInTJ * n2oFactor * 310) / 1000;
      const total = co2 + ch4 + n2o;

      return (
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-[8px] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                열(스팀) - {providerName}
              </span>
              <span className="text-sm font-bold text-[#3BC184]">
                {getActualEmissions().toFixed(2)} tCO₂e
              </span>
            </div>
            <div className="text-xs text-gray-600 font-mono leading-relaxed">
              <div className="mb-2">
                <span className="text-gray-500">입력값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(allInputs.districtHeating.amount)}</span> {allInputs.districtHeating.unit}<br/>
                <span className="text-gray-500">변환값:</span> <span className="font-semibold text-[#3BC184]">{formatNumber(amountInTJ, 6)}</span> TJ
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-[#3BC184] font-semibold">{getActualEmissions().toFixed(2)} tCO₂e</span> = <br/>
                </div>
                <div>
                  <span className="text-gray-500">CO₂:</span> (({formatNumber(amountInTJ, 6)}*{co2Factor.toLocaleString()}*1*1) ÷ 1000) = <span className="text-[#3BC184] font-semibold">{co2.toFixed(3)}</span> +<br/>
                </div>
                <div>
                  <span className="text-gray-500">CH₄:</span> (({formatNumber(amountInTJ, 6)}*{ch4Factor}*21) ÷ 1000) = <span className="text-[#3BC184] font-semibold">{ch4.toFixed(3)}</span> +<br/>
                </div>
                <div>
                  <span className="text-gray-500">N₂O:</span> (({formatNumber(amountInTJ, 6)}*{n2oFactor}*310) ÷ 1000) = <span className="text-[#3BC184] font-semibold">{n2o.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {allInputs.districtHeating.provider === 'others' && allInputs.districtHeating.customEmissionFactors && (
            <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-3">
              <div className="text-xs text-blue-800">
                <div className="font-semibold mb-1">사용된 배출계수 (직접입력):</div>
                <div>• CO₂: {co2Factor} kgCO₂/TJ</div>
                <div>• CH₄: {ch4Factor} kgCH₄/TJ</div>
                <div>• N₂O: {n2oFactor} kgN₂O/TJ</div>
              </div>
            </div>
          )}
          
          {allInputs.districtHeating.provider !== 'others' && (
            <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-3">
              <div className="text-xs text-gray-700">
                <div className="font-semibold mb-1">사용된 배출계수 ({providerName}):</div>
                <div>• CO₂: {co2Factor.toLocaleString()} kgCO₂/TJ</div>
                <div>• CH₄: {ch4Factor} kgCH₄/TJ × 21 (GWP)</div>
                <div>• N₂O: {n2oFactor} kgN₂O/TJ × 310 (GWP)</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 기타 섹션들 (단순 계산 결과만 표시)
    const convertedInput = getConvertedInputValue();
    return (
      <div className="bg-white border border-gray-200 rounded-[8px] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            배출량 계산
          </span>
          <span className="text-sm font-bold text-[#3BC184]">
            {getActualEmissions().toFixed(2)} tCO₂e
          </span>
        </div>
        <div className="text-xs text-gray-600">
          입력값: <span className="font-semibold text-[#3BC184]">{formatNumber(inputValue)}</span> {unit}<br/>
          {convertedInput !== inputValue && (
            <>변환값: <span className="font-semibold text-[#3BC184]">{formatNumber(convertedInput)}</span> {section === "cityGas" ? "천m³" : section === "districtHeating" ? "TJ" : unit}<br/></>
          )}
          결과: <span className="font-semibold text-[#3BC184]">{getActualEmissions().toFixed(3)}</span> tCO₂e
        </div>
      </div>
    );
  };

  const sourceInfo = getSourceInfo(section);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {getSectionTitle(section)} 계산과정
          </DialogTitle>
          <DialogDescription className="text-sm text-transparent opacity-0 hidden">
            {getSectionTitle(section)} 섹션의 탄소 배출량 계산 과정과 사용된 산정 방법을 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 출처 정보 */}
          <div className="space-y-2">
            <div className="text-[12px] text-gray-600 space-y-1">
              <div className="font-medium">{sourceInfo.title}</div>
              <div>- {sourceInfo.method}</div>
              <div>- {sourceInfo.emissionFactor}</div>
            </div>
          </div>

          {/* 사용한 산정방법 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 text-[14px]">사용한 산정방법</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {getCalculationMethod(section)}
            </div>
          </div>

          {/* 계산과정 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 text-[14px]">계산과정</h3>
            <div className="space-y-3">
              {renderCalculationProcess(section)}
            </div>
          </div>

          {/* 지구온난화지수(GWP) */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 text-[14px]">지구온난화지수(GWP)</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-[13px] text-blue-800 space-y-1">
                <div>• CO₂: 1</div>
                <div>• CH₄: 21</div>
                <div>• N₂O: 310</div>
                <div className="text-[12px] text-gray-600 mt-2">출처: IPCC 2차 평가보고서</div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}