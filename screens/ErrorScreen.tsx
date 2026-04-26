import React from 'react'

type ErrorScreenProps = {
    message: string;
    canRetry: boolean;
    onRetry: () => void;
    onReRecord: () => void;
}

const ErrorScreen = ({ message, canRetry, onRetry, onReRecord }: ErrorScreenProps) => {
  return (
    <div>
        <p>State: ERROR</p>
        <p style={{ color: 'red' }}>{message}</p>
        {canRetry && <><button onClick={onRetry}>Retry</button>{' '}</>}
        <button onClick={onReRecord}>Re-record</button>
    </div>
  )
}

export default ErrorScreen;