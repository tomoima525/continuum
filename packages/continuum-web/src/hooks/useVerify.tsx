import { useContentUpdate } from 'contexts/ContentContext';
import { useState } from 'react';

export const useVerify = () => {
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const setContent = useContentUpdate();

  const verifygithub = async ({
    code,
    address,
  }: {
    code: string;
    address: string;
  }) => {
    setLoading(true);
    const isLocal = window.location.hostname === 'localhost';
    const body = JSON.stringify({
      address,
      code,
      isLocal,
    });
    try {
      const result = await (
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/githubAuth`, {
          method: 'POST',
          body,
        })
      ).json();

      setContent({ contents: result.contents, github: result.github });
    } catch (e) {
      console.log(e);
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return [
    {
      error,
      loading,
    },
    verifygithub,
  ] as const;
};
