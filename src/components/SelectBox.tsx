import { useEffect, useRef, useState } from "react";
import { FormattedCharacter } from "../types";

interface SelectBoxProps {
  items: FormattedCharacter[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  fetchNextPage: () => void;
  isLoading: boolean;
}

function SelectBox({ items, selectedItems, setSelectedItems, fetchNextPage, isLoading }: SelectBoxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const selectBoxRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (itemName: string) => {
    if (selectedItems.includes(itemName)) {
      setSelectedItems(selectedItems.filter((item) => item !== itemName));
    } else {
      setSelectedItems([...selectedItems, itemName]);
    }
  };

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const highlightSearchTerm = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? <strong key={index}>{part}</strong> : part
        )}
      </>
    );
  };

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage();
      }
    });

    if (lastItemRef.current) {
      observer.current.observe(lastItemRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [filteredItems, fetchNextPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectBoxRef.current && !selectBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="max-w-xl" ref={selectBoxRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedItems.map((item) => (
          <span key={item} className="bg-slate-200 px-2 py-1 rounded-sm flex items-center">
            {item}
            <button onClick={() => handleSelect(item)} className="ml-2 text-red-500">
              x
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-300 rounded mb-2"
        placeholder="Search"
      />
      {isOpen && (
        <div className="border border-gray-300 rounded max-h-60 overflow-y-auto">
          {filteredItems.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(item.name)}
              ref={index === filteredItems.length - 1 ? lastItemRef : null}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.name)}
                onChange={() => handleSelect(item.name)}
                className="mr-2"
              />
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full mr-2" />
              <div>
                <div>{highlightSearchTerm(item.name, searchTerm)}</div>
                <div className="text-sm text-gray-500">{item.episodes} Episodes</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center p-2">
              <span>Loading...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SelectBox;
