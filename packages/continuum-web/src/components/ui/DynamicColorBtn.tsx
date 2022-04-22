interface BtnProps {
  children: React.ReactNode;
  disabled?: boolean;
  color?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => unknown;
}

export const DynamicColorBtn = ({ children, disabled, onClick }: BtnProps) => {
  return (
    <div className="">
      <button
        onClick={onClick}
        className="p-[2px] bg-blue-700 rounded-full disabled:opacity-50 text-white disabled:text-gray-500"
        disabled={disabled}
      >
        <div className="px-6 py-3 text-base font-medium rounded-lg">
          {children}
        </div>
      </button>
    </div>
  );
};
