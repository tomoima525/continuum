export const shorten = (commitment: string) => {
  return `${commitment.substring(0, 4)}...${commitment.substring(
    commitment.length - 3,
    commitment.length,
  )}`;
};
