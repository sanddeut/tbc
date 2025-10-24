import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface GasFuelSectionProps {
  inputs: any;
  results: any;
  showResults: boolean;
  updateInput: (section: string, field: string, value: any) => void;
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

export function GasFuelSection({
  inputs,
  results,
  showResults,
  updateInput,
  openModal,
  disabled = false,
}: GasFuelSectionProps) {
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[#4B5563] text-[14px] font-bold">기체연료</h3>
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] overflow-hidden">
        <div className="p-6 space-y-6 bg-[#F9FAFB]">
        {/* 도시가스 */}
        <div className="space-y-2">
          <Label className="text-[13px]">
            도시가스 사용량
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              disabled={disabled}
              value={inputs?.cityGas?.amount || ""}
              onChange={(e) =>
                updateInput("cityGas", "amount", parseFloat(e.target.value) || 0)
              }
              onKeyDown={handleNumberKeyDown}
              onWheel={(e) => e.currentTarget.blur()}
              className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
              placeholder="도시가스 사용량을 입력하세요"
            />
            <span className="text-[13px] text-gray-600 min-w-[40px]">Nm³</span>
          </div>
        </div>

        {/* 프로판 */}
        <div className="space-y-2">
          <Label className="text-[13px]">
            프로판 사용량
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              disabled={disabled}
              value={inputs?.propane?.amount || ""}
              onChange={(e) =>
                updateInput("propane", "amount", parseFloat(e.target.value) || 0)
              }
              onKeyDown={handleNumberKeyDown}
              onWheel={(e) => e.currentTarget.blur()}
              className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
              placeholder="프로판 사용량을 입력하세요"
            />
            <span className="text-[13px] text-gray-600 min-w-[40px]">kg</span>
          </div>
        </div>

        </div>

        {/* 결과 표시 */}
        {showResults && ((inputs?.cityGas?.amount > 0) || (inputs?.propane?.amount > 0)) && (
          <div className="bg-[#F5FFF5] border-t border-[rgba(59,193,132,0.2)] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#111827]">탄소배출량</span>
                <div
                  className="bg-white border border-[#3BC184] rounded-[8px] px-3 py-1 hover:bg-[#F5FFF5] transition-all cursor-pointer"
                  onClick={() => openModal("gasFuel")}
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
                    {((results?.cityGas?.emissions || 0) + (results?.propane?.emissions || 0)).toFixed(3)}
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