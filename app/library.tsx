import { router } from "expo-router";
import { RouteLayout } from "@/components/nova/RouteLayout";
import { ChallengeLibraryScreen } from "@/components/nova/Screens";
import { useAppStore } from "@/store/useAppStore";

export default function LibraryRoute() {
  const search = useAppStore((state) => state.searchQuery);
  const category = useAppStore((state) => state.categoryFilter);
  const setSearch = useAppStore((state) => state.setSearchQuery);
  const setCategory = useAppStore((state) => state.setCategoryFilter);
  const selectChallenge = useAppStore((state) => state.selectChallenge);

  function openDetails(id: string) {
    selectChallenge(id);
    router.push({ pathname: "/details/[id]", params: { id } });
  }

  return (
    <RouteLayout screen="library" dark={false} showTabs>
      <ChallengeLibraryScreen
        search={search}
        category={category}
        onSearch={setSearch}
        onCategory={setCategory}
        onSelect={openDetails}
      />
    </RouteLayout>
  );
}
