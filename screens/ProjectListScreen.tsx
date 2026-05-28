"use client";

import ProjectListView from "@/components/projects/ProjectListView";
import useProjectList from "@/hooks/useProjectList";

const ProjectListScreen = () => {
  const list = useProjectList();
  return <ProjectListView {...list} />;
};

export default ProjectListScreen;
