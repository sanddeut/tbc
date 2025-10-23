import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { CalculationInputs, SectionResult } from "../../utils/calculations";
import { handleNumberKeyDown } from "../../utils/formHelpers";

interface VehicleSectionProps {
  inputs: CalculationInputs;
  results: SectionResult | null;
  showResults: boolean;
  updateInput: (section: keyof CalculationInputs, field: string, value: any) => void;
  setInputs: React.Dispatch<React.SetStateAction<CalculationInputs>>;
  openModal: (section: "electricity" | "cityGas" | "oilBoiler" | "districtHeating" | "vehicle") => void;
  disabled?: boolean;
}

export function VehicleSection({
  inputs,
  results,
  showResults,
  updateInput,
  setInputs,
  openModal
}: VehicleSectionProps) {
  return (
    <div className="bg-white rounded-[8px] border border-[#e5e5e5] overflow-hidden">
      <div className="p-6 space-y-6 bg-[#F9FAFB]">
        <div className="flex items-start gap-3">
            <Switch
              id="cost-input-toggle"
              checked={inputs.vehicle.inputType === "cost"}
              onCheckedChange={(checked) => {
                const newInputType = checked ? "cost" : "volume";
                setInputs(prev => ({
                  ...prev,
                  vehicle: {
                    ...prev.vehicle,
                    inputType: newInputType,
                    fuels: {
                      gasoline: { amount: 0, cost: 0 },
                      diesel: { amount: 0, cost: 0 },
                      lpg: { amount: 0, cost: 0 }
                    }
                  }
                }));
              }}
              className="data-[state=checked]:bg-[#3BC184] data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-200 mt-0.5"
            />
            <Label htmlFor="cost-input-toggle" className="text-[13px] font-normal cursor-pointer">
              비용으로 입력
            </Label>
        </div>

        <div className="space-y-4">
            {/* 휘발유 */}
            <div className="space-y-2">
              <Label htmlFor={`vehicle-gasoline-${inputs.vehicle.inputType}`} className="text-[13px]">
                휘발유 {inputs.vehicle.inputType === "volume" ? "사용량" : "비용"}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id={`vehicle-gasoline-${inputs.vehicle.inputType}`}
                  type="number"
                  min="0"
                  placeholder={`휘발유 ${inputs.vehicle.inputType === "volume" ? "사용량" : "비용"}을 입력하세요`}
                  className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                  value={
                    inputs.vehicle.inputType === "volume"
                      ? inputs.vehicle.fuels.gasoline.amount || ""
                      : inputs.vehicle.fuels.gasoline.cost || ""
                  }
                  onKeyDown={handleNumberKeyDown}
                  onWheel={(e) => e.currentTarget.blur()}
                  onInput={(e) => {
                    const value = Number(e.currentTarget.value);
                    if (value < 0) e.currentTarget.value = "0";
                  }}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    if (inputs.vehicle.inputType === "volume") {
                      setInputs(prev => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          fuels: {
                            ...prev.vehicle.fuels,
                            gasoline: {
                              ...prev.vehicle.fuels.gasoline,
                              amount: value
                            }
                          }
                        }
                      }));
                    } else {
                      setInputs(prev => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          fuels: {
                            ...prev.vehicle.fuels,
                            gasoline: {
                              ...prev.vehicle.fuels.gasoline,
                              cost: value
                            }
                          }
                        }
                      }));
                    }
                  }}
                />
                <span className="text-[13px] text-gray-600 min-w-[40px]">
                  {inputs.vehicle.inputType === "volume" ? "L" : "원"}
                </span>
              </div>
            </div>

            {/* 경유 */}
            <div className="space-y-2">
              <Label htmlFor={`vehicle-diesel-${inputs.vehicle.inputType}`} className="text-[13px]">
                경유 {inputs.vehicle.inputType === "volume" ? "사용량" : "비용"}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id={`vehicle-diesel-${inputs.vehicle.inputType}`}
                  type="number"
                  min="0"
                  placeholder={`경유 ${inputs.vehicle.inputType === "volume" ? "사용량" : "비용"}을 입력하세요`}
                  className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                  value={
                    inputs.vehicle.inputType === "volume"
                      ? inputs.vehicle.fuels.diesel.amount || ""
                      : inputs.vehicle.fuels.diesel.cost || ""
                  }
                  onKeyDown={handleNumberKeyDown}
                  onWheel={(e) => e.currentTarget.blur()}
                  onInput={(e) => {
                    const value = Number(e.currentTarget.value);
                    if (value < 0) e.currentTarget.value = "0";
                  }}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    if (inputs.vehicle.inputType === "volume") {
                      setInputs(prev => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          fuels: {
                            ...prev.vehicle.fuels,
                            diesel: {
                              ...prev.vehicle.fuels.diesel,
                              amount: value
                            }
                          }
                        }
                      }));
                    } else {
                      setInputs(prev => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          fuels: {
                            ...prev.vehicle.fuels,
                            diesel: {
                              ...prev.vehicle.fuels.diesel,
                              cost: value
                            }
                          }
                        }
                      }));
                    }
                  }}
                />
                <span className="text-[13px] text-gray-600 min-w-[40px]">
                  {inputs.vehicle.inputType === "volume" ? "L" : "원"}
                </span>
              </div>
            </div>

            {/* LPG */}
            <div className="space-y-2">
              <Label htmlFor={`vehicle-lpg-${inputs.vehicle.inputType}`} className="text-[13px]">
                LPG {inputs.vehicle.inputType === "volume" ? "사용량" : "비용"}
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id={`vehicle-lpg-${inputs.vehicle.inputType}`}
                  type="number"
                  min="0"
                  placeholder={`LPG ${inputs.vehicle.inputType === "volume" ? "사용량" : "비용"}을 입력하세요`}
                  className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                  value={
                    inputs.vehicle.inputType === "volume"
                      ? inputs.vehicle.fuels.lpg.amount || ""
                      : inputs.vehicle.fuels.lpg.cost || ""
                  }
                  onKeyDown={handleNumberKeyDown}
                  onWheel={(e) => e.currentTarget.blur()}
                  onInput={(e) => {
                    const value = Number(e.currentTarget.value);
                    if (value < 0) e.currentTarget.value = "0";
                  }}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value));
                    if (inputs.vehicle.inputType === "volume") {
                      setInputs(prev => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          fuels: {
                            ...prev.vehicle.fuels,
                            lpg: {
                              ...prev.vehicle.fuels.lpg,
                              amount: value
                            }
                          }
                        }
                      }));
                    } else {
                      setInputs(prev => ({
                        ...prev,
                        vehicle: {
                          ...prev.vehicle,
                          fuels: {
                            ...prev.vehicle.fuels,
                            lpg: {
                              ...prev.vehicle.fuels.lpg,
                              cost: value
                            }
                          }
                        }
                      }));
                    }
                  }}
                />
                <span className="text-[13px] text-gray-600 min-w-[40px]">
                  {inputs.vehicle.inputType === "volume" ? "L" : "원"}
                </span>
              </div>
            </div>
        </div>
      </div>

      {showResults &&
        results &&
        ((inputs.vehicle.inputType === "volume" &&
          (inputs.vehicle.fuels.gasoline.amount > 0 ||
           inputs.vehicle.fuels.diesel.amount > 0 ||
           inputs.vehicle.fuels.lpg.amount > 0)) ||
          (inputs.vehicle.inputType === "cost" &&
            (inputs.vehicle.fuels.gasoline.cost > 0 ||
             inputs.vehicle.fuels.diesel.cost > 0 ||
             inputs.vehicle.fuels.lpg.cost > 0))) && (
          <div className="bg-[#F5FFF5] border-t border-[rgba(59,193,132,0.2)] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#111827]">탄소배출량</span>
                <div
                  className="bg-white border border-[#3BC184] rounded-[8px] px-3 py-1 hover:bg-[#F5FFF5] transition-all cursor-pointer"
                  onClick={() => openModal("vehicle")}
                >
                  <span className="text-[13px] text-[#3BC184] font-medium">
                    계산과정
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#111827]">배출량</span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#111827]">
                    {(results?.emissions || 0).toFixed(3)}
                  </span>
                  <span className="text-[13px] text-[#111827]">tCO2e</span>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}