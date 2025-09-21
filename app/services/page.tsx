import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wrench, Monitor, Wifi, HardDrive, Shield, Headphones } from "lucide-react"
import { VisitorHeader } from "@/components/visitor-header"

export default function ServicesPage() {
  const services = [
    {
      icon: <Monitor className="h-8 w-8" />,
      title: "Computer Repair & Maintenance",
      description: "Professional diagnosis and repair of desktops, laptops, and workstations",
      features: ["Hardware diagnostics", "Software troubleshooting", "Performance optimization", "Virus removal"],
    },
    {
      icon: <Wifi className="h-8 w-8" />,
      title: "Network Setup & Support",
      description: "Complete networking solutions for homes and small businesses",
      features: ["Router configuration", "WiFi optimization", "Network security", "Cable management"],
    },
    {
      icon: <HardDrive className="h-8 w-8" />,
      title: "Data Recovery & Backup",
      description: "Secure data recovery and backup solutions to protect your valuable information",
      features: ["Hard drive recovery", "Cloud backup setup", "Data migration", "Storage solutions"],
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Cybersecurity Solutions",
      description: "Comprehensive security services to protect your digital assets",
      features: ["Antivirus installation", "Firewall configuration", "Security audits", "Employee training"],
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "Custom PC Building",
      description: "Tailored computer builds for gaming, work, and specialized applications",
      features: ["Performance consulting", "Component selection", "Assembly & testing", "Warranty support"],
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "Technical Support",
      description: "Ongoing technical support and consultation for all your IT needs",
      features: ["Remote assistance", "On-site support", "Training sessions", "Maintenance plans"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <VisitorHeader />
      <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-balance">Our Services</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Comprehensive IT solutions and technical support services for individuals and small businesses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map((service, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <div className="text-emerald-600 mb-2">{service.icon}</div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      </main>
    </div>
  )
}
