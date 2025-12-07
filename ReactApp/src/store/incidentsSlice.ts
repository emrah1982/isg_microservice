import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IncidentsState {
  filter: string;
}

const initialState: IncidentsState = {
  filter: '',
};

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setIncidentFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload;
    },
  },
});

export const { setIncidentFilter } = incidentsSlice.actions;
export default incidentsSlice.reducer;
