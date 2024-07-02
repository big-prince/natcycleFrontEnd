type NotifierProps = {
  message: string;
  type: "red" | "green" | "info";
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};

const Notifier = ({ message, type, setMessage }: NotifierProps) => {
  const handleClear = () => {
    setMessage("");
  };
  return (
    <div>
      <div className={`bg-${type}-100 border-l-4 border-${type}-500 text-${type}-700 p-4 mb-4 flex justify-between`}>
        <p>{message}</p>
        <button onClick={() => handleClear()}>X</button>
      </div>
    </div>
  );
};

export default Notifier;
