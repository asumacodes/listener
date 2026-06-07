import SearchView from "@/components/search/SearchView";
import { appShellClass } from "@/lib/layout/shell";

const SearchPage = () => (
  <main className={`${appShellClass} flex min-h-dvh flex-col`}>
    <SearchView />
  </main>
);

export default SearchPage;
