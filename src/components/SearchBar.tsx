import Image from "next/image";

interface SearchBarProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar: React.FC<SearchBarProps> = ({ email, setEmail }) => {
  return (
    <div className="flex items-center gap-2 bg-[var(--light-grey)] rounded-3xl p-2 px-4">
      <Image src="/icons/search.png" width={24} height={24} alt="search" />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-[var(--light-grey)] text-[16px] font-[400] text-[var(--navy-grey)] placeholder-[var(--navy-grey)] focus:outline-none"
        type="text"
        placeholder="Search"
      />
    </div>
  );
};

export default SearchBar;
