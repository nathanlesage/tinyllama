// Conversation store
import { defineStore } from 'pinia'
import type { Conversation } from 'src/providers/ConversationManager'
import { ref } from 'vue'

const ipcRenderer = window.ipc

export const useConversationStore = defineStore('conversation-store', () => {
  const conversations = ref<Conversation[]>([])
  const activeConversation = ref<string|undefined>(undefined)

  ipcRenderer.invoke('get-conversations').then((payload: Conversation[]) => {
    conversations.value = payload
  })

  ipcRenderer.invoke('get-active-conversation').then((payload: string|undefined) => {
    activeConversation.value = payload
  })

  // Listen to subsequent changes
  ipcRenderer.on('conversations-updated', (event, payload: Conversation[]) => {
    conversations.value = payload
  })

  ipcRenderer.on('conversation-updated', (event, payload: Conversation) => {
    const convIdx = conversations.value.findIndex(c => c.id === payload.id)
    if (convIdx < 0) {
      return
    }

    conversations.value.splice(convIdx, 1, payload)
  })

  ipcRenderer.on('active-conversation-changed', (event, payload: string|undefined) => {
    activeConversation.value = payload
  })

  function getCurrentConversation (): Conversation|undefined {
    return conversations.value.find(c => c.id === activeConversation.value)
  }

  return { conversations, activeConversation, getCurrentConversation }
})