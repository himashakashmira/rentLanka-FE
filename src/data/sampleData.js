export const rentalItems = [
  { id: 'corolla-cross', title: 'Toyota Corolla Cross', category: 'Vehicles', location: 'Colombo 03', price: 8500, rating: 4.9, reviews: 28, popularity: 98, image: 'car', owner: 'Nadeesha Perera', deposit: 25000, description: 'A comfortable, reliable crossover for city drives and weekend escapes. Includes unlimited mileage within the Western Province.', available: true },
  { id: 'sony-a7', title: 'Sony A7 IV Camera Kit', category: 'Cameras & Electronics', location: 'Colombo 07', price: 4000, rating: 5, reviews: 16, popularity: 94, image: 'camera', owner: 'Dilan Karunaratne', deposit: 15000, description: 'Professional full-frame camera kit with 24–70mm lens, two batteries, charger and a compact carry case.', available: true },
  { id: 'honda-dio', title: 'Honda Dio 2024', category: 'Vehicles', location: 'Negombo', price: 2500, rating: 4.8, reviews: 42, popularity: 91, image: 'scooter', owner: 'Amaya Fernando', deposit: 10000, description: 'Fuel-efficient automatic scooter, perfect for coastal exploring and quick city errands.', available: true },
  { id: 'makita-set', title: 'Makita Power Tool Set', category: 'Construction Equipment', location: 'Kandy', price: 3200, rating: 4.9, reviews: 19, popularity: 87, image: 'tools', owner: 'Sahan Perera', deposit: 12000, description: 'Cordless drill, impact driver, circular saw and full battery set for your next home project.', available: true },
  { id: 'event-speakers', title: 'JBL Event Speaker Pair', category: 'Event Equipment', location: 'Galle', price: 6500, rating: 4.7, reviews: 12, popularity: 80, image: 'camera', owner: 'Lahiru Events', deposit: 20000, description: 'Powerful portable speakers with stands and cables for weddings, parties and community events.', available: false },
  { id: 'projector', title: 'Epson Home Cinema Projector', category: 'Home Appliances', location: 'Colombo 05', price: 3000, rating: 4.8, reviews: 22, popularity: 84, image: 'camera', owner: 'Mihiri Jayasuriya', deposit: 10000, description: 'Bright 1080p projector for movie nights, presentations and indoor celebrations.', available: true },
  { id: 'camping-set', title: 'Knuckles Camping Set', category: 'Sports & Outdoor', location: 'Kandy', price: 2200, rating: 4.9, reviews: 31, popularity: 89, image: 'tools', owner: 'Ruwan Silva', deposit: 8000, description: 'Two-person tent, sleeping bags, cooking set and headlamps ready for a mountain weekend.', available: true },
  { id: 'nissan-xtrail', title: 'Nissan X-Trail 2022', category: 'Vehicles', location: 'Galle', price: 10500, rating: 4.9, reviews: 15, popularity: 86, image: 'car', owner: 'Tharindu Gomes', deposit: 30000, description: 'Spacious SUV with room for five, ideal for family trips along the southern coast.', available: true },
];

export const categoryItems = [
  { name: 'Vehicles', count: '1,240 items', icon: 'car', description: 'Cars, vans, tuk-tuks and motorcycles for every journey.' },
  { name: 'Cameras & Electronics', count: '2,180 items', icon: 'camera', description: 'Capture, create and connect with trusted tech nearby.' },
  { name: 'Construction Equipment', count: '1,260 items', icon: 'tools', description: 'Professional tools and machinery for your next build.' },
  { name: 'Event Equipment', count: '290 items', icon: 'event', description: 'Make celebrations memorable with gear that delivers.' },
  { name: 'Home Appliances', count: '610 items', icon: 'home', description: 'Practical appliances for projects, moves and everyday life.' },
  { name: 'Sports & Outdoor', count: '540 items', icon: 'outdoor', description: 'Get outside with equipment ready for adventure.' },
];

export const locations = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Nuwara Eliya'];
export const bookingRows = [
  { id: 'RL-2048', item: 'Toyota Corolla Cross', dates: '18–21 Aug 2024', total: 'LKR 25,500', status: 'Confirmed', image: 'car' },
  { id: 'RL-1992', item: 'Sony A7 IV Camera Kit', dates: '04–06 Jul 2024', total: 'LKR 12,000', status: 'Completed', image: 'camera' },
  { id: 'RL-1840', item: 'Knuckles Camping Set', dates: '12–14 Jun 2024', total: 'LKR 6,600', status: 'Cancelled', image: 'tools' },
];
