import useLocalStorage from 'hooks/useLocalStorage';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
} from 'react';
import { Content, GithubUser } from 'types';

const env = process.env.NEXT_PUBLIC_ENV as string;

export type State =
  | { contents?: Content[] | undefined | null; github: GithubUser | null }
  | undefined;

const ContentStateContext = createContext<State>(undefined);
const ContentUpdateContext = createContext<
  Dispatch<SetStateAction<State>> | undefined
>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [storedValue, setStoredValue] = useLocalStorage<State>(
    `Continuum:${env}`,
    { contents: null, github: null },
  );
  return (
    <ContentStateContext.Provider value={storedValue}>
      <ContentUpdateContext.Provider value={setStoredValue}>
        {children}
      </ContentUpdateContext.Provider>
    </ContentStateContext.Provider>
  );
};

export const useContentState = () => {
  const state = useContext(ContentStateContext);
  if (state === undefined) {
    throw new Error('useContentState should be used with ContentProvider');
  }
  return state;
};

export const useContentUpdate = () => {
  const dispatch = useContext(ContentUpdateContext);

  if (dispatch === undefined) {
    throw new Error('useContentUpdate should be used with ContentProvider');
  }
  return dispatch;
};
