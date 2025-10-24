import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { CircleAlert } from "lucide-react";
import {
  CalculationInputs,
  IndustryType,
  calculateTotalEmissions,
  ElectricityResult,
  SectionResult,
} from "../utils/calculations";
import { handleNumberKeyDown } from "../utils/formHelpers";
import { CalculationModal } from "./CalculationModal";
import { ElectricitySection } from "./sections/ElectricitySection";
import { DistrictHeatingSection } from "./sections/DistrictHeatingSection";
import { GasFuelSection } from "./sections/GasFuelSection";
import { LiquidFuelSection } from "./sections/LiquidFuelSection";
import { VehicleSection } from "./sections/VehicleSection";
import { ElectricVehicleSection } from "./sections/ElectricVehicleSection";

import {
  MaterialSymbolsModeHeatOutlineRounded,
  PhFactory,
  CarSimple,
} from "./icons/SectionIcons";

interface InputFormProps {
  showResults: boolean;
  inputs: CalculationInputs;
  setInputs: React.Dispatch<
    React.SetStateAction<CalculationInputs>
  >;
  onCalculate: () => void;
  onReset: () => void;
  onResultsChange?: (results: any) => void;
}

export function InputForm({
  showResults,
  inputs,
  setInputs,
  onCalculate,
  onReset,
  onResultsChange,
}: InputFormProps) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    section:
      | "electricity"
      | "cityGas"
      | "gasFuel"
      | "liquidFuel"
      | "districtHeating"
      | "vehicle"
      | "electricVehicle"
      | null;
  }>({
    isOpen: false,
    section: null,
  });
  const [
    renewableExceededWarning,
    setRenewableExceededWarning,
  ] = useState(false);
  const [results, setResults] = useState<{
    electricity: ElectricityResult | null;
    districtHeating: SectionResult | null;
    cityGas: SectionResult | null;
    propane: SectionResult | null;
    liquidFuel: SectionResult | null;
    vehicle: SectionResult | null;
    electricVehicle: SectionResult | null;
    totals: any;
  }>({
    electricity: null,
    districtHeating: null,
    cityGas: null,
    propane: null,
    liquidFuel: null,
    vehicle: null,
    electricVehicle: null,
    totals: null,
  });

  // 실시간 계산 - 산업군이 선택되고 입력값이 있을 때만 계산
  useEffect(() => {
    if (inputs.industry) {
      try {
        const result = calculateTotalEmissions(inputs);
        const newResults = {
          electricity: result.electricity,
          districtHeating: result.districtHeating,
          cityGas: result.cityGas,
          propane: result.propane,
          liquidFuel: result.liquidFuel,
          vehicle: result.vehicle,
          electricVehicle: result.electricVehicle,
          totals: result.totals,
        };
        setResults(newResults);
        // 결과가 유효할 때만 부모에게 전달
        if (result.totals) {
          onResultsChange?.(newResults);
        }
      } catch (error) {
        console.error("계산 오류:", error);
        // 계산 오류 시 결과 초기화
        const emptyResults = {
          electricity: null,
          districtHeating: null,
          cityGas: null,
          propane: null,
                liquidFuel: null,
          vehicle: null,
          electricVehicle: null,
          totals: null,
        };
        setResults(emptyResults);
        onResultsChange?.(emptyResults);
      }
    } else {
      // 산업군이 선택되지 않았을 때 결과 초기화
      const emptyResults = {
        electricity: null,
        districtHeating: null,
        cityGas: null,
        propane: null,
            liquidFuel: null,
        vehicle: null,
        electricVehicle: null,
        totals: null,
      };
      setResults(emptyResults);
      onResultsChange?.(emptyResults);
    }
  }, [inputs, onResultsChange]);

  const updateInput = (
    section: keyof CalculationInputs | string,
    field: string,
    value: any,
  ) => {
    if (section === "industry") {
      setInputs((prev) => ({
        ...prev,
        industry: value,
      }));
    } else if (section === "liquidFuel") {
      // 액체연료 섹션을 위한 특별 처리
      const [fuelType, subField] = field.split(".");
      setInputs((prev) => ({
        ...prev,
        liquidFuel: {
          ...prev.liquidFuel,
          [fuelType]: {
            ...prev.liquidFuel[fuelType as keyof typeof prev.liquidFuel],
            [subField]: value,
          },
        },
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [section]: {
          ...prev[section as keyof CalculationInputs],
          [field]: value,
        },
      }));

      // 재생에너지 토글 변경 시 기존 입력값 초기화
      if (
        section === "electricity" &&
        field === "hasRenewable"
      ) {
        setInputs((prev) => ({
          ...prev,
          electricity: {
            ...prev.electricity,
            hasRenewable: value,
            total: 0,
            renewable: 0,
            conventional: 0,
          },
        }));
        return; // 조기 반환으로 아래 로직 실행 방지
      }
    }
  };

  const handleRenewableChange = (value: number) => {
    if (value < 0) return;
    setRenewableExceededWarning(false);
    updateInput("electricity", "renewable", value);
  };

  const handleConventionalChange = (value: number) => {
    if (value < 0) return;
    updateInput("electricity", "conventional", value);
  };

  const isRenewableExceeded = false; // 더 이상 필요하지 않음

  const totalElectricity = inputs.electricity.hasRenewable
    ? (inputs.electricity.renewable || 0) +
      (inputs.electricity.conventional || 0)
    : inputs.electricity.total;

  const openModal = (
    section:
      | "electricity"
      | "cityGas"
      | "gasFuel"
      | "liquidFuel"
      | "districtHeating"
      | "vehicle"
      | "electricVehicle",
  ) => {
    setModalState({ isOpen: true, section });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, section: null });
  };

  // 섹션 헤더 컴포넌트
  const SectionHeader = ({
    children,
    icon,
    gap = "gap-2",
  }: {
    children: React.ReactNode;
    icon: React.ReactNode;
    gap?: string;
  }) => (
    <div className={`flex items-center ${gap} mb-6`}>
      {icon}
      <span className="text-[15px] font-bold text-gray-700">
        {children}
      </span>
    </div>
  );

  return (
    <div className="bg-white px-[24px] py-[40px]">
      <div className="mx-auto" style={{width: '94%', marginTop: '40px', marginBottom: '40px'}}>
        {/* 산업군 선택 */}
        <div className="mb-[64px] mt-[0px] mr-[0px] ml-[0px]">
          <div className="flex items-center gap-2 m-[0px] p-[0px]">
            <Select
              value={inputs.industry}
              onValueChange={(value: IndustryType) =>
                updateInput("industry", "", value)
              }
            >
              <SelectTrigger
                className={`w-full max-w-[250px] bg-white border border-gray-300 rounded-md px-3 py-2 transition-all text-[13px] ${!inputs.industry ? "border-red-300" : ""}`}
              >
                <SelectValue placeholder="산업군을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="energy"
                  className="text-[13px]"
                >
                  에너지산업
                </SelectItem>
                <SelectItem
                  value="manufacturing"
                  className="text-[13px]"
                >
                  제조업/건설업
                </SelectItem>
                <SelectItem
                  value="commercial"
                  className="text-[13px]"
                >
                  상업/공공
                </SelectItem>
                <SelectItem
                  value="residential"
                  className="text-[13px]"
                >
                  가정/기타
                </SelectItem>
              </SelectContent>
            </Select>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center justify-center">
                    <CircleAlert className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-96 p-6 bg-white border border-gray-200 shadow-lg rounded-lg"
                  side="bottom"
                  align="start"
                >
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900">
                      <a
                        href="http://kssc.kostat.go.kr/ksscNew_web/kssc/common/ClassificationContent.do?gubun=1&strCategoryNameCode=001&categoryMenu=007&addGubun=no"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3BC184] hover:text-[#2da570] underline"
                      >
                        한국표준산업분류 코드
                      </a>
                      {" "}기준
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 text-xs leading-relaxed">
                        • 에너지 산업:
                      </p>
                      <p className="text-xs text-gray-600 ml-2 leading-relaxed">
                        중분류 코드 35 인 사업장
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs leading-relaxed">
                        • 제조업ㆍ건설업:
                      </p>
                      <p className="text-xs text-gray-600 ml-2 leading-relaxed">
                        중분류 코드 05∼08, 10∼33, 38, 41∼42,
                        58∼59 인 사업장
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs leading-relaxed">
                        • 상업ㆍ공공:
                      </p>
                      <p className="text-xs text-gray-600 ml-2 leading-relaxed">
                        중분류 코드 36∼37, 38, 39, 45∼47,
                        49∼52, 55∼56, 58∼59, 60∼66, 68∼75,
                        84∼87, 90∼91, 94∼97, 99 인 사업장
                      </p>
                    </div>
                    <div className="pb-3">
                      <p className="font-medium text-gray-900 text-xs leading-relaxed">
                        • 가정ㆍ기타:
                      </p>
                      <p className="text-xs text-gray-600 ml-2 leading-relaxed">
                        01∼03, 98 인 사업장
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      * 폐기물 수집운반, 처리 및
                      원료재생업(38)에서 세분류로 분류되는
                      금속 및 비금속 원료 해체, 선별 및
                      재생업(383)은 제조업ㆍ건설업으로 적용
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      * 출판업(58)에서 세분류로 분류되는
                      시스템ㆍ응용 소프트웨어 개발 및
                      공급업(5821)은 상업ㆍ공공으로 적용
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      * 영상ㆍ오디오 기록물 제작 및
                      배급업(59)에서 세분류로 분류되는 영화,
                      비디오물 및 방송프로그램 제작 관련
                      서비스업(5912)은 상업ㆍ공공으로 적용
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!inputs.industry && (
            <p className="text-xs text-red-500 mt-[4px] text-[11px] px-[4px] py-[0px] mr-[0px] mb-[0px] ml-[0px]">
              산업군을 먼저 선택해주세요.
            </p>
          )}


        </div>

        {/* 전기/열 이용 섹션 */}
        <section
          id="electricity"
          className={`transition-opacity duration-300 ${
            !inputs.industry
              ? "opacity-55 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <SectionHeader
            icon={<MaterialSymbolsModeHeatOutlineRounded />}
            gap="gap-[7px]"
          >
            전기 및 열 이용
          </SectionHeader>
          <div className="space-y-8 px-[4px] py-[0px] m-[0px]">
                <ElectricitySection
                  inputs={inputs}
                  results={results.electricity}
                  showResults={showResults}
                  isRenewableExceeded={isRenewableExceeded}
                  totalElectricity={totalElectricity}
                  updateInput={updateInput}
                  handleRenewableChange={handleRenewableChange}
                  handleConventionalChange={
                    handleConventionalChange
                  }
                  openModal={openModal}
                  disabled={!inputs.industry}
                />

                <DistrictHeatingSection
                  inputs={inputs}
                  results={results.districtHeating}
                  showResults={showResults}
                  updateInput={updateInput}
                  openModal={openModal}
                  disabled={!inputs.industry}
                />
          </div>
        </section>

        {/* 구분선 */}
        <div className="border-t border-gray-100 my-[80px] mx-[0px]"></div>

        {/* 설비 이용 섹션 */}
        <section
          id="equipment"
          className={`transition-opacity duration-300 ${
            !inputs.industry
              ? "opacity-55 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <SectionHeader
            icon={<PhFactory />}
            gap="gap-[9px]"
          >
            설비 이용
          </SectionHeader>
          <div className="space-y-8 px-[4px] py-[0px]">
                <GasFuelSection
                  inputs={inputs}
                  results={results}
                  showResults={showResults}
                  updateInput={updateInput}
                  openModal={openModal}
                  disabled={!inputs.industry}
                />

                <LiquidFuelSection
                  inputs={inputs}
                  results={results.liquidFuel}
                  showResults={showResults}
                  updateInput={updateInput}
                  openModal={openModal}
                  disabled={!inputs.industry}
                />
          </div>
        </section>

        {/* 구분선 */}
        <div className="border-t border-gray-100 my-[80px] mx-[0px]"></div>

        {/* 차량 이용 섹션 */}
        <section
          id="vehicle"
          className={`transition-opacity duration-300 ${
            !inputs.industry
              ? "opacity-55 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <SectionHeader icon={<CarSimple />} gap="gap-3.5">
            차량 이용
          </SectionHeader>
          <div className="space-y-8 px-[4px] py-[0px] p-[4px]">
                <div className="space-y-3">
                  <h3 className="text-[#4B5563] text-[14px] font-bold">
                    내연기관차
                  </h3>
                  <VehicleSection
                    inputs={inputs}
                    results={results.vehicle}
                    showResults={showResults}
                    updateInput={updateInput}
                    setInputs={setInputs}
                    openModal={openModal}
                    disabled={!inputs.industry}
                  />
                </div>

                <ElectricVehicleSection
                  inputs={inputs}
                  results={results.electricVehicle}
                  showResults={showResults}
                  updateInput={updateInput}
                  setInputs={setInputs}
                  openModal={openModal}
                  disabled={!inputs.industry}
                />
          </div>
        </section>

        <div className="pb-6">
            {modalState.section && (
            <CalculationModal
              isOpen={modalState.isOpen}
              onClose={closeModal}
              section={modalState.section}
              allInputs={inputs}
              inputValue={
                modalState.section === "electricity"
                  ? totalElectricity
                  : modalState.section === "districtHeating"
                  ? inputs.districtHeating.amount
                  : modalState.section === "cityGas"
                  ? inputs.cityGas.amount
                  : modalState.section === "gasFuel"
                  ? inputs.cityGas.amount + inputs.propane.amount
                  : modalState.section === "liquidFuel"
                  ? inputs.liquidFuel.diesel.amount + inputs.liquidFuel.kerosene.amount + inputs.liquidFuel.gasoline.amount
                  : modalState.section === "vehicle"
                  ? inputs.vehicle.fuels.gasoline.amount + inputs.vehicle.fuels.diesel.amount + inputs.vehicle.fuels.lpg.amount
                  : modalState.section === "electricVehicle"
                  ? inputs.electricVehicle.inputType === "cost" ? inputs.electricVehicle.cost || 0 : inputs.electricVehicle.amount || 0
                  : 0
              }
              resultValue={
                modalState.section === "electricity"
                  ? results.electricity?.market || 0
                  : modalState.section === "districtHeating"
                  ? results.districtHeating?.emissions || 0
                  : modalState.section === "cityGas"
                  ? results.cityGas?.emissions || 0
                  : modalState.section === "gasFuel"
                  ? (results.cityGas?.emissions || 0) + (results.propane?.emissions || 0)
                  : modalState.section === "liquidFuel"
                  ? results.liquidFuel?.emissions || 0
                  : modalState.section === "vehicle"
                  ? results.vehicle?.emissions || 0
                  : modalState.section === "electricVehicle"
                  ? results.electricVehicle?.emissions || 0
                  : 0
              }
              unit={
                modalState.section === "electricity"
                  ? inputs.electricity.unit
                  : modalState.section === "districtHeating"
                  ? inputs.districtHeating.unit
                  : modalState.section === "cityGas"
                  ? "Nm³"
                  : modalState.section === "gasFuel"
                  ? "혼합"
                  : modalState.section === "liquidFuel"
                  ? "L"
                  : modalState.section === "vehicle"
                  ? "L"
                  : modalState.section === "electricVehicle"
                  ? inputs.electricVehicle.inputType === "cost" ? "원" : inputs.electricVehicle.unit || "kWh"
                  : ""
              }
              industry={inputs.industry as string}
              provider={modalState.section === "districtHeating" ? inputs.districtHeating.provider : ""}
              electricityData={
                modalState.section === "electricity"
                  ? {
                      hasRenewable: inputs.electricity.hasRenewable,
                      renewableUsage: inputs.electricity.renewable || 0,
                      conventionalUsage: inputs.electricity.conventional || 0,
                      totalUsage: totalElectricity,
                      locationResult: results.electricity?.location || 0,
                      marketResult: results.electricity?.market || 0,
                    }
                  : undefined
              }
              fuelData={
                modalState.section === "gasFuel"
                  ? {
                      gasFuel: {
                        cityGas: {
                          amount: inputs.cityGas.amount,
                          emissions: results.cityGas?.emissions || 0,
                        },
                        propane: {
                          amount: inputs.propane.amount,
                          emissions: results.propane?.emissions || 0,
                        },
                      },
                    }
                  : modalState.section === "liquidFuel"
                  ? {
                      liquidFuel: {
                        diesel: {
                          amount: inputs.liquidFuel.diesel.amount,
                          emissions: results.liquidFuel?.emissions || 0,
                        },
                        kerosene: {
                          amount: inputs.liquidFuel.kerosene.amount,
                          emissions: 0, // 개별 연료 배출량은 별도 계산 필요
                        },
                        gasoline: {
                          amount: inputs.liquidFuel.gasoline.amount,
                          emissions: 0, // 개별 연료 배출량은 별도 계산 필요
                        },
                      },
                    }
                  : modalState.section === "vehicle"
                  ? {
                      vehicle: {
                        gasoline: {
                          amount: inputs.vehicle.inputType === "cost" 
                            ? inputs.vehicle.fuels.gasoline.cost / 1646.71  // 비용을 사용량으로 변환
                            : inputs.vehicle.fuels.gasoline.amount,
                          emissions: 0, // 개별 연료 배출량은 별도 계산 필요
                          inputType: inputs.vehicle.inputType,
                        },
                        diesel: {
                          amount: inputs.vehicle.inputType === "cost" 
                            ? inputs.vehicle.fuels.diesel.cost / 1502.69  // 비용을 사용량으로 변환
                            : inputs.vehicle.fuels.diesel.amount,
                          emissions: 0, // 개별 연료 배출량은 별도 계산 필요
                          inputType: inputs.vehicle.inputType,
                        },
                        lpg: {
                          amount: inputs.vehicle.inputType === "cost" 
                            ? inputs.vehicle.fuels.lpg.cost / 995.25  // 비용을 사용량으로 변환
                            : inputs.vehicle.fuels.lpg.amount,
                          emissions: 0, // 개별 연료 배출량은 별도 계산 필요
                          inputType: inputs.vehicle.inputType,
                        },
                        inputType: inputs.vehicle.inputType,
                      },
                    }
                  : {}
              }
            />
            )}
        </div>
      </div>
    </div>
  );
}