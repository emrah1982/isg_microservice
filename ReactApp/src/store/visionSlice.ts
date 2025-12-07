import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VisionState {
  lastInferenceId: string | null;
}

const initialState: VisionState = {
  lastInferenceId: null,
};

const visionSlice = createSlice({
  name: 'vision',
  initialState,
  reducers: {
    setLastInferenceId(state, action: PayloadAction<string | null>) {
      state.lastInferenceId = action.payload;
    },
  },
});

export const { setLastInferenceId } = visionSlice.actions;
export default visionSlice.reducer;
