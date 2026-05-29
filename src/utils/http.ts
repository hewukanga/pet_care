/**
 * HTTP 请求工具模块
 * 提供通用的 HTTP 请求封装能力
 */

/**
 * 带超时的 fetch 封装
 * 在超时后通过 AbortController 主动取消请求
 *
 * @param url 请求地址
 * @param options fetch 选项
 * @param timeoutMs 超时毫秒数，默认 8000
 * @returns Response
 * @throws 超时时抛出 AbortError
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 从 Response 中提取错误信息并抛出
 * 用于统一处理 API 请求的非 OK 响应
 *
 * @param res fetch Response 对象
 * @param fallbackPrefix 错误消息前缀
 * @throws 始终抛出，不会正常返回
 */
export async function throwOnError(
  res: Response,
  fallbackPrefix = '请求失败'
): Promise<never> {
  const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
  throw new Error(err.message || `${fallbackPrefix} (${res.status})`)
}

/**
 * 检查响应是否 OK，否则抛出错误
 *
 * @param res fetch Response 对象
 * @param fallbackPrefix 错误消息前缀
 * @returns 原 Response
 * @throws 非 OK 响应时抛出
 */
export async function assertOk(
  res: Response,
  fallbackPrefix = '请求失败'
): Promise<Response> {
  if (!res.ok) {
    await throwOnError(res, fallbackPrefix)
  }
  return res
}