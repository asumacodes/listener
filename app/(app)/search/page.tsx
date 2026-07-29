import SearchView from "@/components/search/SearchView";
import { appShellClass } from "@/lib/layout/shell";

const SearchPage = () => (
  <main className={`${appShellClass} min-h-0 flex-1 flex-col overflow-hidden`}>
    <SearchView />
  </main>
);

export default SearchPage;
