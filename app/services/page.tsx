import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Server, Building2, Search, Package, Wrench, Headphones } from "lucide-react"
import { VisitorHeader } from "@/components/visitor-header"

export default function ServicesPage() {
  const services = [
    {
      icon: <Server className="h-8 w-8" />,
      title: "IT Systems Integration",
      description: "World-class systems integration services supporting clients on a diversified scale",
      features: ["End-to-end integration", "I.T. Best Practices", "Professional services", "Global standards compliance"],
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "Data Center Design & Installation",
      description: "Complete data center solutions from design to implementation",
      features: ["Data center design", "Project development", "Professional installation", "Construction support"],
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Infrastructure Assessment",
      description: "Comprehensive evaluation and planning for your IT infrastructure needs",
      features: ["Infrastructure audit", "Needs analysis", "Solution design", "Cost optimization"],
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Computer Hardware & Software Supply",
      description: "Quality computer hardware and application software for small and medium-sized businesses",
      features: ["Hardware procurement", "Software licensing", "System configuration", "Vendor partnerships"],
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "Auxiliary Systems Building",
      description: "Supporting systems installation and integration for complete IT solutions",
      features: ["Power systems", "Cooling solutions", "Cabling infrastructure", "Environmental controls"],
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "Technical Support & Consultation",
      description: "Ongoing technical support working alongside clients to implement best solutions",
      features: ["Long-term solutions", "Cost-effective approach", "Client partnership", "Continuous support"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <VisitorHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-balance">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Professional IT systems integration and data center solutions for small and medium-sized businesses nationwide
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
