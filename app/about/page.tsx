import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Award, Clock, MapPin, Target, Heart } from "lucide-react"

export default function AboutPage() {
  const stats = [
    { icon: <Users className="h-6 w-6" />, label: "Happy Customers", value: "2,500+" },
    { icon: <Clock className="h-6 w-6" />, label: "Years in Business", value: "15+" },
    { icon: <Award className="h-6 w-6" />, label: "Certified Technicians", value: "8" },
    { icon: <MapPin className="h-6 w-6" />, label: "Service Areas", value: "5" },
  ]

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Quality First",
      description: "We never compromise on quality. Every product and service meets our high standards.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Customer Care",
      description: "Your satisfaction is our priority. We build lasting relationships with personalized service.",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Expertise",
      description: "Our certified technicians stay current with the latest technology and best practices.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-balance">About Unicom Technologies</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
          Your trusted local partner for electronics, IT solutions, and technical support. Serving the community with
          reliable technology solutions since 2009.
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
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Founded in 2009 by tech enthusiasts who saw a need for reliable, affordable technology solutions in our
              community, Unicom Technologies has grown from a small repair shop to a comprehensive IT solutions
              provider.
            </p>
            <p className="text-muted-foreground">
              We started with a simple mission: make technology accessible and reliable for everyone. Today, we serve
              over 2,500 satisfied customers, from individual consumers to small businesses, providing everything from
              computer parts to complete IT infrastructure solutions.
            </p>
            <p className="text-muted-foreground">
              Our team of certified technicians combines years of experience with ongoing training to stay current with
              the latest technology trends and best practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To be the most trusted technology partner in our community by delivering reliable products, exceptional
              service, and cost-effective solutions that help our customers succeed in an increasingly digital world.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">What Sets Us Apart:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                  Personalized service and local expertise
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                  Competitive pricing without compromising quality
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                  Comprehensive warranty and support
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                  Community-focused approach
                </li>
              </ul>
            </div>
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

      {/* CTA */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Ready to Experience the Unicom Difference?</CardTitle>
          <CardDescription>
            Join thousands of satisfied customers who trust us with their technology needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Browse Our Catalog</Button>
            <Button variant="outline" size="lg">
              Contact Us Today
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
