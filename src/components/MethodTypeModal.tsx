import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MethodTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "location" | "market";
}

export function MethodTypeModal({
  isOpen,
  onClose,
  type,
}: MethodTypeModalProps) {
  const isLocationBased = type === "location";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-[#374151]">
            {isLocationBased ? "지역기반 방법" : "시장기반 방법"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6b7280]">
            
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[13px] text-[#6b7280] leading-[1.6]">
              {isLocationBased
                ? "전력이 소비되는 지역의 평균 전력배출계수를 사용하여 간접배출량을 계산하는 방법입니다."
                : "기업이 실제로 구매한 전력의 속성(재생에너지 인증서 등)을 반영하여 간접배출량을 계산하는 방법입니다."
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}