import { Button } from "./ui/button";
import { CalculationInputs } from "../utils/calculations";

interface FloatingActionButtonProps {
  showResults: boolean;
  inputs: CalculationInputs;
  onCalculate: () => void;
  onReset: () => void;
}

export function FloatingActionButton({
  showResults,
  inputs,
  onCalculate,
  onReset,
}: FloatingActionButtonProps) {
  // 결과가 표시될 때만 다시하기 버튼을 보여줌
  if (!showResults) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 px-2 py-2">
        <Button
          onClick={onReset}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 h-auto text-[13px] font-medium rounded-full shadow-sm hover:shadow-md transition-all min-w-[120px]"
        >
          다시하기
        </Button>
      </div>
    </div>
  );
}