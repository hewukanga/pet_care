/**
 * SM4 国产加密工具模块（前端）
 * 使用 sm-crypto 库进行 SM4 加密
 * 用于登录密码的前端加密传输
 */

import { sm4 } from 'sm-crypto'

/** SM4 加密密钥（128位十六进制字符串，与后端保持一致） */
const SM4_KEY = 'a3f7b2c9d1e8f4567890abcdef123456'

/**
 * 使用 SM4 算法加密明文数据
 * @param plainText 明文数据
 * @returns 加密后的十六进制密文字符串
 */
export function encryptSM4(plainText: string): string {
  return sm4.encrypt(plainText, SM4_KEY)
}

/**
 * 使用 SM4 算法解密密文数据
 * @param cipherText 十六进制密文
 * @returns 解密后的明文字符串
 */
export function decryptSM4(cipherText: string): string {
  return sm4.decrypt(cipherText, SM4_KEY)
}
