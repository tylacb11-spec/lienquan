import { SponsorPrestige } from '../types';

interface SponsorInfo {
    name: string;
    category: 'Energy Drink' | 'Peripherals' | 'Fashion' | 'Tech' | 'Finance' | 'Local Business' | 'Automotive' | 'Food & Beverage';
    prestige: SponsorPrestige[];
}

export const SPONSOR_POOL: SponsorInfo[] = [
    // Energy Drinks
    { name: 'Volt Surge', category: 'Energy Drink', prestige: ['Regional', 'National'] },
    { name: 'Titan Fuel', category: 'Energy Drink', prestige: ['National', 'Global'] },
    { name: 'Stinger Energy', category: 'Energy Drink', prestige: ['Regional', 'National'] },
    { name: 'G-Force Drink', category: 'Energy Drink', prestige: ['Global'] },

    // Peripherals
    { name: 'Apex Gaming Gear', category: 'Peripherals', prestige: ['Regional', 'National', 'Global'] },
    { name: 'CyberCore Peripherals', category: 'Peripherals', prestige: ['National', 'Global'] },
    { name: 'NexusKeyboards', category: 'Peripherals', prestige: ['Regional', 'National'] },
    { name: 'Zenith Headsets', category: 'Peripherals', prestige: ['Local', 'Regional'] },
    
    // Tech & Hardware
    { name: 'Quantum Processors', category: 'Tech', prestige: ['National', 'Global'] },
    { name: 'Starlight Monitors', category: 'Tech', prestige: ['Regional', 'National'] },
    { name: 'Galactic Systems', category: 'Tech', prestige: ['Global'] },
    { name: 'HyperNet Broadband', category: 'Tech', prestige: ['Regional', 'National'] },

    // Fashion & Lifestyle
    { name: 'Ronin Apparel', category: 'Fashion', prestige: ['Regional', 'National'] },
    { name: 'Spectre Eyewear', category: 'Fashion', prestige: ['National', 'Global'] },
    { name: 'Vortex Streetwear', category: 'Fashion', prestige: ['Local', 'Regional'] },
    
    // Finance & Services
    { name: 'CoinSpire Crypto', category: 'Finance', prestige: ['National', 'Global'] },
    { name: 'Pioneer Bank', category: 'Finance', prestige: ['Local', 'Regional'] },
    { name: 'Equinox Insurance', category: 'Finance', prestige: ['National'] },
    
    // Food & Automotive
    { name: 'Blaze Pizza', category: 'Food & Beverage', prestige: ['Local', 'Regional'] },
    { name: 'Raptor Motors', category: 'Automotive', prestige: ['National', 'Global'] },
    { name: 'Velocity Auto', category: 'Automotive', prestige: ['Regional', 'National'] },

    // Local Businesses
    { name: 'City PC Builders', category: 'Local Business', prestige: ['Local'] },
    { name: 'The Gamer\'s Cafe', category: 'Local Business', prestige: ['Local'] },
    { name: 'Local Hero Comics', category: 'Local Business', prestige: ['Local'] },
];