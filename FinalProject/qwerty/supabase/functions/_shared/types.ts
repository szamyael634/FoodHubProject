export interface User {
  id: string
  email: string
  role: 'customer' | 'seller' | 'rider' | 'admin'
  first_name?: string
  last_name?: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  seller_id: string
  rider_id?: string
  status: string
  total_amount: number
  created_at: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
