import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ElectricVehicleSectionProps {
  inputs: any;
  results: any;
  showResults: boolean;
  updateInput: (section: string, field: string, value: any) => void;
  setInputs: React.Dispatch<React.SetStateAction<any>>;
  openModal: (section: string) => void;
}

export function ElectricVehicleSection({
  inputs,
  results,
  showResults,
  updateInput,
  setInputs,
  openModal,
}: ElectricVehicleSectionProps) {
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[#4B5563] text-[14px] font-bold">전기차</h3>
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] overflow-hidden">
        <div className="p-6 space-y-6 bg-[#F9FAFB]">
          {/* 비용 입력 토글 */}
          <div className="flex items-start gap-3">
            <Switch
              id="electric-vehicle-cost-toggle"
              checked={inputs?.electricVehicle?.inputType === "cost"}
              onCheckedChange={(checked) => {
                const newInputType = checked ? "cost" : "volume";
                setInputs((prev: any) => ({
                  ...prev,
                  electricVehicle: {
                    ...prev.electricVehicle,
                    inputType: newInputType,
                    amount: 0,
                    cost: 0
                  }
                }));
              }}
              className="data-[state=checked]:bg-[#3BC184] data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-200 mt-0.5"
            />
            <Label htmlFor="electric-vehicle-cost-toggle" className="text-[13px] font-normal cursor-pointer">
              비용으로 입력
            </Label>
          </div>

          {/* 전기 충전량 */}
          <div className="space-y-2">
            <Label htmlFor={`electric-vehicle-${inputs?.electricVehicle?.inputType || "volume"}`} className="text-[13px]">
              전기 {inputs?.electricVehicle?.inputType === "cost" ? "충전 비용" : "충전량"}
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id={`electric-vehicle-${inputs?.electricVehicle?.inputType || "volume"}`}
                type="number"
                min="0"
                step="0.01"
                placeholder={`전기 ${inputs?.electricVehicle?.inputType === "cost" ? "충전 비용" : "충전량"}을 입력하세요`}
                className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
                value={
                  inputs?.electricVehicle?.inputType === "cost"
                    ? inputs?.electricVehicle?.cost || ""
                    : inputs?.electricVehicle?.amount || ""
                }
                onKeyDown={handleNumberKeyDown}
                onWheel={(e) => e.currentTarget.blur()}
                onInput={(e) => {
                  const value = Number(e.currentTarget.value);
                  if (value < 0) e.currentTarget.value = "0";
                }}
                onChange={(e) => {
                  const value = Math.max(0, Number(e.target.value));
                  if (inputs?.electricVehicle?.inputType === "cost") {
                    setInputs((prev: any) => ({
                      ...prev,
                      electricVehicle: {
                        ...prev.electricVehicle,
                        cost: value
                      }
                    }));
                  } else {
                    setInputs((prev: any) => ({
                      ...prev,
                      electricVehicle: {
                        ...prev.electricVehicle,
                        amount: value
                      }
                    }));
                  }
                }}
              />
              
              {/* 단위 표시 또는 선택 */}
              {inputs?.electricVehicle?.inputType === "cost" ? (
                <span className="text-[13px] text-gray-600 min-w-[40px]">원</span>
              ) : (
                <Select
                  value={inputs?.electricVehicle?.unit || "kWh"}
                  onValueChange={(value: "kWh" | "MWh") =>
                    updateInput("electricVehicle", "unit", value)
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
              )}
            </div>
          </div>
        </div>

        {/* 결과 표시 */}
        {showResults && 
          results &&
          ((inputs?.electricVehicle?.inputType === "cost" && inputs?.electricVehicle?.cost > 0) ||
           (inputs?.electricVehicle?.inputType !== "cost" && inputs?.electricVehicle?.amount > 0)) && (
          <div className="bg-[#F5FFF5] border-t border-[rgba(59,193,132,0.2)] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#111827]">탄소배출량</span>
                <div
                  className="bg-white border border-[#3BC184] rounded-[8px] px-3 py-1 hover:bg-[#F5FFF5] transition-all cursor-pointer"
                  onClick={() => openModal("electricVehicle")}
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
    </div>
  );
}