interface BtnProps {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  color?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => unknown;
}

export const DynamicColorBtn = ({
  children,
  disabled,
  onClick,
  loading,
}: BtnProps) => {
  return (
    <div className="">
      <button
        onClick={onClick}
        className="p-[2px] bg-blue-700 rounded-full disabled:opacity-50 text-white disabled:text-gray-500 flex flex-row px-6"
        disabled={disabled}
      >
        <div className="py-3 text-base font-medium rounded-lg">{children}</div>
        {loading && (
          <div className="self-center ml-2">
            <div className="animate-spin rounded-full px-2 self-center h-4 w-4 border-t-2 border-b-2 border-indigo-100" />
          </div>
        )}
      </button>
    </div>
  );
};
