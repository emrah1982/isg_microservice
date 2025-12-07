import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrainingsState {
  selectedTrainingId: string | null;
}

const initialState: TrainingsState = {
  selectedTrainingId: null,
};

const trainingsSlice = createSlice({
  name: 'trainings',
  initialState,
  reducers: {
    setSelectedTrainingId(state, action: PayloadAction<string | null>) {
      state.selectedTrainingId = action.payload;
    },
  },
});

export const { setSelectedTrainingId } = trainingsSlice.actions;
export default trainingsSlice.reducer;
