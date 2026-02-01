import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: App,
  staticData: {
    name: "",
    permission: "unauthed",
    icon: null,
  },
})

function App() {
  return null
}
