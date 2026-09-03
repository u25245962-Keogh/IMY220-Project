import { useState } from "react";
import Navbar from "../components/Navbar";
import SearchInput from "../components/SearchInput";
import Feed from "../components/Feed";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Search functionality implemented ltr not rn
    console.log("Searching for:", term);
  };

  return (
    <>
      <Navbar name="Home"></Navbar>
      <div className="home-container">
        <SearchInput onSearch={handleSearch} />
        <Feed />
      </div>
    </>
  );
}
export default Home;