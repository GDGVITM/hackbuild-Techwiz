
import { Button } from "@/components/ui/button"

const page = () => {
  return (
    <div className= "flex flex-col items-center justify-center h-screen" >
    <h1 className="text-2xl font-bold mb-4" > Welcome to Techwiz </h1>
      <Button variant = "default" size = "lg" className = "mb-4" >
        Get Started
          </Button>
          <Button variant = "secondary" size = "sm" >
            Learn More
              </Button>
              </div>
  )
}

export default page;