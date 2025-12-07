import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReportingState {
  dateRange: { from: string | null; to: string | null };
}

const initialState: ReportingState = {
  dateRange: { from: null, to: null },
};

const reportingSlice = createSlice({
  name: 'reporting',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<{ from: string | null; to: string | null }>) {
      state.dateRange = action.payload;
    },
  },
});

export const { setDateRange } = reportingSlice.actions;
export default reportingSlice.reducer;
