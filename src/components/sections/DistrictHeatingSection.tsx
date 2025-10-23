import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CalculationInputs,
  SectionResult,
  DistrictHeatingProvider,
} from "../../utils/calculations";
import { handleNumberKeyDown } from "../../utils/formHelpers";

interface DistrictHeatingSectionProps {
  inputs: CalculationInputs;
  results: SectionResult | null;
  showResults: boolean;
  updateInput: (
    section: keyof CalculationInputs,
    field: string,
    value: any,
  ) => void;
  openModal: (
    section:
      | "electricity"
      | "cityGas"
      | "oilBoiler"
      | "districtHeating"
      | "vehicle",
  ) => void;
  disabled?: boolean;
}

export function DistrictHeatingSection({
  inputs,
  results,
  showResults,
  updateInput,
  openModal,
  disabled = false,
}: DistrictHeatingSectionProps) {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-[#4B5563] text-[14px] font-bold">
          열(스팀)
        </h2>
      </div>
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] overflow-hidden">
        <div className="p-6 space-y-6 bg-[#F9FAFB]">
          <div className="space-y-2">
            <Label className="text-[13px]">
              열(스팀) 제공업체
            </Label>
            <Select
              value={inputs.districtHeating.provider}
              disabled={disabled}
              onValueChange={(value: DistrictHeatingProvider) =>
                updateInput(
                  "districtHeating",
                  "provider",
                  value,
                )
              }
            >
              <SelectTrigger className="w-full max-w-xs bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="sudogwon"
                  className="text-[13px]"
                >
                  한국지역난방공사 수도권지사
                </SelectItem>
                <SelectItem
                  value="pyeongtaek"
                  className="text-[13px]"
                >
                  한국지역난방공사 평택지사
                </SelectItem>
                <SelectItem
                  value="cheongju"
                  className="text-[13px]"
                >
                  한국지역난방공사 청주지사
                </SelectItem>
                <SelectItem
                  value="sejong"
                  className="text-[13px]"
                >
                  한국지역난방공사 세종지사
                </SelectItem>
                <SelectItem
                  value="daegu"
                  className="text-[13px]"
                >
                  한국지역난방공사 대구지사
                </SelectItem>
                <SelectItem
                  value="yangsan"
                  className="text-[13px]"
                >
                  한국지역난방공사 양산지사
                </SelectItem>
                <SelectItem
                  value="gimhae"
                  className="text-[13px]"
                >
                  한국지역난방공사 김해지사
                </SelectItem>
                <SelectItem
                  value="gwangju"
                  className="text-[13px]"
                >
                  한국지역난방공사 광주전남지사
                </SelectItem>
                <SelectItem
                  value="national"
                  className="text-[13px]"
                >
                  국가 평균
                </SelectItem>
                <SelectItem
                  value="others"
                  className="text-[13px]"
                >
                  기타(배출계수 직접 입력)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="district-heating"
              className="text-[13px]"
            >
              열(스팀) 사용량
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="district-heating"
                type="number"
                min="0"
                disabled={disabled}
                placeholder="열(스팀) 사용량을 입력하세요"
                className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                value={inputs.districtHeating.amount || ""}
                onKeyDown={handleNumberKeyDown}
                onWheel={(e) => e.currentTarget.blur()}
                onInput={(e) => {
                  const value = Number(e.currentTarget.value);
                  if (value < 0) e.currentTarget.value = "0";
                }}
                onChange={(e) =>
                  updateInput(
                    "districtHeating",
                    "amount",
                    Math.max(0, Number(e.target.value)),
                  )
                }
              />
              <Select
                value={inputs.districtHeating.unit}
                disabled={disabled}
                onValueChange={(value: "Mcal" | "MWh" | "MJ") =>
                  updateInput("districtHeating", "unit", value)
                }
              >
                <SelectTrigger className="w-20 bg-white border border-gray-200 rounded-[8px] px-3 py-3 transition-all text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="Mcal"
                    className="text-[13px]"
                  >
                    Mcal
                  </SelectItem>
                  <SelectItem
                    value="MWh"
                    className="text-[13px]"
                  >
                    MWh
                  </SelectItem>
                  <SelectItem
                    value="MJ"
                    className="text-[13px]"
                  >
                    MJ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {inputs.districtHeating.provider === "others" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="co2-factor"
                    className="text-[13px]"
                  >
                    CO₂ 배출계수
                  </Label>
                  <span className="text-[13px] text-gray-500">
                    (kg/TJ)
                  </span>
                </div>
                <Input
                  id="co2-factor"
                  type="number"
                  min="0"
                  placeholder="CO₂ 배출계수"
                  className="bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                  value={
                    inputs.districtHeating.customEmissionFactors
                      ?.co2 || ""
                  }
                  onKeyDown={handleNumberKeyDown}
                  onWheel={(e) => e.currentTarget.blur()}
                  onInput={(e) => {
                    const value = Number(e.currentTarget.value);
                    if (value < 0) e.currentTarget.value = "0";
                  }}
                  onChange={(e) =>
                    updateInput(
                      "districtHeating",
                      "customEmissionFactors",
                      {
                        ...inputs.districtHeating
                          .customEmissionFactors,
                        co2: Math.max(
                          0,
                          Number(e.target.value),
                        ),
                      },
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="ch4-factor"
                    className="text-[13px]"
                  >
                    CH₄ 배출계수
                  </Label>
                  <span className="text-[13px] text-gray-500">
                    (kg/TJ)
                  </span>
                </div>
                <Input
                  id="ch4-factor"
                  type="number"
                  min="0"
                  placeholder="CH₄ 배출계수"
                  className="bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                  value={
                    inputs.districtHeating.customEmissionFactors
                      ?.ch4 || ""
                  }
                  onKeyDown={handleNumberKeyDown}
                  onWheel={(e) => e.currentTarget.blur()}
                  onInput={(e) => {
                    const value = Number(e.currentTarget.value);
                    if (value < 0) e.currentTarget.value = "0";
                  }}
                  onChange={(e) =>
                    updateInput(
                      "districtHeating",
                      "customEmissionFactors",
                      {
                        ...inputs.districtHeating
                          .customEmissionFactors,
                        ch4: Math.max(
                          0,
                          Number(e.target.value),
                        ),
                      },
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="n2o-factor"
                    className="text-[13px]"
                  >
                    N₂O 배출계수
                  </Label>
                  <span className="text-[13px] text-gray-500">
                    (kg/TJ)
                  </span>
                </div>
                <Input
                  id="n2o-factor"
                  type="number"
                  min="0"
                  placeholder="N₂O 배출계수"
                  className="bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                  value={
                    inputs.districtHeating.customEmissionFactors
                      ?.n2o || ""
                  }
                  onKeyDown={handleNumberKeyDown}
                  onWheel={(e) => e.currentTarget.blur()}
                  onInput={(e) => {
                    const value = Number(e.currentTarget.value);
                    if (value < 0) e.currentTarget.value = "0";
                  }}
                  onChange={(e) =>
                    updateInput(
                      "districtHeating",
                      "customEmissionFactors",
                      {
                        ...inputs.districtHeating
                          .customEmissionFactors,
                        n2o: Math.max(
                          0,
                          Number(e.target.value),
                        ),
                      },
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>

        {showResults &&
          results &&
          inputs.districtHeating.amount > 0 && (
            <div className="bg-[#F5FFF5] border-t border-[rgba(59,193,132,0.2)] p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#111827]">
                    탄소배출량
                  </span>
                  <div
                    className="bg-white border border-[#3BC184] rounded-[8px] px-3 py-1 hover:bg-[#F5FFF5] transition-all cursor-pointer"
                    onClick={() => openModal("districtHeating")}
                  >
                    <span className="text-[13px] text-[#3BC184] font-medium">
                      계산과정
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#111827]">
                    배출량
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#111827]">
                      {results.emissions}
                    </span>
                    <span className="text-[13px] text-[#111827]">
                      tCO2e
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}