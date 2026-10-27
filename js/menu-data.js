/**
 * United Restaurant - Menu Catalog & Management Engine
 * Role-Based Access: Admin can edit dishes/prices; Staff & Customers have read-only access.
 */

window.DEFAULT_MENU_ITEMS = [
  {
    "id": "bd-1",
    "category": "bangladeshi",
    "name": "Kacchi Biryani",
    "desc": "Slow-cooked tender baby mutton marinated in saffron ghee, layered with premium Chinigura rice, golden potatoes, and served with rich Borhani.",
    "price": 780,
    "badge": "Signature",
    "img": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "bd-2",
    "category": "bangladeshi",
    "name": "Fuchka (10 Pcs)",
    "desc": "Crispy golden semolina shells stuffed with spiced potato and chickpea mix, chopped green chilies, grated egg, and served with chilled tangy tamarind water (tok).",
    "price": 220,
    "badge": "Street Classic",
    "img": "images/fuchka.png"
  },
  {
    "id": "bd-3",
    "category": "bangladeshi",
    "name": "Shorshe Ilish",
    "desc": "Freshly caught prime Padma River Hilsa fish steak simmered in stone-ground mustard paste, slit green chilies, and cold-pressed pure mustard oil.",
    "price": 950,
    "badge": "River Fresh",
    "img": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "bd-4",
    "category": "bangladeshi",
    "name": "Beef Tehari",
    "desc": "Old Dhaka heritage recipe: Aromatic Chinigura rice sautéed in fragrant mustard oil, loaded with tender spiced beef morsels and whole green chilies.",
    "price": 580,
    "badge": "Dhaka Special",
    "img": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "bd-5",
    "category": "bangladeshi",
    "name": "Chittagong Beef Kala Bhuna",
    "desc": "Slow-roasted prime tender beef cubes deeply caramelized with toasted black spices, fried shallots, garlic, and wild coriander.",
    "price": 690,
    "badge": "Chittagong Royal",
    "img": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "bd-6",
    "category": "bangladeshi",
    "name": "Biye Bari Chicken Roast & Polao",
    "desc": "Golden chicken quarter braised in yogurt, cashew nut paste, and whole aromatic garam masala, served with fragrant Chinigura polao.",
    "price": 540,
    "badge": "Wedding Platter",
    "img": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "bd-7",
    "category": "bangladeshi",
    "name": "Morog Polao",
    "desc": "Royal celebration dish of bone-in chicken slow-cooked with ghee-laden Chinigura rice, sweet raisins, crisp fried onions, and boiled egg.",
    "price": 590,
    "badge": "Mughlai Style",
    "img": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "bd-8",
    "category": "bangladeshi",
    "name": "Chui Jhal Mutton Curry",
    "desc": "Southern Khulna signature tender baby mutton simmered slowly with fiery Chui Jhal pepper vine twigs and whole caramelized garlic pods.",
    "price": 750,
    "badge": "Khulna Special",
    "img": "https://images.unsplash.com/photo-1545247181-516773cae754?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "bd-9",
    "category": "bangladeshi",
    "name": "Bhuna Khichuri Platter",
    "desc": "Roasted moong lentil and Chinigura rice cooked in country ghee, served with rich slow-cooked beef bhuna, begun bhaja, and dimer chop.",
    "price": 620,
    "badge": "Rainy Day Feast",
    "img": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "bd-10",
    "category": "bangladeshi",
    "name": "Prawn Malai Curry",
    "desc": "Freshwater jumbo river prawns poached gently in a velvety coconut milk gravy perfumed with green cardamom, cloves, and mild green chilies.",
    "price": 820,
    "badge": "Coastal Delight",
    "img": "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "in-1",
    "category": "indian",
    "name": "Masala Dosa",
    "desc": "Large, wafer-crisp fermented rice-lentil crepe rolled with aromatic potato masala, served with hot vegetable sambar and coconut chutney.",
    "price": 380,
    "badge": "South Indian",
    "img": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "in-2",
    "category": "indian",
    "name": "Hyderabadi Biryani",
    "desc": "Authentic royal Nizami dum biryani cooked sealed in handi with marinated meat, saffron-infused long-grain basmati rice, and fried onions.",
    "price": 720,
    "badge": "Nizami Dum",
    "img": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "in-3",
    "category": "indian",
    "name": "Samosa (3 Pcs)",
    "desc": "Golden flaky pastry triangles stuffed with spiced cumin potatoes, green peas, and cashews, with mint and sweet tamarind chutneys.",
    "price": 240,
    "badge": "Crispy Snack",
    "img": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "in-4",
    "category": "indian",
    "name": "Palak Paneer",
    "desc": "Fresh handmade cottage cheese cubes simmered gently in a silky garlic-scented spinach puree finished with fresh dairy cream.",
    "price": 520,
    "badge": "North Indian",
    "img": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "in-5",
    "category": "indian",
    "name": "Old Delhi Butter Chicken",
    "desc": "Charred tandoor-roasted boneless chicken steeped in a velvety tomato-fenugreek sauce with churned country butter and fresh cream.",
    "price": 680,
    "badge": "Mughlai Classic",
    "img": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "in-6",
    "category": "indian",
    "name": "Kashmiri Mutton Rogan Josh",
    "desc": "Tender baby mutton pieces braised in an aromatic crimson Kashmiri chili and whole spice gravy, scented with crushed fennel and dry ginger.",
    "price": 760,
    "badge": "Kashmiri Special",
    "img": "https://images.unsplash.com/photo-1545247181-516773cae754?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "in-7",
    "category": "indian",
    "name": "Murgh Malai Tikka",
    "desc": "Melt-in-mouth chicken supreme morsels steeped in rich clotted cream, cardamom, mild cheese, and roasted over natural charcoal.",
    "price": 640,
    "badge": "Charcoal Skewer",
    "img": "images/murgh-malai-tikka.jpg"
  },
  {
    "id": "in-8",
    "category": "indian",
    "name": "Dal Makhani & Garlic Naan",
    "desc": "Black urad lentils slow-simmered for 24 hours with butter and cream, accompanied by a fresh hot tandoor-baked garlic butter naan.",
    "price": 460,
    "badge": "Slow Simmered",
    "img": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "in-9",
    "category": "indian",
    "name": "Chana Bhatura",
    "desc": "Giant golden puffed bhatura served with spicy dark Amritsari chickpeas, tangy pickled carrots, sliced onions, and mint chutney.",
    "price": 390,
    "badge": "Punjabi Classic",
    "img": "images/chana-bhatura.jpg"
  },
  {
    "id": "in-10",
    "category": "indian",
    "name": "Tandoori Jumbo Prawns",
    "desc": "King tiger prawns marinated in carom seeds, ginger-garlic paste, Greek yogurt, and crushed tandoor spices, charred to perfection.",
    "price": 890,
    "badge": "Tandoor Special",
    "img": "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-1",
    "category": "mexican",
    "name": "Tacos (3 Pcs)",
    "desc": "Soft warm artisanal corn tortillas stuffed with marinated carne asada steak or grilled chicken, fresh cilantro, onions, and charred tomato salsa.",
    "price": 560,
    "badge": "Street Tacos",
    "img": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-2",
    "category": "mexican",
    "name": "Tamales (2 Pcs)",
    "desc": "Stone-ground masa dough wrapped in natural corn husks, stuffed with slow-braised shredded beef tinga, steamed tender, and drizzled with ancho salsa.",
    "price": 480,
    "badge": "Ancestral Recipe",
    "img": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-3",
    "category": "mexican",
    "name": "Elote (Street Corn)",
    "desc": "Flame-charred sweet corn on the cob brushed with tangy chipotle crema, rolled in crumbled Cotija cheese, smoked paprika, and fresh lime.",
    "price": 320,
    "badge": "Street Snack",
    "img": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-4",
    "category": "mexican",
    "name": "Mole Poblano",
    "desc": "Tender braised chicken bathed in Puebla’s legendary 28-ingredient sauce combining toasted dried chiles, dark cocoa, spices, and sesame seeds.",
    "price": 680,
    "badge": "Heritage Mole",
    "img": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-5",
    "category": "mexican",
    "name": "Pozole Rojo",
    "desc": "Traditional comforting Mexican broth simmered with tender shredded meat, giant nixtamalized hominy corn kernels, guajillo peppers, and radish.",
    "price": 620,
    "badge": "Comfort Soup",
    "img": "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-6",
    "category": "mexican",
    "name": "Sizzling Cast-Iron Fajitas",
    "desc": "Marinated beef skirt steak and chicken breast strips sizzling with sweet bell peppers and onions, served with warm tortillas and fresh guacamole.",
    "price": 790,
    "badge": "Sizzling Platter",
    "img": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-7",
    "category": "mexican",
    "name": "Loaded Nachos Supreme",
    "desc": "Crisp hand-cut tortilla chips layered with melted cheddar-jack cheese sauce, spiced black beans, jalapeños, pico de gallo, and cool sour cream.",
    "price": 520,
    "badge": "Crowd Favorite",
    "img": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-8",
    "category": "mexican",
    "name": "Cheesy Enchiladas Verdes",
    "desc": "Rolled corn tortillas filled with seasoned chicken, smothered in tangy roasted tomatillo green salsa, baked Monterey Jack cheese, and Mexican crema.",
    "price": 590,
    "badge": "Baked Specialty",
    "img": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-9",
    "category": "mexican",
    "name": "Quesadilla con Pollo",
    "desc": "Large crispy folded flour tortilla stuffed with grilled seasoned chicken, caramelized bell peppers, and melted Oaxaca cheese with fire-roasted salsa.",
    "price": 490,
    "badge": "Griddle Melt",
    "img": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "mx-10",
    "category": "mexican",
    "name": "Churros with Mexican Chocolate",
    "desc": "Golden crisp extruded pastry wands dusted in fragrant cinnamon sugar, accompanied by a decadent cup of thick spiced Mexican dark chocolate.",
    "price": 360,
    "badge": "Sweet Finale",
    "img": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-1",
    "category": "chinese",
    "name": "Dan Dan Noodles",
    "desc": "Springy hand-pulled noodles tossed in toasted sesame paste, chili oil, Sichuan peppercorns, crispy minced beef, and Sui Mi Ya Cai preserved greens.",
    "price": 580,
    "badge": "Sichuan Spicy",
    "img": "https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-2",
    "category": "chinese",
    "name": "Kung Pao Chicken",
    "desc": "Wok-seared tender chicken dices tossed with dry whole red chilies, roasted crunchy peanuts, scallion hearts, and sweet-sour Sichuan glaze.",
    "price": 640,
    "badge": "Classic Wok",
    "img": "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-3",
    "category": "chinese",
    "name": "Mapo Tofu",
    "desc": "Velvety silken tofu cubes and minced beef simmered in authentic Pixian fermented broad bean paste, infused with fragrant roasted Sichuan pepper oil.",
    "price": 540,
    "badge": "Chengdu Special",
    "img": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-4",
    "category": "chinese",
    "name": "Beef Chow Fun",
    "desc": "Wide flat rice noodles flash-seared over intense high wok heat with tender marinated flank steak, crisp bean sprouts, garlic chives, and premium dark soy.",
    "price": 620,
    "badge": "Cantonese Classic",
    "img": "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-5",
    "category": "chinese",
    "name": "Szechuan Crispy Shredded Beef",
    "desc": "Double-fried shredded crispy beef glazed in a sticky, spicy sweet chili garlic sauce with julienned carrots, scallions, and toasted sesame.",
    "price": 690,
    "badge": "Crispy & Spicy",
    "img": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-6",
    "category": "chinese",
    "name": "Imperial Dim Sum Basket (6 Pcs)",
    "desc": "Handcrafted translucent crystal har gow shrimp dumplings and chicken siu mai steamed in bamboo baskets with house chili crisp.",
    "price": 590,
    "badge": "Steamed Fresh",
    "img": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-7",
    "category": "chinese",
    "name": "Cantonese Sweet & Sour Chicken",
    "desc": "Crispy tempura-battered chicken tossed with fresh sweet pineapple chunks, tri-color bell peppers, and natural wok-reduced sweet and sour glaze.",
    "price": 580,
    "badge": "Hong Kong Style",
    "img": "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-8",
    "category": "chinese",
    "name": "Peking Duck Spring Rolls (4 Pcs)",
    "desc": "Handmade crisp golden pastry rolls stuffed with shredded roast duck breast, fresh cucumber matchsticks, and sweet hoisin reduction.",
    "price": 480,
    "badge": "Golden Crispy",
    "img": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-9",
    "category": "chinese",
    "name": "Wok-Tossed Hakka Chili Garlic Prawns",
    "desc": "Succulent jumbo prawns flash-seared with crushed garlic cloves, fiery birds-eye chilies, scallions, and oyster soy reduction.",
    "price": 780,
    "badge": "Seafood Sizzle",
    "img": "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "cn-10",
    "category": "chinese",
    "name": "Yang Chow Fried Rice",
    "desc": "Fragrant jasmine rice wok-tossed with tender roast chicken, fresh bay shrimp, sweet corn, green peas, and scrambled egg ribbons.",
    "price": 490,
    "badge": "Imperial Rice",
    "img": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-1",
    "category": "italian",
    "name": "Spaghetti alla Carbonara",
    "desc": "Bronze-die spaghetti coated in a rich emulsion of fresh egg yolks, crispy cured smoked beef bacon, coarse black pepper, and aged Pecorino Romano.",
    "price": 680,
    "badge": "Roman Recipe",
    "img": "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-2",
    "category": "italian",
    "name": "Lasagna al Forno",
    "desc": "Handmade egg pasta sheets layered with slow-cooked Bolognese beef ragù, velvety nutmeg-scented béchamel sauce, and blistered mozzarella.",
    "price": 720,
    "badge": "Bolognese",
    "img": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-3",
    "category": "italian",
    "name": "Bistecca alla Fiorentina",
    "desc": "Thick Florentine T-bone steak flame-grilled over natural charcoal, drizzled with cold-pressed Tuscan olive oil, sea salt flakes, and fresh rosemary.",
    "price": 1650,
    "badge": "Tuscan Cut",
    "img": "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-4",
    "category": "italian",
    "name": "Tiramisu",
    "desc": "Savoiardi ladyfingers soaked in double-shot Arabica espresso, layered with whipped Italian mascarpone cream and dusted with Valrhona cocoa.",
    "price": 420,
    "badge": "House Dessert",
    "img": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-5",
    "category": "italian",
    "name": "Wood-Fired Pizza Margherita D.O.P",
    "desc": "Crushed San Marzano tomatoes, creamy buffalo mozzarella fior di latte, fresh sweet basil leaves, and cold-pressed extra virgin olive oil.",
    "price": 650,
    "badge": "Wood Fired",
    "img": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-6",
    "category": "italian",
    "name": "Truffle Wild Mushroom Fettuccine",
    "desc": "Artisan fettuccine ribbons tossed in a rich black truffle cream sauce with sautéed porcini and button mushrooms, topped with Parmigiano.",
    "price": 780,
    "badge": "Truffle Cream",
    "img": "images/truffle-mushroom-fettuccine.png"
  },
  {
    "id": "it-7",
    "category": "italian",
    "name": "Pan-Seared Tuscan Salmon Fillet",
    "desc": "Crisp-skinned Norwegian salmon fillet served on a bed of sundried tomato, baby spinach, and garlic-infused white cream reduction.",
    "price": 1150,
    "badge": "Atlantic Fresh",
    "img": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-8",
    "category": "italian",
    "name": "Risotto ai Funghi Porcini",
    "desc": "Creamy Carnaroli rice slow-stirred with vegetable broth, wild dried porcini mushrooms, butter, and aged 24-month Parmigiano-Reggiano.",
    "price": 740,
    "badge": "Northern Italian",
    "img": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-9",
    "category": "italian",
    "name": "Penne all Arrabbiata",
    "desc": "Al dente penne pasta tossed in a spicy San Marzano tomato reduction with crushed Calabrian chili flakes, fresh garlic, and sweet basil.",
    "price": 560,
    "badge": "Fiery Roman",
    "img": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "it-10",
    "category": "italian",
    "name": "Panna Cotta al Caramello",
    "desc": "Silky chilled Madagascan vanilla bean cooked cream topped with salted caramel glaze and toasted almond flakes.",
    "price": 380,
    "badge": "Piedmont Dessert",
    "img": "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-1",
    "category": "american",
    "name": "Chicken Nuggets (8 Pcs)",
    "desc": "Crispy buttermilk-battered 100% chicken breast bites seasoned with garlic pepper, served with golden steak fries, honey mustard, and smoky BBQ dip.",
    "price": 420,
    "badge": "Crispy Bites",
    "img": "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-2",
    "category": "american",
    "name": "Four-Cheese Mac n Cheese",
    "desc": "Elbow macaroni tossed in a velvety sauce of sharp aged cheddar, gruyère, and parmesan, baked with a toasted garlic-herb panko breadcrumb crust.",
    "price": 490,
    "badge": "Ultimate Comfort",
    "img": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-3",
    "category": "american",
    "name": "Prime Striploin Steak (280g)",
    "desc": "Cast-iron seared prime beef striploin basted in thyme-garlic butter, served with truffle mashed potatoes and peppercorn jus.",
    "price": 1450,
    "badge": "Prime Cut",
    "img": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-4",
    "category": "american",
    "name": "Classic American Beef Hot Dog",
    "desc": "Smoked all-beef grilled frankfurter tucked into a butter-toasted brioche bun, loaded with sweet relish, yellow mustard, ketchup, and crispy onions.",
    "price": 380,
    "badge": "All-American",
    "img": "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-5",
    "category": "american",
    "name": "United Wagyu Prime Smash Burger",
    "desc": "Double smash Wagyu beef patties, melted American cheese, caramelized onions, crisp pickles, and secret burger sauce in toasted brioche bun.",
    "price": 680,
    "badge": "House Burger",
    "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-6",
    "category": "american",
    "name": "Texas Smoked BBQ Beef Short Ribs",
    "desc": "Slow-smoked 8 hours over hickory hardwood, brushed with sweet tangy Kansas City BBQ glaze, served with creamy slaw and waffle fries.",
    "price": 1350,
    "badge": "Hickory Smoked",
    "img": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-7",
    "category": "american",
    "name": "Nashville Crispy Hot Chicken",
    "desc": "Giant double-fried crispy chicken breast glazed with cayenne-infused hot oil, served on thick Texas toast with crinkle-cut dill pickles.",
    "price": 590,
    "badge": "Fiery Crisp",
    "img": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-8",
    "category": "american",
    "name": "Crispy Buffalo Chicken Wings (8 Pcs)",
    "desc": "Crisp fried jumbo wings drenched in tangy cayenne pepper butter hot sauce, served with crunchy celery sticks and creamy blue cheese dip.",
    "price": 540,
    "badge": "Game Day Classic",
    "img": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-9",
    "category": "american",
    "name": "Philadelphia Cheesesteak",
    "desc": "Thinly sliced griddled ribeye steak with caramelized onions and green peppers smothered under melted provolone in a crusty Italian hoagie roll.",
    "price": 690,
    "badge": "Philly Classic",
    "img": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "us-10",
    "category": "american",
    "name": "New York Baked Cheesecake",
    "desc": "Rich, dense, and velvety baked cream cheese cake on a golden buttery graham cracker crust, topped with fresh strawberry compote.",
    "price": 440,
    "badge": "NY Classic",
    "img": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-1",
    "category": "japanese",
    "name": "Tokyo Shoyu Ramen",
    "desc": "Slow-simmered rich dashi broth, handmade springy ramen noodles, tender braised beef chashu, ajitsuke soft-boiled egg, nori, and bamboo shoots.",
    "price": 750,
    "badge": "House Ramen",
    "img": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-2",
    "category": "japanese",
    "name": "Hakka Noodles",
    "desc": "Wok-tossed noodles with shredded vegetables, toasted sesame oil, and light savory soy-garlic seasoning.",
    "price": 480,
    "badge": "Wok Tossed",
    "img": "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-3",
    "category": "japanese",
    "name": "Deluxe Sushi Platter (8 Pcs)",
    "desc": "Chef selection of fresh salmon nigiri, tuna nigiri, California crab maki, and avocado rolls served with pickled gari and wasabi.",
    "price": 890,
    "badge": "Fresh Nigiri & Maki",
    "img": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-4",
    "category": "japanese",
    "name": "Onigiri Rice Balls (2 Pcs)",
    "desc": "Handmade triangular sushi rice balls wrapped in crisp toasted nori seaweed, filled with seasoned flaked salmon and savory furikake.",
    "price": 320,
    "badge": "Hand Crafted",
    "img": "images/onigiri.jpg"
  },
  {
    "id": "jp-5",
    "category": "japanese",
    "name": "Kitsune Udon",
    "desc": "Thick, chewy Sanuki udon noodles in clear dashi broth, topped with sweet seasoned aburaage fried tofu pouch, wakame, and scallions.",
    "price": 650,
    "badge": "Comfort Udon",
    "img": "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-6",
    "category": "japanese",
    "name": "Zaru Soba",
    "desc": "Chilled 100% buckwheat noodles served on bamboo zaru with chilled tsuyu dipping broth, freshly grated wasabi, daikon, and scallions.",
    "price": 580,
    "badge": "Chilled Soba",
    "img": "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-7",
    "category": "japanese",
    "name": "Takoyaki Balls (6 Pcs)",
    "desc": "Golden crispy batter spheres stuffed with tender octopus morsels, glazed with sweet takoyaki sauce, Japanese mayo, and dancing bonito flakes.",
    "price": 460,
    "badge": "Osaka Street Food",
    "img": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-8",
    "category": "japanese",
    "name": "Ebi & Vegetable Tempura Platter",
    "desc": "Jumbo tiger prawns and seasonal vegetables in feather-light crisp tempura batter, served with warm dashi dipping broth and grated ginger.",
    "price": 680,
    "badge": "Crisp & Feather-Light",
    "img": "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-9",
    "category": "japanese",
    "name": "Chicken Katsu Curry",
    "desc": "Panko-crusted crispy fried chicken cutlet sliced over steamed Japanese rice, accompanied by rich, fragrant slow-simmered Japanese curry.",
    "price": 690,
    "badge": "Tokyo Comfort",
    "img": "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "jp-10",
    "category": "japanese",
    "name": "Teriyaki Glazed Salmon Fillet",
    "desc": "Pan-seared fresh salmon fillet glazed in house-made sweet teriyaki reduction, sprinkled with toasted sesame seeds and steamed broccoli.",
    "price": 980,
    "badge": "Glazed Specialty",
    "img": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-1",
    "category": "drinks",
    "name": "Gulshan Crimson Sunset Mocktail",
    "desc": "Fresh pomegranate pearls, blood orange reduction, fresh mint sprigs, lime spritz, and chilled sparkling soda.",
    "price": 320,
    "badge": "Signature",
    "img": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-2",
    "category": "drinks",
    "name": "Passionfruit Mint Mojito",
    "desc": "Crushed garden mint, freshly scooped passionfruit pulp, raw cane sugar, tart key lime, and chilled bubbly club soda.",
    "price": 290,
    "badge": "Zesty Citrus",
    "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-3",
    "category": "drinks",
    "name": "Royal Saffron Pistachio Lassi",
    "desc": "Rich creamy organic curd churned with pure Kashmiri saffron strands, crushed Iranian pistachios, and a touch of rose essence.",
    "price": 280,
    "badge": "Traditional Royal",
    "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-4",
    "category": "drinks",
    "name": "Belgian Dark Chocolate Iced Mocha",
    "desc": "Double espresso pull from freshly roasted Arabica beans, blended with melted Belgian dark chocolate ganache, cold milk, and chocolate curls.",
    "price": 340,
    "badge": "Specialty Arabica",
    "img": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-5",
    "category": "drinks",
    "name": "Green Mango Chili Slush (Aam Panna)",
    "desc": "Roasted sour green mango pulp blended with Himalayan black salt, roasted cumin, fresh mint, and crushed ice.",
    "price": 260,
    "badge": "Bengali Summer",
    "img": "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-6",
    "category": "drinks",
    "name": "Blue Ocean Lagoon Cooler",
    "desc": "Non-alcoholic blue curaçao syrup, freshly squeezed lime juice, crushed ice, sprite, and a slice of dried citrus fruit.",
    "price": 290,
    "badge": "Vibrant Fizz",
    "img": "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-7",
    "category": "drinks",
    "name": "Cold-Pressed Watermelon Mint Juice",
    "desc": "Pure fresh cold-pressed sweet watermelon juice with crushed garden mint and a hint of Himalayan pink salt.",
    "price": 250,
    "badge": "100% Fresh",
    "img": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-8",
    "category": "drinks",
    "name": "Classic Lemon Iced Tea",
    "desc": "Hand-brewed Ceylon black tea infused with fresh lemon juice, mint leaves, and subtle cane syrup over crushed ice.",
    "price": 220,
    "badge": "Chilled Tea",
    "img": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-9",
    "category": "drinks",
    "name": "Artisan Masala Milk Chai",
    "desc": "Royal whole milk slow-simmered with premium CTC tea leaves, crushed green cardamom, cinnamon, cloves, and spicy fresh ginger.",
    "price": 180,
    "badge": "Warm Brew",
    "img": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-10",
    "category": "drinks",
    "name": "Espresso Macchiato",
    "desc": "Rich double shot of 100% Arabica espresso marked with a delicate dollop of velvety steamed milk microfoam.",
    "price": 220,
    "badge": "Italian Roast",
    "img": "images/espresso-macchiato.jpg"
  },
  {
    "id": "dr-11",
    "category": "drinks",
    "name": "Caramel Vanilla Frappuccino",
    "desc": "Cold-blended Arabica espresso with rich vanilla bean cream, crushed ice, whipped cream, and drizzle of salted caramel.",
    "price": 350,
    "badge": "Sweet & Creamy",
    "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-12",
    "category": "drinks",
    "name": "Piña Colada Mocktail",
    "desc": "Creamy coconut cream blended with chilled sweet pineapple juice, crushed ice, and topped with a maraschino cherry.",
    "price": 310,
    "badge": "Tropical Blend",
    "img": "https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-13",
    "category": "drinks",
    "name": "Peach & Hibiscus Sparkling Spritzer",
    "desc": "Steeped wild hibiscus blossom tea infused with white peach puree and topped with effervescent sparkling soda.",
    "price": 290,
    "badge": "Floral Spritz",
    "img": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=400&auto=format&fit=crop"
  },
  {
    "id": "dr-14",
    "category": "drinks",
    "name": "Traditional Sweet Shahi Borhani",
    "desc": "Thick spiced yogurt drink churned with roasted cumin, mustard seeds, mint puree, coriander, and black salt.",
    "price": 220,
    "badge": "Heritage Borhani",
    "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop"
  }
];

const MENU_STORAGE_KEY = 'ur_menu_catalog';

const MenuEngine = {
  getAllItems() {
    try {
      const data = localStorage.getItem(MENU_STORAGE_KEY);
      let items = data ? JSON.parse(data) : [];
      if (!items || items.length === 0) {
        items = [...window.DEFAULT_MENU_ITEMS];
        localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
      }
      return items;
    } catch (e) {
      return [...window.DEFAULT_MENU_ITEMS];
    }
  },

  getItemById(id) {
    const items = this.getAllItems();
    return items.find(it => it.id === id) || null;
  },

  updateItem(updatedItem) {
    if (typeof AuthEngine !== 'undefined' && !AuthEngine.isAdmin()) {
      throw new Error('Access Denied: Only Restaurant Admin can modify menu items.');
    }
    const items = this.getAllItems();
    const idx = items.findIndex(it => it.id === updatedItem.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...updatedItem, updatedAt: new Date().toISOString() };
    } else {
      items.push({ ...updatedItem, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));

    // Sync to Cloud Firestore
    if (window.urDb) {
      window.urDb.collection('menu_items').doc(updatedItem.id).set(items[idx >= 0 ? idx : items.length - 1], { merge: true })
        .then(() => console.log('🔥 Menu item synced to Cloud Firestore:', updatedItem.id))
        .catch(err => console.warn('Cloud menu sync note:', err.message));
    }
    return items[idx >= 0 ? idx : items.length - 1];
  },

  toggleAvailability(itemId) {
    if (typeof AuthEngine !== 'undefined' && !AuthEngine.isAdmin()) {
      throw new Error('Access Denied: Only Restaurant Admin can modify menu item availability.');
    }
    const items = this.getAllItems();
    const item = items.find(it => it.id === itemId);
    if (item) {
      item.isAvailable = item.isAvailable === false ? true : false;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
      if (window.urDb) {
        window.urDb.collection('menu_items').doc(itemId).set({ isAvailable: item.isAvailable, updatedAt: item.updatedAt }, { merge: true })
          .catch(err => console.warn('Cloud menu availability note:', err.message));
      }
      return item;
    }
    return null;
  },

  mergeCloudMenuItems(cloudItems) {
    if (!Array.isArray(cloudItems) || cloudItems.length === 0) return this.getAllItems();
    try {
      const items = this.getAllItems();
      const map = new Map();
      items.forEach(it => map.set(it.id, it));
      cloudItems.forEach(ci => {
        if (ci && ci.id) {
          map.set(ci.id, { ...(map.get(ci.id) || {}), ...ci });
        }
      });
      const merged = Array.from(map.values());
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (e) {
      return this.getAllItems();
    }
  }
};

window.MenuEngine = MenuEngine;
