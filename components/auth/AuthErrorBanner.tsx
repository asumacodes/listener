type AuthErrorBannerProps = {
  message: string;
};

const AuthErrorBanner = ({ message }: AuthErrorBannerProps) => (
  <p
    className="mt-4 rounded-xl bg-error-bg px-3 py-2 text-xs text-red"
    role="alert"
  >
    {message}
  </p>
);

export default AuthErrorBanner;
