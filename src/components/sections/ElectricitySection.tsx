import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

import {
  CalculationInputs,
  ElectricityResult,
} from "../../utils/calculations";
import { handleNumberKeyDown } from "../../utils/formHelpers";

interface ElectricitySectionProps {
  inputs: CalculationInputs;
  results: ElectricityResult | null;
  showResults: boolean;
  isRenewableExceeded: boolean;
  totalElectricity: number;
  updateInput: (
    section: keyof CalculationInputs,
    field: string,
    value: any,
  ) => void;
  handleRenewableChange: (value: number) => void;
  handleConventionalChange: (value: number) => void;
  openModal: (
    section:
      | "electricity"
      | "cityGas"
      | "gasFuel"
      | "liquidFuel"
      | "districtHeating"
      | "vehicle"
      | "electricVehicle",
  ) => void;
  disabled?: boolean;
}

export function ElectricitySection({
  inputs,
  results,
  showResults,
  isRenewableExceeded,
  totalElectricity,
  updateInput,
  handleRenewableChange,
  handleConventionalChange,
  openModal,
  disabled = false,
}: ElectricitySectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-[#4B5563] text-[14px] font-bold p-[0px]">
          전기
        </h2>
      </div>
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] overflow-hidden">
        <div className="p-6 space-y-8 bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <Switch
              id="renewable-toggle"
              checked={inputs.electricity.hasRenewable}
              disabled={disabled}
              onCheckedChange={(checked) =>
                updateInput(
                  "electricity",
                  "hasRenewable",
                  checked,
                )
              }
              className="data-[state=checked]:bg-[#3BC184] data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-200"
            />
            <Label
              htmlFor="renewable-toggle"
              className="text-[13px] font-normal cursor-pointer"
            >
              재생에너지 사용량 입력{" "}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricity-total" className="text-[13px]">
              총 전기사용량
            </Label>
            <div className="flex items-center gap-3">
              {inputs.electricity.hasRenewable ? (
                // 토글이 켜진 상태: 자동계산 필드
                <>
                  <Input
                    id="electricity-total"
                    type="number"
                    value={totalElectricity}
                    disabled
                    className="flex-1 bg-gray-100 border border-gray-300 cursor-not-allowed rounded-[8px] px-4 py-3 text-[13px] placeholder:text-[13px]"
                    placeholder="재생전기와 일반전기 사용량을 입력하면 자동으로 계산됩니다"
                  />
                  <div className="text-[13px] text-gray-600 min-w-[40px]">
                    {inputs.electricity.unit}
                  </div>
                </>
              ) : (
                // 토글이 꺼진 상태: 입력 필드
                <>
                  <Input
                    id="electricity-total"
                    type="number"
                    min="0"
                    disabled={disabled}
                    placeholder="총 전기사용량을 입력하세요"
                    className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                    value={inputs.electricity.total || ""}
                    onKeyDown={handleNumberKeyDown}
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(e) => {
                      const value = Number(e.currentTarget.value);
                      if (value < 0) e.currentTarget.value = "0";
                    }}
                    onChange={(e) =>
                      updateInput(
                        "electricity",
                        "total",
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                  />
                  <Select
                    value={inputs.electricity.unit}
                    disabled={disabled}
                    onValueChange={(value: "kWh" | "MWh") =>
                      updateInput("electricity", "unit", value)
                    }
                  >
                    <SelectTrigger className="w-20 bg-white border border-gray-200 rounded-[8px] px-3 py-3 transition-all text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kWh" className="text-[13px]">kWh</SelectItem>
                      <SelectItem value="MWh" className="text-[13px]">MWh</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          {inputs.electricity.hasRenewable && (
            <div className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="renewable-amount" className="text-[13px]">
                  재생전기 사용량
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="renewable-amount"
                    type="number"
                    min="0"
                    disabled={disabled}
                    placeholder="재생전기 사용량을 입력하세요"
                    className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px] py-[12px] px-[16px]"
                    value={inputs.electricity.renewable || ""}
                    onKeyDown={handleNumberKeyDown}
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(e) => {
                      const value = Number(e.currentTarget.value);
                      if (value < 0) e.currentTarget.value = "0";
                    }}
                    onChange={(e) =>
                      handleRenewableChange(
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                  />
                  <Select
                    value={inputs.electricity.unit}
                    disabled={disabled}
                    onValueChange={(value: "kWh" | "MWh") =>
                      updateInput("electricity", "unit", value)
                    }
                  >
                    <SelectTrigger className="w-20 bg-white border border-gray-200 rounded-[8px] px-3 py-3 transition-all text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kWh" className="text-[13px]">kWh</SelectItem>
                      <SelectItem value="MWh" className="text-[13px]">MWh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-[11px] text-[#3BC184] px-[4px] py-[0px] m-[0px]">
                  * 태양광 자가발전량의 경우, 일반전기 사용량에서 이미 차감 반영되었다면 재생전기에서는 제외
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conventional-amount" className="text-[13px]">
                  일반전기 사용량
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="conventional-amount"
                    type="number"
                    min="0"
                    disabled={disabled}
                    placeholder="일반전기 사용량을 입력하세요"
                    className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                    value={inputs.electricity.conventional || ""}
                    onKeyDown={handleNumberKeyDown}
                    onWheel={(e) => e.currentTarget.blur()}
                    onInput={(e) => {
                      const value = Number(e.currentTarget.value);
                      if (value < 0) e.currentTarget.value = "0";
                    }}
                    onChange={(e) =>
                      handleConventionalChange(
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                  />
                  <Select
                    value={inputs.electricity.unit}
                    disabled={disabled}
                    onValueChange={(value: "kWh" | "MWh") =>
                      updateInput("electricity", "unit", value)
                    }
                  >
                    <SelectTrigger className="w-20 bg-white border border-gray-200 rounded-[8px] px-3 py-3 transition-all text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kWh" className="text-[13px]">kWh</SelectItem>
                      <SelectItem value="MWh" className="text-[13px]">MWh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}


        </div>

        {showResults &&
          results &&
          (inputs.electricity.hasRenewable 
            ? (inputs.electricity.renewable > 0 || inputs.electricity.conventional > 0)
            : inputs.electricity.total > 0
          ) && (
            <div className="bg-[#F5FFF5] border-t border-[rgba(59,193,132,0.2)] p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#111827]">
                    탄소배출량
                  </span>
                  <div
                    className="bg-white border border-[#3BC184] rounded-[8px] px-3 py-1 hover:bg-[#F5FFF5] transition-all cursor-pointer"
                    onClick={() => openModal("electricity")}
                  >
                    <span className="text-[13px] text-[#3BC184] font-medium">
                      계산과정
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#111827]">
                      지역기반
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#111827]">
                        {results.location}
                      </span>
                      <span className="text-[13px] text-[#111827]">
                        tCO2e
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#111827]">
                      시장기반
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#111827]">
                        {results.market}
                      </span>
                      <span className="text-[13px] text-[#111827]">
                        tCO2e
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}