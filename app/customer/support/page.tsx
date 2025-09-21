"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, Mail, MapPin, Clock, MessageCircle, FileText } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth"

export default function CustomerSupportPage() {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation centered />
      <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-balance">Customer Support</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Get help when you need it. Our expert support team is here to assist you with all your technical needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">(555) 123-TECH</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@unicomtech.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Visit Our Store</p>
                  <p className="text-sm text-muted-foreground">123 Tech Street, Digital City, DC 12345</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM, Sat: 10AM-4PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Support Request</CardTitle>
            <CardDescription>Describe your issue and we'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder={user?.name?.split(' ')[0] || "John"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder={user?.name?.split(' ')[1] || "Doe"} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder={user?.email || "john@example.com"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" type="tel" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Brief description of your issue" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Please describe your issue in detail..." className="min-h-[120px]" />
            </div>
            <Button className="w-full">Submit Support Request</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">What are your support hours?</h4>
            <p className="text-sm text-muted-foreground">
              Our support team is available Monday-Friday 9AM-6PM and Saturday 10AM-4PM. Emergency support is available
              24/7 for critical issues.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Do you offer remote support?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, we provide secure remote support for software issues, troubleshooting, and system maintenance when
              possible.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">What's included in your warranty?</h4>
            <p className="text-sm text-muted-foreground">
              All products come with manufacturer warranty plus our 30-day satisfaction guarantee. Labor warranties vary
              by service type.
            </p>
          </div>
        </CardContent>
      </Card>
      </main>
    </div>
  )
}