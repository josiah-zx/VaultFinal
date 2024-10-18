import React, {useState, useEffect} from 'react';
import { FaSearch } from 'react-icons/fa';
import { ImCross } from 'react-icons/im';

import './Search.css';


export const Search = () => {
    const [search, setSearch] = useState('');
    const [searchData, setSearchData] = useState([]);

    const handleChange = e => {
        setSearch(e.target.value)
    };

    const handleClose = () => {
        setSearch('');
        setSearchData([]);
    }

    useEffect(() => {
        if(search !== '') {
            fetch(`http://127.0.0.1:5000/search?q=${search}`)
            .then((res) => res.json())
            .then((data) => setSearchData(data));
        } else {
            setSearchData([]);
        }
    }, [search])

    return (
        <div className='search-section'>
            <div className='search-input-wrapper'>
                <div className='search-icon' > 
                    {search === '' ? (
                        <FaSearch />
                    ) : (
                        <ImCross onClick={handleClose} />
                    )}
                </div>
                <input
                    type='text'
                    className='search'
                    placeholder='Search...'
                    autoComplete='off'
                    onChange={handleChange}
                    value={search}
                />
            </div>
            <div className='search-result'>
                {searchData.map((data, index) => {
                    return (
                        <a 
                            href={data.username} 
                            key={index} 
                            target='_blank' 
                            className='search-suggestion-line'>
                            {data.username}
                        </a>
                    );
                })}
            </div>
        </div>
    );
};
export default Search;