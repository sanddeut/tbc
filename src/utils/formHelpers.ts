import { CalculationInputs } from "./calculations";

// 숫자만 입력 허용하는 함수
export const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // 허용되는 키: 숫자, 백스페이스, 탭, 엔터, 방향키, 델리트, 홈, 엔드, 점(소수점)
  const allowedKeys = [
    'Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Delete', 'Home', 'End', '.', ','
  ];
  
  const isNumberKey = /^[0-9]$/.test(e.key);
  const isAllowedKey = allowedKeys.includes(e.key);
  const isCtrlPressed = e.ctrlKey || e.metaKey; // Ctrl+A, Ctrl+C, Ctrl+V 등 허용
  
  if (!isNumberKey && !isAllowedKey && !isCtrlPressed) {
    e.preventDefault();
  }
};

// 초기 입력 상태
export const initialInputs: CalculationInputs = {
  industry: "",
  electricity: {
    total: 0,
    renewable: 0,
    conventional: 0,
    hasRenewable: false,
    unit: "MWh",
  },
  districtHeating: {
    provider: "sudogwon",
    amount: 0,
    unit: "Mcal",
    customEmissionFactors: {
      co2: 0,
      ch4: 0,
      n2o: 0,
    },
  },
  cityGas: {
    amount: 0,
  },
  propane: {
    amount: 0,
  },
  liquidFuel: {
    diesel: {
      amount: 0,
    },
    kerosene: {
      amount: 0,
    },
    gasoline: {
      amount: 0,
    },
  },
  vehicle: {
    inputType: "volume",
    fuels: {
      gasoline: {
        amount: 0,
        cost: 0,
      },
      diesel: {
        amount: 0,
        cost: 0,
      },
      lpg: {
        amount: 0,
        cost: 0,
      },
    },
  },
  electricVehicle: {
    inputType: "volume",
    amount: 0,
    cost: 0,
    unit: "kWh",
  },
};