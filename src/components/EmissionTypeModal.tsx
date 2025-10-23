import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface EmissionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "direct" | "indirect";
}

export function EmissionTypeModal({
  isOpen,
  onClose,
  type,
}: EmissionTypeModalProps) {
  const isDirectEmission = type === "direct";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-[#374151]">
            {isDirectEmission ? "직접배출 (Scope 1)" : "간접배출 (Scope 2)"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6b7280]">
            {isDirectEmission
              ? "조직이 직접 통제하는 배출원에서 발생하는 온실가스 배출"
              : "조직이 구매한 에너지 소비로 인한 간접적인 온실가스 배출"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 계산에 포함된 항목 */}
          <div className="space-y-2">
            <h4 className="text-[14px] font-medium text-[#374151]">
              계산에 포함된 항목
            </h4>
            <div className="space-y-1">
              {isDirectEmission ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3BC184] rounded-full"></div>
                    <span className="text-[13px] text-[#6b7280]">설비사용 (도시가스(LNG), 경유, 등유)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3BC184] rounded-full"></div>
                    <span className="text-[13px] text-[#6b7280]">내연기관차 (휘발유, 경유, LPG)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3BC184] rounded-full"></div>
                    <span className="text-[13px] text-[#6b7280]">전기</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#3BC184] rounded-full"></div>
                    <span className="text-[13px] text-[#6b7280]">열(스팀)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}