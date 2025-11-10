import { CalDAVClient } from "ts-caldav"
import { z } from "zod"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

export function registerDeleteEvent(client: CalDAVClient, server: McpServer) {
  server.tool(
    "delete-event",
    "Deletes an event in the calendar specified by its URL",
    { uid: z.string(), calendarUrl: z.string() },
    async ({ uid, calendarUrl }) => {
      try {
        await client.deleteEvent(calendarUrl, uid)
      } catch (error: unknown) {
        // Some CalDAV servers return 200 (OK) instead of 204 (No Content)
        // ts-caldav throws an error for 200, but both are valid success responses
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "status" in error.response &&
          error.response.status === 200
        ) {
          // Status 200 means deletion succeeded, continue
        } else {
          // Re-throw actual errors
          throw error
        }
      }
      return {
        content: [{ type: "text", text: "Event deleted" }],
      }
    },
  )
}
