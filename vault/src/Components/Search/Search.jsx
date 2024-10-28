import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
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
                        <Link
                            to={`/${data.username}`}
                            key={index} 
                            className='search-suggestion-line'
                            onClick={handleClose}
                        >
                            {data.username}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
export default Search;