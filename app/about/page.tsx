import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Award, Clock, MapPin, Target, Heart } from "lucide-react"
import { VisitorHeader } from "@/components/visitor-header"

export default function AboutPage() {
  const stats = [
    { icon: <Users className="h-6 w-6" />, label: "Satisfied Clients", value: "100+" },
    { icon: <Clock className="h-6 w-6" />, label: "Years in Business", value: "12+" },
    { icon: <Award className="h-6 w-6" />, label: "Projects Completed", value: "200+" },
    { icon: <MapPin className="h-6 w-6" />, label: "Service Coverage", value: "Nationwide" },
  ]

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Global Standards",
      description: "Implementing world-class systems integration with professional services that meet international quality benchmarks.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Integrity",
      description: "Maintaining transparency and ethical practices in every project undertaking, building trust with our clients.",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Innovation",
      description: "Embracing constant innovations in the IT industry to deliver cutting-edge solutions and stay ahead of technology trends.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <VisitorHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-balance">About Unicom Technologies</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            An IT systems supplier providing quality computer hardware and application software to small and medium-sized
            businesses nationwide since February 2012.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-emerald-600 mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Our Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Unicom Technologies, Inc., established in February 2012, is an IT systems supplier that provides quality
                computer hardware and application software to small and medium-sized businesses (SMB) nationwide.
              </p>
              <p className="text-muted-foreground">
                Steadily transforming our company from reselling into an "end-to-end" data center designer and project
                developer. From infrastructure assessment to a complete computer systems supplier and auxiliary systems
                builder.
              </p>
              <p className="text-muted-foreground">
                We have also undertaken various data center installations for various Construction Developers and
                Builders, Architectural Firms, Office Fit Out Companies, among others.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To be recognized as a Unified Systems Integrator of Global Standards. Implementing professional services
                while maintaining integrity in every project undertaking.
              </p>
              <div className="space-y-2">
                <h4 className="font-medium">Our Approach:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                    Utilizing I.T. Best Practices
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                    Delivering cost-effective solutions
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                    Working alongside clients
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                    Long-term solutions to minimize expenditure
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                As Unicom transcends from a mere family-owned business towards our goal of being recognized as a
                world-class systems integrator supporting clients on a diversified scale, our company utilizes "I.T. Best
                Practices", using available resources to deliver cost-effective solutions to meet constant innovations in
                the Industry. We will continue working alongside our clients to implement the best approach possible,
                focusing on solving challenges by introducing long-term solutions to minimize customer expenditure.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="text-emerald-600 mb-2 flex justify-center">{value.icon}</div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
