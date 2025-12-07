import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RiskAnalysisState {
  selectedRiskId: string | null;
}

const initialState: RiskAnalysisState = {
  selectedRiskId: null,
};

const riskAnalysisSlice = createSlice({
  name: 'riskAnalysis',
  initialState,
  reducers: {
    setSelectedRiskId(state, action: PayloadAction<string | null>) {
      state.selectedRiskId = action.payload;
    },
  },
});

export const { setSelectedRiskId } = riskAnalysisSlice.actions;
export default riskAnalysisSlice.reducer;
