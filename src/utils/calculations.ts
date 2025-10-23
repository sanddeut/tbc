export const EMISSION_FACTORS = {
  // 열(스팀) 기본값 (기타 업체용)
  districtHeating: {
    others: 0.0512,     // 기타(배출계수 직접 입력시 기본값)
  },
  // 연료 가격 (L당, 원) - 차량 비용입력시 사용량 산정용
  fuelPrices: {
    gasoline: 1646.71,
    diesel: 1502.69,
    lpg: 995.25,
  },
  // 전기차량 전기요금 (kWh당, 원) - 전기차량 비용입력시 사용량 산정용
  electricityPrice: 324.4 // 324.4원/kWh
};

// 산업군 타입
export type IndustryType = 'energy' | 'manufacturing' | 'commercial' | 'residential';

// 열(스팀) 업체 타입
export type DistrictHeatingProvider = 
  | 'sudogwon' 
  | 'pyeongtaek' 
  | 'cheongju' 
  | 'sejong' 
  | 'daegu' 
  | 'yangsan' 
  | 'gimhae' 
  | 'gwangju' 
  | 'national' 
  | 'others';

// 연료 타입
export type FuelType = 'diesel' | 'kerosene' | 'gasoline' | 'lpg';

// 입력 데이터 타입
export interface CalculationInputs {
  industry: IndustryType | '';
  electricity: {
    total: number;
    renewable: number;
    conventional: number;
    hasRenewable: boolean;
    unit: 'kWh' | 'MWh'; // 단위 선택
  };
  districtHeating: {
    provider: DistrictHeatingProvider;
    amount: number;
    unit: 'Mcal' | 'MWh' | 'MJ'; // 단위 선택
    customEmissionFactors?: {
      co2: number;
      ch4: number;
      n2o: number;
    };
  };
  cityGas: {
    amount: number; // Nm3
  };
  propane: {
    amount: number; // kg
  };
  // 액체연료 섹션 (별도)
  liquidFuel: {
    diesel: {
      amount: number; // L
    };
    kerosene: {
      amount: number; // L
    };
    gasoline: {
      amount: number; // L
    };
  };
  vehicle: {
    inputType: 'volume' | 'cost'; // 사용량 또는 비용으로 입력
    fuels: {
      gasoline: {
        amount: number; // L
        cost: number; // 원
      };
      diesel: {
        amount: number; // L
        cost: number; // 원
      };
      lpg: {
        amount: number; // L
        cost: number; // 원
      };
    };
  };
  electricVehicle: {
    inputType: 'volume' | 'cost'; // 사용량 또는 비용으로 입력
    amount: number; // kWh 또는 MWh
    cost: number; // 원
    unit: 'kWh' | 'MWh'; // 단위 선택
  };
}

// 섹션별 계산 결과
export interface SectionResult {
  emissions: number; // tCO2e
  type: 'direct' | 'indirect'; // 직접배출 또는 간접배출
}

// 전기 배출량 결과 (지역기반/시장기반 구분)
export interface ElectricityResult {
  location: number; // 지역기반 배출량 (총 전기사용량)
  market: number;   // 시장기반 배출량 (재생에너지 제외)
  type: 'indirect';
}


// 전체 계산 결과
export interface CalculationResult {
  electricity: ElectricityResult;
  districtHeating: SectionResult;
  cityGas: SectionResult;
  propane: SectionResult;
  liquidFuel: SectionResult; // 액체연료 섹션 결과
  vehicle: SectionResult;
  electricVehicle: SectionResult;
  totals: {
    direct: number;
    indirect: {
      location: number;
      market: number;
    };
    total: {
      location: number;
      market: number;
    };
  };
}

//섹션별 계산
// 1. 전기 및 열(스팀)
// 전기 사용량 계산
export function calculateElectricityEmissions(
  totalUsage: number,
  renewableUsage: number,
  hasRenewable: boolean,
  unit: 'kWh' | 'MWh' = 'kWh'
): ElectricityResult {
  // (0) 데이터 전처리: kWh를 MWh로 변환
  const totalUsageInMwh = unit === 'kWh' ? totalUsage / 1000 : totalUsage;
  const renewableUsageInMwh = unit === 'kWh' ? renewableUsage / 1000 : renewableUsage;
  
  if (!hasRenewable) {
    // case1: 재생에너지 토글 OFF - 총 전기사용량 전체에 동일한 계산식 적용
    const targetUsage = totalUsageInMwh;
    const emissions = (targetUsage * 0.4567) + 
                     (targetUsage * 0.0036 / 1000 * 21) + 
                     (targetUsage * 0.0085 / 1000 * 310);
    
    return {
      location: parseFloat(emissions.toFixed(2)),
      market: parseFloat(emissions.toFixed(2)),
      type: 'indirect'
    };
  } else {
    // case2: 재생에너지 토글 ON
    const conventionalUsageInMwh = Math.max(0, totalUsageInMwh - renewableUsageInMwh);
    
    // 지역기반: (재생전기사용량 + 일반전기 사용량)을 총 전기사용량으로 하여 일반전기분 계산식에 적용
    const locationEmissions = (totalUsageInMwh * 0.4567 * 1) + 
                             (totalUsageInMwh * 0.0036 / 1000 * 21) + 
                             (totalUsageInMwh * 0.0085 / 1000 * 310);
    
    // 시장기반: 일반전기분만 계산
    const marketEmissions = (conventionalUsageInMwh * 0.4567 * 1) + 
                           (conventionalUsageInMwh * 0.0036 / 1000 * 21) + 
                           (conventionalUsageInMwh * 0.0085 / 1000 * 310);
    
    return {
      location: parseFloat(locationEmissions.toFixed(2)),
      market: parseFloat(marketEmissions.toFixed(2)),
      type: 'indirect'
    };
  }
}

// 열(스팀) 계산
export function calculateDistrictHeatingEmissions(
  amount: number,
  provider: DistrictHeatingProvider,
  unit: 'Mcal' | 'MWh' | 'MJ' = 'Mcal',
  customEmissionFactors?: { co2: number; ch4: number; n2o: number }
): SectionResult {
  // (1) 입력값 전처리: TJ 단위로 변환
  let amountInTJ: number;
  if (unit === 'MWh') {
    amountInTJ = amount * 0.0036; // 1MWh = 0.0036 TJ
  } else if (unit === 'MJ') {
    amountInTJ = amount * 0.000001; // 1MJ = 0.000001 TJ
  } else {
    amountInTJ = amount * 0.0000041868; // 1Mcal = 0.0000041868 TJ
  }
  
  // (2) 업체별 배출계수를 적용한 계산식: ((변환된입력값*CO2배출계수*1) + (변환된입력값*CH4배출계수*21) + (변환된입력값*N2O*310))/1000
  let emissions: number;
  
  switch (provider) {
    case 'sudogwon':
      emissions = ((amountInTJ * 35058 * 1) + (amountInTJ * 0.634 * 21) + (amountInTJ * 0.064 * 310)) / 1000;
      break;
    case 'pyeongtaek':
      emissions = ((amountInTJ * 15717 * 1) + (amountInTJ * 0.3793 * 21) + (amountInTJ * 0.0301 * 310)) / 1000;
      break;
    case 'cheongju':
      emissions = ((amountInTJ * 56642 * 1) + (amountInTJ * 1.4574 * 21) + (amountInTJ * 0.2295 * 310)) / 1000;
      break;
    case 'sejong':
      emissions = ((amountInTJ * 42672 * 1) + (amountInTJ * 0.7667 * 21) + (amountInTJ * 0.0767 * 310)) / 1000;
      break;
    case 'daegu':
      emissions = ((amountInTJ * 48249 * 1) + (amountInTJ * 2.5138 * 21) + (amountInTJ * 0.3705 * 310)) / 1000;
      break;
    case 'yangsan':
      emissions = ((amountInTJ * 35444 * 1) + (amountInTJ * 0.6346 * 21) + (amountInTJ * 0.0635 * 310)) / 1000;
      break;
    case 'gimhae':
      emissions = ((amountInTJ * 35747 * 1) + (amountInTJ * 0.6372 * 21) + (amountInTJ * 0.0637 * 310)) / 1000;
      break;
    case 'gwangju':
      emissions = ((amountInTJ * 34068 * 1) + (amountInTJ * 16.9847 * 21) + (amountInTJ * 2.2506 * 310)) / 1000;
      break;
    case 'national':
      emissions = ((amountInTJ * 59510 * 1) + (amountInTJ * 1.832 * 21) + (amountInTJ * 0.44 * 310)) / 1000;
      break;
    case 'others':
      // 기타(배출계수 직접 입력)
      if (customEmissionFactors) {
        emissions = ((amountInTJ * customEmissionFactors.co2 * 1) + 
                    (amountInTJ * customEmissionFactors.ch4 * 21) + 
                    (amountInTJ * customEmissionFactors.n2o * 310)) / 1000;
      } else {
        // 기본값 사용
        const amountInMcal = unit === 'MWh' ? amount * 0.86 : amount;
        emissions = amountInMcal * EMISSION_FACTORS.districtHeating.others;
      }
      break;
    default:
      emissions = 0;
  }
  
  return {
    emissions: parseFloat(emissions.toFixed(2)),
    type: 'indirect'
  };
}

// 2. 설비 이용
// 2.1. 기체 연료
// 도시가스(LNG) 계산
export function calculateCityGasEmissions(
  amount: number,
  industry: IndustryType
): SectionResult {
  // (1) 입력값 전처리: 천m3 단위로 변환
  const amountInThousandM3 = amount / 1000;
  
  // (2) 산업군별 계산식 적용: CO2 + CH4 + N2O 분리 계산
  let co2Emissions: number;
  let ch4Emissions: number;
  let n2oEmissions: number;
  
  if (industry === 'energy' || industry === 'manufacturing') {
    // 에너지산업, 제조업/건설업: CH4 배출계수 1
    co2Emissions = (amountInThousandM3 * 38.9 * 56100 * 1.0 * Math.pow(10, -6)) * 1;
    ch4Emissions = (amountInThousandM3 * 38.9 * 1 * Math.pow(10, -6)) * 21;
    n2oEmissions = (amountInThousandM3 * 38.9 * 0.1 * Math.pow(10, -6)) * 310;
  } else if (industry === 'commercial' || industry === 'residential') {
    // 상업/공공, 가정/기타: CH4 배출계수 5
    co2Emissions = (amountInThousandM3 * 38.9 * 56100 * 1.0 * Math.pow(10, -6)) * 1;
    ch4Emissions = (amountInThousandM3 * 38.9 * 5 * Math.pow(10, -6)) * 21;
    n2oEmissions = (amountInThousandM3 * 38.9 * 0.1 * Math.pow(10, -6)) * 310;
  } else {
    // 산업군이 선택되지 않은 경우 기본값 사용 (에너지산업 공식)
    co2Emissions = (amountInThousandM3 * 38.9 * 56100 * 1.0 * Math.pow(10, -6)) * 1;
    ch4Emissions = (amountInThousandM3 * 38.9 * 1 * Math.pow(10, -6)) * 21;
    n2oEmissions = (amountInThousandM3 * 38.9 * 0.1 * Math.pow(10, -6)) * 310;
  }
  
  const totalEmissions = co2Emissions + ch4Emissions + n2oEmissions;
  
  return {
    emissions: parseFloat(totalEmissions.toFixed(2)),
    type: 'direct'
  };
}

// 프로판 계산
export function calculatePropaneEmissions(
  amount: number,
  industry: IndustryType
): SectionResult {
  // (1) 입력값 전처리 없음 - 그대로 사용
  
  // (2) 산업군별 계산식 적용: CO2 + CH4 + N2O 분리 계산
  let co2Emissions: number;
  let ch4Emissions: number;
  let n2oEmissions: number;
  
  if (industry === 'energy' || industry === 'manufacturing') {
    // 에너지산업, 제조업/건설업: CH4 배출계수 1
    co2Emissions = (amount * 46.3 * 63100 * 1.0 * Math.pow(10, -6)) * 1;
    ch4Emissions = (amount * 46.3 * 1 * Math.pow(10, -6)) * 21;
    n2oEmissions = (amount * 46.3 * 0.1 * Math.pow(10, -6)) * 310;
  } else if (industry === 'commercial' || industry === 'residential') {
    // 상업/공공, 가정/기타: CH4 배출계수 5
    co2Emissions = (amount * 46.3 * 63100 * 1.0 * Math.pow(10, -6)) * 1;
    ch4Emissions = (amount * 46.3 * 5 * Math.pow(10, -6)) * 21;
    n2oEmissions = (amount * 46.3 * 0.1 * Math.pow(10, -6)) * 310;
  } else {
    // 산업군이 선택되지 않은 경우 기본값 사용 (에너지산업 공식)
    co2Emissions = (amount * 46.3 * 63100 * 1.0 * Math.pow(10, -6)) * 1;
    ch4Emissions = (amount * 46.3 * 1 * Math.pow(10, -6)) * 21;
    n2oEmissions = (amount * 46.3 * 0.1 * Math.pow(10, -6)) * 310;
  }
  
  const totalEmissions = co2Emissions + ch4Emissions + n2oEmissions;
  
  return {
    emissions: parseFloat(totalEmissions.toFixed(2)),
    type: 'direct'
  };
}

// 2.2 액체연료
export function calculateLiquidFuelEmissions(
  dieselAmount: number,
  keroseneAmount: number,
  gasolineAmount: number,
  industry: IndustryType
): SectionResult {
  let totalEmissions = 0;
  
  // 경유 계산
  if (dieselAmount > 0) {
    // (2) 입력값 전처리 - 입력값을 KL 단위로 변환 (/1000)
    const dieselAmountInKL = dieselAmount / 1000;
    
    // (3) 계산식 - 산업군에 따라 다른 산식 적용
    let dieselEmissions: number;
    
    if (industry === 'energy' || industry === 'manufacturing') {
      // 에너지산업, 제조업건설업: CH4 배출계수 3
      const co2 = (dieselAmountInKL * 35.2 * 74100 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (dieselAmountInKL * 35.2 * 3 * Math.pow(10, -6)) * 21;
      const n2o = (dieselAmountInKL * 35.2 * 0.6 * Math.pow(10, -6)) * 310;
      dieselEmissions = co2 + ch4 + n2o;
    } else if (industry === 'commercial' || industry === 'residential') {
      // 상업공공, 가정기타: CH4 배출계수 10
      const co2 = (dieselAmountInKL * 35.2 * 74100 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (dieselAmountInKL * 35.2 * 10 * Math.pow(10, -6)) * 21;
      const n2o = (dieselAmountInKL * 35.2 * 0.6 * Math.pow(10, -6)) * 310;
      dieselEmissions = co2 + ch4 + n2o;
    } else {
      // 산업군이 선택되지 않은 경우 기본값 사용 (에너지산업 공식)
      const co2 = (dieselAmountInKL * 35.2 * 74100 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (dieselAmountInKL * 35.2 * 3 * Math.pow(10, -6)) * 21;
      const n2o = (dieselAmountInKL * 35.2 * 0.6 * Math.pow(10, -6)) * 310;
      dieselEmissions = co2 + ch4 + n2o;
    }
    
    totalEmissions += dieselEmissions;
  }
  
  // 등유 계산
  if (keroseneAmount > 0) {
    // (2) 입력값 전처리 - 입력값을 KL 단위로 변환 (/1000)
    const keroseneAmountInKL = keroseneAmount / 1000;
    
    // (3) 계산식 - 산업군에 따라 다른 산식 적용
    let keroseneEmissions: number;
    
    if (industry === 'energy' || industry === 'manufacturing') {
      // 에너지산업, 제조업건설업: CH4 배출계수 3
      const co2 = (keroseneAmountInKL * 34.2 * 71900 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (keroseneAmountInKL * 34.2 * 3 * Math.pow(10, -6)) * 21;
      const n2o = (keroseneAmountInKL * 34.2 * 0.6 * Math.pow(10, -6)) * 310;
      keroseneEmissions = co2 + ch4 + n2o;
    } else if (industry === 'commercial' || industry === 'residential') {
      // 상업공공, 가정기타: CH4 배출계수 10
      const co2 = (keroseneAmountInKL * 34.2 * 71900 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (keroseneAmountInKL * 34.2 * 10 * Math.pow(10, -6)) * 21;
      const n2o = (keroseneAmountInKL * 34.2 * 0.6 * Math.pow(10, -6)) * 310;
      keroseneEmissions = co2 + ch4 + n2o;
    } else {
      // 산업군이 선택되지 않은 경우 기본값 사용 (에너지산업 공식)
      const co2 = (keroseneAmountInKL * 34.2 * 71900 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (keroseneAmountInKL * 34.2 * 3 * Math.pow(10, -6)) * 21;
      const n2o = (keroseneAmountInKL * 34.2 * 0.6 * Math.pow(10, -6)) * 310;
      keroseneEmissions = co2 + ch4 + n2o;
    }
    
    totalEmissions += keroseneEmissions;
  }
  
  // 휘발유 계산
  if (gasolineAmount > 0) {
    // (2) 입력값 전처리 - 입력값을 KL 단위로 변환 (/1000)
    const gasolineAmountInKL = gasolineAmount / 1000;
    
    // (3) 계산식 - 산업군에 따라 다른 산식 적용
    let gasolineEmissions: number;
    
    if (industry === 'energy' || industry === 'manufacturing') {
      // 에너지산업, 제조업건설업: CH4 배출계수 3
      const co2 = (gasolineAmountInKL * 30.4 * 69300 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (gasolineAmountInKL * 30.4 * 3 * Math.pow(10, -6)) * 21;
      const n2o = (gasolineAmountInKL * 30.4 * 0.6 * Math.pow(10, -6)) * 310;
      gasolineEmissions = co2 + ch4 + n2o;
    } else if (industry === 'commercial' || industry === 'residential') {
      // 상업공공, 가정기타: CH4 배출계수 10
      const co2 = (gasolineAmountInKL * 30.4 * 69300 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (gasolineAmountInKL * 30.4 * 10 * Math.pow(10, -6)) * 21;
      const n2o = (gasolineAmountInKL * 30.4 * 0.6 * Math.pow(10, -6)) * 310;
      gasolineEmissions = co2 + ch4 + n2o;
    } else {
      // 산업군이 선택되지 않은 경우 기본값 사용 (에너지산업 공식)
      const co2 = (gasolineAmountInKL * 30.4 * 69300 * 1.0 * Math.pow(10, -6)) * 1;
      const ch4 = (gasolineAmountInKL * 30.4 * 3 * Math.pow(10, -6)) * 21;
      const n2o = (gasolineAmountInKL * 30.4 * 0.6 * Math.pow(10, -6)) * 310;
      gasolineEmissions = co2 + ch4 + n2o;
    }
    
    totalEmissions += gasolineEmissions;
  }
  
  return {
    emissions: parseFloat(totalEmissions.toFixed(2)),
    type: 'direct'
  };
}


// 3. 차량 이용
// 3.1. 내연기관 차량
export function calculateVehicleEmissions(
  fuels: {
    gasoline: { amount: number; cost: number };
    diesel: { amount: number; cost: number };
    lpg: { amount: number; cost: number };
  },
  inputType: 'volume' | 'cost'
): SectionResult {
  let totalEmissions = 0;
  
  // 휘발유 계산
  if ((inputType === 'volume' && fuels.gasoline.amount > 0) || 
      (inputType === 'cost' && fuels.gasoline.cost > 0)) {
    let gasolineAmountInLiters: number;
    
    if (inputType === 'cost') {
      // (2) 입력값 전처리: 가격을 이용해 입력값을 KL 단위로 변환
      // 휘발유: 1646.71원/1L
      gasolineAmountInLiters = fuels.gasoline.cost / 1646.71;
    } else {
      gasolineAmountInLiters = fuels.gasoline.amount;
    }
    
    // (2) 입력값 전처리: 입력값을 KL 단위로 변환 (/1000)
    const gasolineAmountInKL = gasolineAmountInLiters / 1000;
    
    // (3) 연료별 산정식: CO2 + CH4 + N2O 분리 계산
    const co2 = (gasolineAmountInKL * 30.4 * 69300 * Math.pow(10, -6)) * 1;
    const ch4 = (gasolineAmountInKL * 30.4 * 25 * Math.pow(10, -6)) * 21;
    const n2o = (gasolineAmountInKL * 30.4 * 8 * Math.pow(10, -6)) * 310;
    const gasolineEmissions = co2 + ch4 + n2o;
    
    totalEmissions += gasolineEmissions;
  }
  
  // 경유 계산
  if ((inputType === 'volume' && fuels.diesel.amount > 0) || 
      (inputType === 'cost' && fuels.diesel.cost > 0)) {
    let dieselAmountInLiters: number;
    
    if (inputType === 'cost') {
      // (2) 입력값 전처리: 가격을 이용해 입력값을 KL 단위로 변환
      // 경유: 1,502.69원/1L
      dieselAmountInLiters = fuels.diesel.cost / 1502.69;
    } else {
      dieselAmountInLiters = fuels.diesel.amount;
    }
    
    // (2) 입력값 전처리: 입력값을 KL 단위로 변환 (/1000)
    const dieselAmountInKL = dieselAmountInLiters / 1000;
    
    // (3) 연료별 산정식: CO2 + CH4 + N2O 분리 계산
    const co2 = (dieselAmountInKL * 35.2 * 74100 * Math.pow(10, -6)) * 1;
    const ch4 = (dieselAmountInKL * 35.2 * 3.9 * Math.pow(10, -6)) * 21;
    const n2o = (dieselAmountInKL * 35.2 * 3.9 * Math.pow(10, -6)) * 310;
    const dieselEmissions = co2 + ch4 + n2o;
    
    totalEmissions += dieselEmissions;
  }
  
  // LPG 계산
  if ((inputType === 'volume' && fuels.lpg.amount > 0) || 
      (inputType === 'cost' && fuels.lpg.cost > 0)) {
    let lpgAmountInLiters: number;
    
    if (inputType === 'cost') {
      // (2) 입력값 전처리: 가격을 이용해 입력값을 KL 단위로 변환
      // LPG: 995.25원/1L
      lpgAmountInLiters = fuels.lpg.cost / 995.25;
    } else {
      lpgAmountInLiters = fuels.lpg.amount;
    }
    
    // (2) 입력값 전처리: 입력값을 KL 단위로 변환 (/1000)
    const lpgAmountInKL = lpgAmountInLiters / 1000;
    
    // (3) 연료별 산정식: CO2 + CH4 + N2O 분리 계산
    const co2 = (lpgAmountInKL * 45.7 * 63100 * Math.pow(10, -6)) * 1;
    const ch4 = (lpgAmountInKL * 45.7 * 62 * Math.pow(10, -6)) * 21;
    const n2o = (lpgAmountInKL * 45.7 * 0.2 * Math.pow(10, -6)) * 310;
    const lpgEmissions = co2 + ch4 + n2o;
    
    totalEmissions += lpgEmissions;
  }
  
  return {
    emissions: parseFloat(totalEmissions.toFixed(2)),
    type: 'direct'
  };
}

// 3.2. 전기차량 계산
export function calculateElectricVehicleEmissions(
  amount: number,
  cost: number,
  inputType: 'volume' | 'cost',
  unit: 'kWh' | 'MWh' = 'kWh'
): SectionResult {
  let usageInMwh: number;
  
  if (inputType === 'cost') {
    // (2) 입력값 전처리: MWh로 변환 (기준: 324.4원/kWh)
    const usageInKwh = cost / EMISSION_FACTORS.electricityPrice;
    usageInMwh = usageInKwh / 1000;
  } else {
    // (1) 입력값 전처리: 입력값을 MWh 단위로 변환 (kWh 입력시 /1000)
    usageInMwh = unit === 'kWh' ? amount / 1000 : amount;
  }
  
  // (2) 계산식: (변환된입력값*0.4567)+(변환된입력값*0.0036/1000*21)+(변환된입력값*0.0085/1000*310)
  const emissions = (usageInMwh * 0.4567) + 
                   (usageInMwh * 0.0036 / 1000 * 21) + 
                   (usageInMwh * 0.0085 / 1000 * 310);
  
  return {
    emissions: parseFloat(emissions.toFixed(2)),
    type: 'indirect'
  };
}


// 입력값이 있는지 확인하는 함수
export function hasAnyInputValue(inputs: CalculationInputs): boolean {
  // 산업군이 선택되지 않았으면 false
  if (!inputs.industry) return false;

  // 전기 사용량 체크
  const totalElectricity = inputs.electricity.hasRenewable 
    ? (inputs.electricity.renewable || 0) + (inputs.electricity.conventional || 0)
    : inputs.electricity.total;
  if (totalElectricity > 0) return true;

  // 열(스팀) 체크
  if (inputs.districtHeating.amount > 0) return true;

  // 도시가스 체크
  if (inputs.cityGas.amount > 0) return true;

  // 프로판 체크
  if (inputs.propane.amount > 0) return true;


  // 액체연료 체크
  if (inputs.liquidFuel.diesel.amount > 0 || inputs.liquidFuel.kerosene.amount > 0 || inputs.liquidFuel.gasoline.amount > 0) return true;

  // 차량 연료 체크
  const { fuels, inputType } = inputs.vehicle;
  if (inputType === 'volume') {
    if (fuels.gasoline.amount > 0 || fuels.diesel.amount > 0 || fuels.lpg.amount > 0) return true;
  } else {
    if (fuels.gasoline.cost > 0 || fuels.diesel.cost > 0 || fuels.lpg.cost > 0) return true;
  }

  // 전기차량 체크
  if (inputs.electricVehicle) {
    if (inputs.electricVehicle.inputType === 'volume') {
      if (inputs.electricVehicle.amount > 0) return true;
    } else {
      if (inputs.electricVehicle.cost > 0) return true;
    }
  }

  return false;
}

// 전체 계산
export function calculateTotalEmissions(inputs: CalculationInputs): CalculationResult {
  // 토글 상태에 따른 총 전기사용량 계산
  const totalElectricity = inputs.electricity.hasRenewable 
    ? (inputs.electricity.renewable || 0) + (inputs.electricity.conventional || 0)
    : inputs.electricity.total;
  
  const electricity = calculateElectricityEmissions(
    totalElectricity,
    inputs.electricity.renewable,
    inputs.electricity.hasRenewable,
    inputs.electricity.unit
  );
  
  const districtHeating = calculateDistrictHeatingEmissions(
    inputs.districtHeating.amount,
    inputs.districtHeating.provider,
    inputs.districtHeating.unit,
    inputs.districtHeating.customEmissionFactors
  );
  
  const cityGas = calculateCityGasEmissions(
    inputs.cityGas.amount,
    inputs.industry as IndustryType
  );
  
  const propane = calculatePropaneEmissions(
    inputs.propane.amount,
    inputs.industry as IndustryType
  );
  
  
  const liquidFuel = calculateLiquidFuelEmissions(
    inputs.liquidFuel.diesel.amount,
    inputs.liquidFuel.kerosene.amount,
    inputs.liquidFuel.gasoline.amount,
    inputs.industry as IndustryType
  );
  
  const vehicle = calculateVehicleEmissions(
    inputs.vehicle.fuels,
    inputs.vehicle.inputType
  );
  
  const electricVehicle = calculateElectricVehicleEmissions(
    inputs.electricVehicle?.amount || 0,
    inputs.electricVehicle?.cost || 0,
    inputs.electricVehicle?.inputType || 'volume',
    inputs.electricVehicle?.unit || 'kWh'
  );
  
  
  // 직접배출 합계: 설비이용 전체(기체연료+액체연료) + 차량이용 중 내연기관차량
  // = (도시가스) + (프로판) + (액체연료) + (차량이용 중 내연기관차량)
  const directTotal = cityGas.emissions + propane.emissions + liquidFuel.emissions + vehicle.emissions;
  
  // (1) 지역기반 배출량
  // - 직접배출: 설비이용 전체(기체연료+액체연료) + 차량이용 중 내연기관차량
  // - 간접배출: 차량이용 중 전기차량 + 총 전기사용량 + 열(스팀)
  const indirectLocationTotal = electricVehicle.emissions + electricity.location + districtHeating.emissions;
  const totalLocationEmissions = directTotal + indirectLocationTotal;
  
  // (2) 시장기반 배출량  
  // - 직접배출: 설비이용 전체(기체연료+액체연료) + 차량이용 중 내연기관차량
  // - 간접배출: 차량이용 중 전기차량 + 비재생전기(일반전기) 사용량 + 열(스팀)
  const indirectMarketTotal = electricVehicle.emissions + electricity.market + districtHeating.emissions;
  const totalMarketEmissions = directTotal + indirectMarketTotal;
  
  return {
    electricity,
    districtHeating,
    cityGas,
    propane,
    liquidFuel,
    vehicle,
    electricVehicle,
    totals: {
      direct: parseFloat(directTotal.toFixed(2)),
      indirect: {
        location: parseFloat(indirectLocationTotal.toFixed(2)),
        market: parseFloat(indirectMarketTotal.toFixed(2))
      },
      total: {
        location: parseFloat(totalLocationEmissions.toFixed(2)),
        market: parseFloat(totalMarketEmissions.toFixed(2))
      }
    }
  };
}