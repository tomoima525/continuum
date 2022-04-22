import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { Content } from 'types';

type State = { contents?: Content[] | undefined | null } | undefined;

const ContentStateContext = createContext<State>(undefined);
const ContentUpdateContext = createContext<
  Dispatch<SetStateAction<State>> | undefined
>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State>({ contents: null });

  return (
    <ContentStateContext.Provider value={state}>
      <ContentUpdateContext.Provider value={setState}>
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
