// Mock Data Store
const CATEGORIES = ['All', 'Men', 'Women', 'Boys', 'Girls'];
const MATERIALS = ['All', 'Cotton', 'Silk', 'Denim', 'Linen', 'Wool', 'Synthetic'];

const rnd = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const massiveCatalog = [];
const adjectives = ["Trendy", "Classic", "Premium", "Signature", "Casual", "Elegant", "Vintage", "Modern", "Urban", "Chic"];

const inventory = {
    'Men': [
        { type: 'T-Shirt', img: 'assets/men_tshirt.png' },
        { type: 'Shirt', img: 'assets/men_shirt.png' },
        { type: 'Innerwear', img: 'assets/men_innerwear.png' },
        { type: 'Pants', img: 'assets/men_pants.png' },
        { type: 'Rough Use', img: 'assets/men_roughuse.png' },
        { type: 'Jacket', img: 'assets/men_jacket.png' },
        { type: 'Formal Suit', img: 'assets/men_suit.png' }
    ],
    'Women': [
        { type: 'Dress', img: 'assets/women_dress.png' },
        { type: 'Top', img: 'assets/women_top.png' },
        { type: 'Skirt', img: 'assets/women_skirt.png' },
        { type: 'Activewear', img: 'assets/women_activewear.png' },
        { type: 'Saree', img: 'assets/women_saree.png' },
        { type: 'Kurti', img: 'assets/women_kurti.png' },
        { type: 'Lehenga', img: 'assets/women_lehenga.png' }
    ],
    'Boys': [
        { type: 'T-Shirt', img: 'assets/boys_tshirt.png' },
        { type: 'Pants', img: 'assets/boys_pants.png' },
        { type: 'Ethnic Wear', img: 'assets/boys_ethnic.png' }
    ],
    'Girls': [
        { type: 'Dress', img: 'assets/girls_dress.png' },
        { type: 'Skirt', img: 'assets/girls_skirt.png' },
        { type: 'Party Frock', img: 'assets/girls_frock.png' }
    ]
};

let pid = 1;
Object.keys(inventory).forEach(cat => {
    inventory[cat].forEach(item => {
        // Create 2 variants for each type
        for(let i=0; i<2; i++) {
            let adj = adjectives[rndInt(0, adjectives.length - 1)];
            let mat = MATERIALS[rndInt(1, MATERIALS.length - 1)];
            let title = `${adj} ${mat} ${item.type}`;
            
            massiveCatalog.push({
                id: pid++,
                title: title,
                price: parseFloat(rnd(399, 3999)),
                category: cat,
                material: mat,
                image: item.img,
                rating: rnd(4.0, 5.0),
                reviewsCount: rndInt(10, 500),
                description: `Experience the finest quality with our ${title}. Perfect for your everyday needs. Comfortable, stylish, and highly durable.`
            });
        }
    });
});

const PRODUCTS = massiveCatalog;

const REVIEWS = {
    1: [
        { user: "Michael T.", rating: 5, date: "2 days ago", text: "Fit is perfect. Quality is unmatched." },
        { user: "David L.", rating: 4, date: "1 week ago", text: "Great quality." }
    ]
};
