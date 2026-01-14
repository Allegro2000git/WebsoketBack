export type User = {
    id: string
    name: string
    timeZone?: string
}

export type Message = {
    id: string
    message: string
    createdAt: string
    user: User
}