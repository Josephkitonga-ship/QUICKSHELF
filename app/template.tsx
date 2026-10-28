// Re-mounts on every page change, so each page fades in.
export default function Template({ children }: { children: React.ReactNode }) { return <div className="page">{children}</div> }
