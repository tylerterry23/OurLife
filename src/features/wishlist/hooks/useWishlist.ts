import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createWishlistItem,
  deleteWishlistItem,
  getWishlistItem,
  getWishlistItems,
  updateWishlistItem,
} from '../api/wishlistApi'
import type { WishlistItem } from '../types'

const wishlistKey = ['wishlist-items'] as const

export function useWishlistItems() {
  return useQuery({ queryKey: wishlistKey, queryFn: getWishlistItems })
}

export function useWishlistItem(id: string) {
  return useQuery({
    queryKey: [...wishlistKey, id],
    queryFn: () => getWishlistItem(id),
    enabled: Boolean(id),
  })
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<WishlistItem, 'id' | 'createdAt'>) =>
      createWishlistItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKey })
    },
  })
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<WishlistItem>
    }) => updateWishlistItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKey })
    },
  })
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWishlistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKey })
    },
  })
}
