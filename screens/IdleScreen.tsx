const IdleScreen = ({ onRecord }: { onRecord: () => void }) => {
  return (
    <div>
      <p>State: IDLE</p>
      <button onClick={onRecord}>Record</button>
    </div>
  );
};

export default IdleScreen;
