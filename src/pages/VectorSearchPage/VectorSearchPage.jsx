import React, { useState, useEffect } from 'react';
import VectorSearchBar from '../../components/VectorSearchBar/VectorSearchBar';
import SearchResultList from '../../components/SearchResultList/SearchResultList';
import { useSearchParams } from "react-router";
import { AllItemsPriceContext } from "../../contexts";
import { useContext } from "react";

const VectorSearchPage = ({ onSearch }) => {
  const [results, setResults] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsData = useContext(AllItemsPriceContext);

  useEffect(() => {
    console.log("VectorSearchPage mounted");
  }, []);
  /**
   * 
   * @param {*} query 
   * @returns 
   */
  const handleSearch = async (query) => {
    try {
      const searchResults = await onSearch(query);
      if (!searchResults) {
        console.error("searchResults is undefined");
        return;
      }
      const matchedResults = (searchResults || [])
        .map(result => {
          const item = itemsData[result.key];
          return item;
        })
        .filter(item => item);
      setResults(matchedResults);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  return (
    <div>
      <VectorSearchBar onSearch={handleSearch} />
      <SearchResultList results={results} />
    </div>
  );
};

export default VectorSearchPage;
