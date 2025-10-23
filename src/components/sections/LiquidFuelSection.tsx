import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LiquidFuelSectionProps {
  inputs: any;
  results: any;
  showResults: boolean;
  updateInput: (section: string, field: string, value: any) => void;
  openModal: (section: string) => void;
  disabled?: boolean;
}

export function LiquidFuelSection({
  inputs,
  results,
  showResults,
  updateInput,
  openModal,
  disabled = false,
}: LiquidFuelSectionProps) {
  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[#4B5563] text-[14px] font-bold">액체연료</h3>
      <div className="bg-white rounded-[8px] border border-[#e5e5e5] overflow-hidden">
        <div className="p-6 space-y-6 bg-[#F9FAFB]">
        {/* 경유 */}
        <div className="space-y-2">
          <Label className="text-[13px]">
            경유 사용량
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              disabled={disabled}
              value={inputs?.liquidFuel?.diesel?.amount || ""}
              onChange={(e) =>
                updateInput("liquidFuel", "diesel.amount", parseFloat(e.target.value) || 0)
              }
              onKeyDown={handleNumberKeyDown}
              className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
              placeholder="경유 사용량을 입력하세요"
            />
            <span className="text-[13px] text-gray-600 min-w-[40px]">L</span>
          </div>
        </div>

        {/* 등유 */}
        <div className="space-y-2">
          <Label className="text-[13px]">
            등유 사용량
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              disabled={disabled}
              value={inputs?.liquidFuel?.kerosene?.amount || ""}
              onChange={(e) =>
                updateInput("liquidFuel", "kerosene.amount", parseFloat(e.target.value) || 0)
              }
              onKeyDown={handleNumberKeyDown}
              className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
              placeholder="등유 사용량을 입력하세요"
            />
            <span className="text-[13px] text-gray-600 min-w-[40px]">L</span>
          </div>
        </div>

        {/* 휘발유 */}
        <div className="space-y-2">
          <Label className="text-[13px]">
            휘발유 사용량
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              step="0.01"
              disabled={disabled}
              value={inputs?.liquidFuel?.gasoline?.amount || ""}
              onChange={(e) =>
                updateInput("liquidFuel", "gasoline.amount", parseFloat(e.target.value) || 0)
              }
              onKeyDown={handleNumberKeyDown}
              className="flex-1 bg-white border border-gray-200 rounded-[8px] px-4 py-3 transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 text-[13px] placeholder:text-[13px]"
              placeholder="휘발유 사용량을 입력하세요"
            />
            <span className="text-[13px] text-gray-600 min-w-[40px]">L</span>
          </div>
        </div>

        </div>

        {/* 결과 표시 */}
        {showResults && ((inputs?.liquidFuel?.diesel?.amount > 0) || (inputs?.liquidFuel?.kerosene?.amount > 0) || (inputs?.liquidFuel?.gasoline?.amount > 0)) && (
          <div className="bg-[#F5FFF5] border-t border-[rgba(59,193,132,0.2)] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#111827]">탄소배출량</span>
                <div
                  className="bg-white border border-[#3BC184] rounded-[8px] px-3 py-1 hover:bg-[#F5FFF5] transition-all cursor-pointer"
                  onClick={() => openModal("liquidFuel")}
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