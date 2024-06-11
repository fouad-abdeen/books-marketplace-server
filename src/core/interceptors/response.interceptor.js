/**
 * Intercepts the responses and standardizes the format of the response
 * Format: status + data
 */
export class ResponseInterceptor {
  intercept(content) {
    if (content && content.status === "error") return content;
    return new Response(content);
  }
}

/**
 * Success response
 */
class Response {
  status;
  data;

  constructor(data) {
    this.status = "success";
    this.data = data;
  }
}
