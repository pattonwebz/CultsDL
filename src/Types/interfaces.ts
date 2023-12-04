export interface Order {
    number: string
    date: string
    price: string
    link: string
    creations?: Creation[]
}

export interface Creation {
    title: string
    thumbnail: string
    link: string
    creator: string
}