const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-purple-600 font-medium text-lg">Loading sweet treats...</p>
      </div>
    </div>
  );
};

export default Loading;
