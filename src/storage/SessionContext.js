import { createContext, useContext } from 'react';

export const SessionContext = createContext({ session: null, signOut: null });
export const useSession = () => useContext(SessionContext);
