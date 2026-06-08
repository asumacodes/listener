"use client";

import ProjectListView from "@/components/projects/ProjectListView";
import useProjectList from "@/hooks/useProjectList";

const ProjectListScreen = () => {
  const list = useProjectList();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProjectListView {...list} />
    </div>
  );
};

export default ProjectListScreen;
