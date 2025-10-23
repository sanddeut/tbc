import { useState, useMemo } from 'react';
import { InputForm } from './components/InputForm';
import { NavigationBar } from './components/NavigationBar';
import { HeaderSection } from './components/HeaderSection';
import { Footer } from './components/Footer';
import { FloatingActionButton } from './components/FloatingActionButton';
import { TotalEmissionsDisplay } from './components/sections/TotalEmissionsDisplay';
import { initialInputs } from './utils/formHelpers';
import { CalculationInputs, hasAnyInputValue } from './utils/calculations';

export default function App() {
  const [resetKey, setResetKey] = useState(0);
  const [inputs, setInputs] = useState<CalculationInputs>(initialInputs);
  const [results, setResults] = useState<any>(null);

  // 입력값에 따라 자동으로 결과 표시 여부 결정
  const showResults = useMemo(() => hasAnyInputValue(inputs), [inputs]);

  const handleReset = () => {
    // InputForm을 완전히 리셋하기 위해 key를 변경
    setResetKey(prev => prev + 1);
    setInputs(initialInputs);
    setResults(null);
  };

  const handleResultsChange = (newResults: any) => {
    setResults(newResults);
  };

  return (
    <div className="app-container">
      <div className="min-h-screen bg-white flex flex-col">
      <NavigationBar onReset={handleReset} />
      <div className="pt-[63px]">
        <HeaderSection />
      </div>
      
      {/* 메인 컨테이너 - 반응형 2컬럼 레이아웃 */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* 왼쪽: 입력 섹션들 */}
        <div className="flex-1 lg:flex-[1.87] border-r border-gray-200 pt-[0px] pr-[0px] pb-[64px] pl-[0px]">
          <InputForm 
            key={resetKey} 
            showResults={showResults}
            inputs={inputs}
            setInputs={setInputs}
            onCalculate={() => {}}
            onReset={handleReset}
            onResultsChange={handleResultsChange}
          />
        </div>
        
        {/* 오른쪽: 결과 표시 */}
        <div className="flex-1 lg:flex-1 bg-gray-50">
          <div className="sticky top-[63px] min-h-[calc(100vh-63px)] overflow-y-auto px-[0px] p-[0px] bg-gray-50">
            <TotalEmissionsDisplay
              showResults={showResults}
              results={results}
              inputs={inputs}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>

      <Footer />
      <FloatingActionButton
        showResults={showResults}
        inputs={inputs}
        onCalculate={() => {}}
        onReset={handleReset}
      />
      </div>
    </div>
  );
}