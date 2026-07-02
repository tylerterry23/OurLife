import { ExternalLink, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  useDeleteWishlistItem,
  useUpdateWishlistItem,
  useWishlistItems,
} from '../hooks/useWishlist'

export function WishlistList() {
  const { data: items, isLoading, isError } = useWishlistItems()
  const updateItem = useUpdateWishlistItem()
  const deleteItem = useDeleteWishlistItem()

  if (isLoading) {
    return <p className="text-muted-foreground">Loading wishlist...</p>
  }

  if (isError) {
    return <p className="text-destructive">Couldn't load the wishlist.</p>
  }

  if (!items?.length) {
    return (
      <p className="text-muted-foreground">
        Wishlist is empty — add something you're hoping for.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <Card key={item.id} className={item.claimed ? 'opacity-60' : ''}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <Badge variant="outline" className="mb-2">
                added by {item.addedBy}
              </Badge>
              <CardTitle className="text-xl">{item.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete item"
              onClick={() => deleteItem.mutate(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm text-wine-bright hover:underline"
              >
                View item
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {item.notes && <p className="text-sm">{item.notes}</p>}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Claimed</span>
              <Switch
                checked={item.claimed}
                onCheckedChange={(claimed) =>
                  updateItem.mutate({ id: item.id, payload: { claimed } })
                }
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
