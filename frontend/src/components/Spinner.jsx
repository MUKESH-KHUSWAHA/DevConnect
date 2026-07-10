const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <div className={`flex justify-center items-center py-10 ${className}`}>
      <div
        className={`${sizeClass} border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default Spinner;
