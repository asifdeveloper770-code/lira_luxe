export async function addToCart(productId:string){

await supabase
.from("cart_items")
.insert({

user_id:user.id,

product_id:productId,

quantity:1

})

}