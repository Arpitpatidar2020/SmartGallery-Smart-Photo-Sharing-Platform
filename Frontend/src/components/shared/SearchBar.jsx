import { HiSearch, HiX } from 'react-icons/hi'

const SearchBar = ({ value, onChange, placeholder = 'Search images...' }) => {
  return (
    <div className="relative">
      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
        >
          <HiX className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
