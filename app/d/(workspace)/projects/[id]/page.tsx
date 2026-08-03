import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Desktop project detail — Set 4 frame stub.
 * TODO: filter DesktopHomeGrid by project id or dedicated project canvas.
 */
const DesktopProjectDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  return (
    <div className="flex flex-1 flex-col items-start gap-4 p-8">
      <Link href="/projects" className="text-sm text-gold hover:brightness-110">
        ← Projects
      </Link>
      <h1 className="font-serif text-[27px] text-text">Project</h1>
      <p className="text-sm text-text-secondary">
        Desktop project detail for{" "}
        <code className="text-xs text-muted">{id}</code> — stub for Set 4.
      </p>
    </div>
  );
};

export default DesktopProjectDetailPage;
