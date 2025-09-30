//import { Tldraw } from 'tldraw'
//import 'tldraw/tldraw.css'
// App.tsx or App.jsx
import React from 'react'
import { Tldraw, Editor, toRichText } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

const App = () => {
  const handleMount = (editor: Editor) => {
		editor.createShape({
			type: 'text',
			x: 200,
			y: 200,
			props: {
				richText: toRichText('Hello world!'),
			},
		})

		editor.selectAll()

		editor.zoomToSelection({
			animation: { duration: 5000 },
		})
	}

	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw onMount={handleMount} />
		</div>
	)
}

export default App


