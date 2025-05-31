export const Card = ({ children }) => <div className="rounded-xl shadow bg-white">{children}</div>;
export const CardContent = ({ children, className }) => <div className={className}>{children}</div>;