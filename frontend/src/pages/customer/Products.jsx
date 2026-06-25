import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts } from '../../store/slices/productSlice'
import ProductCard from '../../components/ProductCard'
import { FiFilter, FiChevronDown } from 'react-icons/fi'

const sortOptions = [
  { label: 'Newest', value: '-created_at' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-average_rating' },
  { label: 'Most Popular', value: '-views_count' },
]

export default function Products() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector(s => s.products)
  const [params, setParams] = useSearchParams()
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('-created_at')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const q = new URLSearchParams(params)
    if (sort) q.set('ordering', sort)
    if (minPrice) q.set('min_price', minPrice)
    if (maxPrice) q.set('max_price', maxPrice)
    dispatch(fetchProducts(q.toString()))
  }, [params, sort, minPrice, maxPrice])

  const results = list?.results || list || []
  const count = list?.count || results.length

  const applyFilter = () => {
    const q = new URLSearchParams(params)
    if (minPrice) q.set('min_price', minPrice); else q.delete('min_price')
    if (maxPrice) q.set('max_price', maxPrice); else q.delete('max_price')
    setParams(q)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {params.get('search') ? `Results for "${params.get('search')}"` :
             params.get('category') ? params.get('category').charAt(0).toUpperCase() + params.get('category').slice(1) :
             'All Products'}
          </h1>
          <p className="text-gray-500 text-sm">{count} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
            <FiFilter size={14} /> Filters
          </button>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {filtersOpen && (
        <div className="bg-white border rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Min Price (₹)</label>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
              placeholder="0" className="input w-32 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Max Price (₹)</label>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              placeholder="Any" className="input w-32 text-sm" />
          </div>
          <button onClick={applyFilter} className="btn-primary text-sm">Apply</button>
          <button onClick={() => { setMinPrice(''); setMaxPrice(''); setParams({}) }} className="btn-secondary text-sm">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="card h-72 animate-pulse bg-gray-100" />)}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-gray-500">Try different keywords or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
