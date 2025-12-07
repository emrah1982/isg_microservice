import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UsersState {
  selectedUserId: string | null;
}

const initialState: UsersState = {
  selectedUserId: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUserId(state, action: PayloadAction<string | null>) {
      state.selectedUserId = action.payload;
    },
  },
});

export const { setSelectedUserId } = usersSlice.actions;
export default usersSlice.reducer;
