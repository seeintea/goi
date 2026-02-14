import { Link } from "@tanstack/react-router"

export function NotFound() {
  return (
    <div className="space-y-2 p-2">
      <div className="text-gray-600 dark:text-gray-400">
        404 Not Found
      </div>
      <p className="text-sm">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="text-blue-500 hover:underline">
        Go Home
      </Link>
    </div>
  )
}
