"use client"

import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const stats = [
  { label: "Revenue", value: "$45,231", change: "+20.1%" },
  { label: "Subscriptions", value: "2,350", change: "+180" },
  { label: "Active users", value: "573", change: "+12%" },
  { label: "Churn", value: "1.2%", change: "-0.3%" },
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="A quick tour of the base and common components in this kit."
        actions={
          <Button onClick={() => toast.success("Item created")}>
            <PlusIcon data-icon="inline-start" />
            New item
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{stat.change}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="buttons">
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="empty">Empty state</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons">
          <Card>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <ConfirmDialog
                trigger={
                  <Button variant="destructive">
                    <Trash2Icon data-icon="inline-start" />
                    Delete (confirm)
                  </Button>
                }
                title="Delete this item?"
                description="This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={async () => {
                  await wait(800)
                  toast.success("Item deleted")
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => toast("Default toast")}>
                  Toast
                </Button>
                <Button variant="outline" onClick={() => toast.success("Saved!")}>
                  Success
                </Button>
                <Button variant="outline" onClick={() => toast.error("Something went wrong")}>
                  Error
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.promise(wait(1500), {
                      loading: "Saving...",
                      success: "Done",
                      error: "Failed",
                    })
                  }
                >
                  Promise
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empty">
          <Card>
            <CardContent>
              <EmptyState
                title="No projects yet"
                description="Create your first project to get started."
                action={
                  <Button>
                    <PlusIcon data-icon="inline-start" />
                    Create project
                  </Button>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
