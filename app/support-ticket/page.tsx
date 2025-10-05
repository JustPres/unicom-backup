"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SupportTicketPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    issueType: "",
    description: "",
    priority: "medium",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          customerName: user.name,
          customerEmail: user.email,
        }),
      })

      if (response.ok) {
        toast.success("Support ticket submitted successfully!")
        router.push("/customer/tickets")
      } else {
        toast.error("Failed to submit ticket")
      }
    } catch (error) {
      toast.error("Failed to submit ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation centered />
        <div className="container mx-auto py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Please log in to submit a support ticket.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation centered />
      
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Submit Support Ticket</h1>
          <p className="text-gray-600 mt-2">We're here to help! Please provide details about your issue.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Support Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <Label htmlFor="issueType">Issue Type *</Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) => setFormData({ ...formData, issueType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="product">Product Question</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
