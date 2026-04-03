'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CMSPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('pages')
  const [isSaving, setIsSaving] = useState(false)

  // Pages Content
  const pages = [
    { id: 1, title: 'Home', slug: '/', status: 'published', lastModified: '2024-03-28', views: 15420 },
    { id: 2, title: 'About Us', slug: '/about', status: 'published', lastModified: '2024-03-27', views: 8340 },
    { id: 3, title: 'Rooms & Suites', slug: '/rooms', status: 'published', lastModified: '2024-03-26', views: 12560 },
    { id: 4, title: 'Services', slug: '/services', status: 'published', lastModified: '2024-03-25', views: 6780 },
    { id: 5, title: 'Dining', slug: '/dining', status: 'draft', lastModified: '2024-03-24', views: 0 },
  ]

  // Blog Posts
  const posts = [
    { id: 1, title: 'Top 10 Luxury Amenities', category: 'Amenities', status: 'published', date: '2024-03-28', views: 3420 },
    { id: 2, title: 'Best Weekend Getaway Packages', category: 'Packages', status: 'published', date: '2024-03-27', views: 2890 },
    { id: 3, title: 'Michelin Star Dining Experience', category: 'Dining', status: 'published', date: '2024-03-26', views: 4150 },
    { id: 4, title: 'Spa Treatments Guide 2024', category: 'Wellness', status: 'draft', date: '2024-03-25', views: 0 },
  ]

  // Media Library
  const mediaItems = [
    { id: 1, name: 'hotel-exterior.jpg', type: 'image', size: '2.4 MB', uploaded: '2024-03-28' },
    { id: 2, name: 'lobby-panorama.jpg', type: 'image', size: '3.1 MB', uploaded: '2024-03-27' },
    { id: 3, name: 'presidential-suite.jpg', type: 'image', size: '2.8 MB', uploaded: '2024-03-26' },
    { id: 4, name: 'restaurant-interior.jpg', type: 'image', size: '2.2 MB', uploaded: '2024-03-25' },
    { id: 5, name: 'logo.png', type: 'image', size: '156 KB', uploaded: '2024-03-23' },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Changes saved successfully!')
    setIsSaving(false)
  }

  const tabs = [
    { id: 'pages', label: 'Pages', icon: '📄' },
    { id: 'blog', label: 'Blog Posts', icon: '✍️' },
    { id: 'media', label: 'Media Library', icon: '🖼️' },
    { id: 'seo', label: 'SEO Settings', icon: '🔍' }
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">📝 Content Management System</h1>
            <p className="text-[#2D4A42]">Manage your website content, media, and SEO</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary px-8 py-3 rounded-xl font-semibold cursor-pointer disabled:opacity-50"
          >
            {isSaving ? '⏳ Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-2xl p-2 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'glass hover:bg-gray-50 text-[#1A2E2B]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass-card rounded-2xl p-6 slide-up">
        
        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold gradient-text">📄 Website Pages</h2>
              <button className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer">
                ➕ Add New Page
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Title</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Slug</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Last Modified</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Views</th>
                    <th className="text-left py-4 px-4 font-semibold text-[#1A2E2B]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-[#1A2E2B]">{page.title}</span>
                      </td>
                      <td className="py-4 px-4 text-[#2D4A42] font-mono text-sm">{page.slug}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#2D4A42]">{page.lastModified}</td>
                      <td className="py-4 px-4 text-[#2D4A42]">{page.views.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="glass px-3 py-1 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium text-blue-600 cursor-pointer">
                            ✏️ Edit
                          </button>
                          <button className="glass px-3 py-1 rounded-lg hover:bg-green-50 transition-all text-sm font-medium text-green-600 cursor-pointer">
                            👁️ View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blog Posts Tab */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold gradient-text">✍️ Blog Posts</h2>
              <button className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer">
                ➕ Create New Post
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="glass-card rounded-2xl p-6 card-hover border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status}
                    </span>
                    <span className="text-xs text-[#2D4A42]">{post.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#1A2E2B] mb-2">{post.title}</h3>
                  <p className="text-sm text-[#2D4A42] mb-4">📅 {post.date} • 👁️ {post.views.toLocaleString()} views</p>

                  <div className="flex gap-2">
                    <button className="flex-1 glass px-4 py-2 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium text-blue-600 cursor-pointer">
                      ✏️ Edit
                    </button>
                    <button className="flex-1 glass px-4 py-2 rounded-xl hover:bg-green-50 transition-all text-sm font-medium text-green-600 cursor-pointer">
                      📊 Stats
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Library Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold gradient-text">🖼️ Media Library</h2>
              <button className="btn-primary px-6 py-3 rounded-xl font-semibold cursor-pointer">
                ⬆️ Upload New Media
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="text-4xl mb-2">☁️</div>
              <p className="text-[#1A2E2B] font-semibold mb-2">Drag & drop files here</p>
              <p className="text-sm text-[#2D4A42] mb-4">or click to browse (Images, Videos, Documents)</p>
              <button className="btn-primary px-6 py-2 rounded-xl font-semibold cursor-pointer">
                Select Files
              </button>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="glass-card rounded-xl overflow-hidden group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 relative flex items-center justify-center">
                    <span className="text-4xl opacity-50">🖼️</span>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="glass px-3 py-2 rounded-lg text-white font-semibold text-sm">
                        🔍 Preview
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#1A2E2B] truncate">{item.name}</p>
                    <p className="text-xs text-[#2D4A42] mt-1">{item.size} • {item.uploaded}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Settings Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">🔍 SEO Configuration</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 font-semibold">💡 SEO Best Practices</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm mt-2">
                <li>Keep meta titles under 60 characters</li>
                <li>Meta descriptions should be 150-160 characters</li>
                <li>Use relevant keywords naturally</li>
                <li>Add alt text to all images</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div>
                <label className="form-label">Default Meta Title</label>
                <input
                  type="text"
                  defaultValue="Grand Plaza Hotel - Luxury & Comfort Redefined"
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-[#2D4A42] mt-1">45/60 characters</p>
              </div>

              <div>
                <label className="form-label">Default Meta Description</label>
                <textarea
                  rows={4}
                  defaultValue="Experience world-class hospitality at Grand Plaza Hotel. Book your stay today for premium accommodations and exceptional service."
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-[#2D4A42] mt-1">128/160 characters</p>
              </div>

              <div>
                <label className="form-label">Meta Keywords (comma-separated)</label>
                <input
                  type="text"
                  defaultValue="luxury hotel, accommodation, suites, fine dining, spa, business center"
                  className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Open Graph Image URL</label>
                  <input
                    type="url"
                    defaultValue="/images/og-default.jpg"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="form-label">Twitter Handle</label>
                  <input
                    type="text"
                    defaultValue="@grandplazahotel"
                    className="input-field w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
