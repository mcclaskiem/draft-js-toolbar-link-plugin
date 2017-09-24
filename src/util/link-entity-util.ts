import { EditorState, Entity, Modifier } from 'draft-js'

export function isCurrentEntityLink(editorState: EditorState): boolean {
	if (!editorState) {
		return false
	}
	const sel = editorState.getSelection()
	const content = editorState.getCurrentContent()
	const contentBlock = content.getBlockForKey(sel.getStartKey())
	const entityKey = contentBlock.getEntityAt(sel.getStartOffset())
	if (!entityKey) {
		return false
	}
	const entityType = content.getEntity(entityKey).getType()
	return entityType && entityType.toUpperCase() === 'LINK'
}

export function getCurrentEntityLinkUrl(editorState: EditorState): string {
	if (!editorState) {
		return null
	}
	const sel = editorState.getSelection()
	const content = editorState.getCurrentContent()
	const contentBlock = content.getBlockForKey(sel.getStartKey())
	const entityKey = contentBlock.getEntityAt(sel.getStartOffset())
	if (!entityKey) {
		return null
	}
	const entity = content.getEntity(entityKey)
	const entityType = entity.getType()
	if (entityType && entityType.toUpperCase() === 'LINK') {
		const { url } = entity.getData()
		return url
	}
	return null
}

export function createOrUpdateLinkEntity(editorState: EditorState, url: string): EditorState {
	if (!editorState) {
		return null
	}
	const sel = editorState.getSelection()
	const content = editorState.getCurrentContent()
	if (isCurrentEntityLink(editorState)) {
		const entityKey = content.getBlockForKey(sel.getStartKey()).getEntityAt(sel.getStartOffset())
		const newContent = content.mergeEntityData(entityKey, {
			url
		})
		return EditorState.push(editorState, newContent, 'apply-entity')
	} else {
		const contentWithEntity = content.createEntity(
			'LINK',
			'MUTABLE',
			{ url }
		)
		const entityKey = contentWithEntity.getLastCreatedEntityKey()
		const contentStateWithLink = Modifier.applyEntity(
			contentWithEntity,
			sel,
			entityKey
		)
		return EditorState.push(editorState, contentStateWithLink, 'apply-entity')
	}
}

export function removeLinkEntity(editorState: EditorState): EditorState {
	if (!editorState) {
		return null
	}
	const sel = editorState.getSelection()
	const content = editorState.getCurrentContent()
	const newContent = Modifier.applyEntity(
		content,
		sel,
		null
	)
	return EditorState.push(editorState, newContent, 'apply-entity')
}
