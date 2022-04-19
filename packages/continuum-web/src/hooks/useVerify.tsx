import { useState } from 'react';

export const useVerify = () => {
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();

  const verifygithub = async ({ code }: { code: string }) => {
    setLoading(true);
    const body = JSON.stringify({
      code,
    });
    try {
      const result = await (
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/verifygithub`, {
          method: 'POST',
          body,
        })
      ).json();

      setData(result);
    } catch (e) {
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
      data,
    },
    verifygithub,
  ] as const;
};
