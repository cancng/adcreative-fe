import { useEffect, useState } from "react";
import SelectBox from "./components/SelectBox";
import { ApiResponse, Character, FormattedCharacter } from "./types";

function App() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState<FormattedCharacter[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = (url: string, append: boolean = false) => {
    setIsLoading(true);
    fetch(url)
      .then((response) => response.json())
      .then((data: ApiResponse) => {
        const formattedItems: FormattedCharacter[] = data.results.map((item: Character) => ({
          id: item.id,
          name: item.name,
          episodes: item.episode.length,
          image: item.image,
        }));
        setItems((prevItems) => {
          const newItems = append ? [...prevItems, ...formattedItems] : formattedItems;
          const uniqueItems = newItems.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
          return uniqueItems;
        });
        setNextPage(data.info.next);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData("https://rickandmortyapi.com/api/character");
  }, []);

  return (
    <div className="p-4">
      <SelectBox
        items={items}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        fetchNextPage={() => nextPage && fetchData(nextPage, true)}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
