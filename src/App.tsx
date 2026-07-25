import { Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import {
  HomePage,
  StoriesPage,
  StoryPage,
  ChildrenPage,
  GalleryPage,
  AboutPage,
  NotFoundPage,
  ContentManagerPage,
} from './pages'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="stories" element={<StoriesPage />} />
        <Route path="stories/:storyId" element={<StoryPage />} />
        <Route path="children" element={<ChildrenPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="about" element={<AboutPage />} />
        {import.meta.env.DEV && (
          <Route path="content-manager" element={<ContentManagerPage />} />
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
