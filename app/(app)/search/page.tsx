import SearchView from "@/components/search/SearchView";
import { appShellClass } from "@/lib/layout/shell";

const SearchPage = () => (
  <main className={`${appShellClass} min-h-[calc(100dvh-4.5rem)]`}>
    <SearchView />
  </main>
);

export default SearchPage;
