import { Hero, HeroRole } from '../types';

// Switched to DiceBear for hero image generation.
// Added colorVariations to allow for avatar customization and visual diversity.
// The first color in the array is used as the default background.
export const HERO_POOL: Hero[] = [
  // Warriors (Reds, Oranges)
  { id: 'h001', name: 'Florentino', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/62cda115a78344fc4fa5154881c9da255c25f64ee994d1.jpg', mechanics: 95, macro: 60, colorVariations: ['ffadad', 'd90429', 'e85d04'] },
  { id: 'h002', name: 'Yena', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/61fa157164bf9d99e65bf40b802fb5745cfe1cd72c4671.jpg', mechanics: 90, macro: 70, colorVariations: ['ffd6a5', 'f48c06', 'ffc300'] },
  { id: 'h003', name: 'Omen', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/00a78d4f7222a428cd06b45252f88a565a73df2c56ad81.jpg', mechanics: 70, macro: 85, colorVariations: ['fdffb6', 'fca311', 'dc2f02'] },
  { id: 'h004', name: 'Airi', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/04999ff87145b9005694ffd78e1530a660017059a8fc11.jpg', mechanics: 88, macro: 75, colorVariations: ['ffc6c7', 'e5383b', 'b1a7a6'] },
  { id: 'h005', name: 'Veres', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/46c5f246040b9e750779aa41ffcbeaa15c3f06d63ce241.jpg', mechanics: 85, macro: 80, colorVariations: ['f2a1a1', 'ba181b', '660708'] },

  // Mages (Blues, Purples)
  { id: 'h006', name: 'Liliana', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/28b06811cb721a8ecb28d6a1db401e745a9fd3a39ae401.jpg', mechanics: 92, macro: 85, colorVariations: ['bde0fe', '5e60ce', '3d348b'] },
  { id: 'h007', name: 'Raz', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/6b79035779ab9195c76d91b3f2e7ca79591e6857831601.jpg', mechanics: 90, macro: 70, colorVariations: ['a2d2ff', '00b4d8', '023e8a'] },
  { id: 'h008', name: 'Tulen', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/07210c9e529faa7766ba324bd86b75165a81722f3eab81.jpg', mechanics: 85, macro: 80, colorVariations: ['c0aede', 'a28089', '6a040f'] },
  { id: 'h009', name: 'Krixi', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/7f04b1fd7f0520dd1ccbd1caad6faf1a5847d3f72e85b1.png', mechanics: 70, macro: 90, colorVariations: ['b6e3f4', '80ed99', '57cc99'] },
  { id: 'h010', name: 'Iggy', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/b4563fbfd5756caeea04b7ef488ee39f60fffd803e9ab1.jpeg', mechanics: 80, macro: 88, colorVariations: ['d1d4f9', '7400b8', '480ca8'] },

  // Assassins (Dark, Grays)
  { id: 'h011', name: 'Nakroth', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/c7b840bdacd7e5a8b83af72ccd9ca1815ec64fdc5ffeb1.jpg', mechanics: 98, macro: 80, colorVariations: ['6c757d', '343a40', '212529'] },
  { id: 'h012', name: 'Aoi', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/f1db425eba8ea88e5d4d8427c1706bcf6100183de1cc11.jpeg', mechanics: 96, macro: 85, colorVariations: ['495057', 'f8f9fa', 'e9ecef'] },
  { id: 'h013', name: 'Murad', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/7dba55e7f433ab78ac6bd2cdfeec13495983e122346461.jpg', mechanics: 94, macro: 75, colorVariations: ['adb5bd', '343a40', 'fca311'] },
  { id: 'h014', name: 'Butterfly', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/769a9fe6cb9b9725127a094bb6dd36545f0ed6543592e1.jpg', mechanics: 75, macro: 70, colorVariations: ['ced4da', 'ffc6c7', 'f08080'] },
  { id: 'h015', name: 'Keera', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/8491520381ab2a66489a6c5e1ec98e785e452a5c9fd3c1.jpg', mechanics: 88, macro: 82, colorVariations: ['343a40', 'c9184a', '800f2f'] },

  // Marksmen (Yellows, Greens)
  { id: 'h016', name: 'Hayate', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/02c8e3d1db8ee8f32913b478884f33e05c8f254a7686f1.jpg', mechanics: 93, macro: 70, colorVariations: ['caffbf', '80b918', '2b9348'] },
  { id: 'h017', name: 'Elsu', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/449789489494c0f108a3db5db3098e585bc98d17e666b1.jpg', mechanics: 95, macro: 80, colorVariations: ['9bf6ff', '4361ee', 'f72585'] },
  { id: 'h018', name: 'Capheny', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/5c3212f3d7a6f95ad04a309d4d1f340a5ca5c222bda911.jpg', mechanics: 85, macro: 75, colorVariations: ['a0c4ff', 'fdc500', 'f94144'] },
  { id: 'h019', name: 'Violet', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/f91d8c95b3b0c11c6fe5b8ac20e48cbd5d25650254d571.jpg', mechanics: 80, macro: 85, colorVariations: ['ffdfbf', 'f9c74f', 'f8961e'] },
  { id: 'h020', name: 'Thorne', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/dd8031b80a4fc5978cdd4886a65a6eb35f5070fd5d0221.jpg', mechanics: 88, macro: 80, colorVariations: ['bdb2ff', 'ef476f', 'ffd166'] },
  
  // Supports (Pinks, Light Blues)
  { id: 'h021', name: 'Krizzix', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/a7e49f01ef9804d479cb6537a9b51dee5db6c75c945151.png', mechanics: 70, macro: 95, colorVariations: ['a7f3d0', '52b788', '2d6a4f'] },
  { id: 'h022', name: 'Aya', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/d4510fa53f153c5e259543597c96bb88658d3efcbcd0f1.jpg', mechanics: 60, macro: 90, colorVariations: ['ffc6c7', 'f7d1e4', 'e0b1cb'] },
  { id: 'h023', name: 'Zip', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/e0f8f382d1be41adc8947bf1b849479b5d3823c7418f71.jpg', mechanics: 80, macro: 92, colorVariations: ['ffb3c6', 'efbdeb', 'd291bc'] },
  { id: 'h024', name: 'Helen', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/e645dfa331fa48d593b33352e1f8030e636e1b3e19b951.jpg', mechanics: 65, macro: 88, colorVariations: ['a9d6e5', '61a5c2', '2c7da0'] },
  { id: 'h025', name: 'Grakk', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/040403525e2882c0e3a6794c31976c89585357ba19a351.png', mechanics: 75, macro: 70, colorVariations: ['89c2d9', '468faf', '014f86'] },

  // Tanks (Earth Tones, Grays)
  { id: 'h026', name: 'Thane', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/71e488144b7dc9f13d40321ce0556efc5847d39f2071a1.png', mechanics: 65, macro: 85, colorVariations: ['cb997e', '997b66', '6b705c'] },
  { id: 'h027', name: 'Taara', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/f69423f533b12cbcd8ab15a7127e1e445e79e0b77e4ec1.jpg', mechanics: 70, macro: 80, colorVariations: ['ddbea9', 'a5a58d', '6b705c'] },
  { id: 'h028', name: 'Maloch', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/752c4c954aa4a8f05a1b0be72aa5dc895c0def4d435aa1.jpg', mechanics: 75, macro: 90, colorVariations: ['ffe8d6', 'b7b7a4', '8a817c'] },
  { id: 'h029', name: 'Baldum', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/e751e70db18557783c2d23c9e5383e095b6bb947482b11.jpg', mechanics: 80, macro: 88, colorVariations: ['b7b7a4', '6b705c', '463f3a'] },
  { id: 'h030', name: 'Arum', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/7faf7c96faeb8721b936e323becb57265afea9c3c8b281.jpg', mechanics: 70, macro: 92, colorVariations: ['a4ac86', '6b705c', '4a4e69'] },

  // --- NEW HEROES (50) ---
  // Warriors (10)
  { id: 'h031', name: 'Zuka', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/d5166c51f37b444810f2ae3df056920d5c4938c59a4821.jpg', mechanics: 89, macro: 78, colorVariations: ['ffd6a5', 'f48c06', 'ffc300'] },
  { id: 'h032', name: 'Qi', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/6da178e8a2c2871aeb856bec0f669ccd5d5684e01acd31.jpg', mechanics: 87, macro: 76, colorVariations: ['ffc6c7', 'e5383b', 'b1a7a6'] },
  { id: 'h033', name: 'Richter', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/e6e08d2cc322676442cf420e4aefb6d85bd7d7620754b1.jpg', mechanics: 86, macro: 85, colorVariations: ['a2d2ff', '00b4d8', '023e8a'] },
  { id: 'h034', name: 'Allain', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/3aa1f0f335f87801117dbfa1d69b072b5ef1f1c297fe21.jpg', mechanics: 91, macro: 72, colorVariations: ['bde0fe', '5e60ce', '3d348b'] },
  { id: 'h035', name: 'Skud', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/2b128ebef47ab5a8a2ae9d3db754cd585ee5e21149f621.jpg', mechanics: 72, macro: 82, colorVariations: ['ffadad', 'd90429', 'e85d04'] },
  { id: 'h036', name: 'Amily', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/65b8d8e674af00ee4ecbb4030e8fac385b88ea13824d31.jpg', mechanics: 80, macro: 79, colorVariations: ['f2a1a1', 'ba181b', '660708'] },
  { id: 'h037', name: 'Wonder Woman', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/108ae03944a6aa1eb4313a2baa64efcd5a0e6c1551db11.jpg', mechanics: 84, macro: 83, colorVariations: ['fdffb6', 'fca311', 'dc2f02'] },
  { id: 'h038', name: 'Lu Bu', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/ecbf2434edb2b16cc0d5b286a88ab4335d2565110472b1.jpg', mechanics: 82, macro: 75, colorVariations: ['ffc6c7', 'e5383b', 'b1a7a6'] },
  { id: 'h039', name: 'Ryoma', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/2f3fe854b98e664415c024a1e9f0396259d9b9ddb39921.jpg', mechanics: 88, macro: 80, colorVariations: ['ffadad', 'd90429', 'e85d04'] },
  { id: 'h040', name: 'Tachi', role: HeroRole.Warrior, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/ea94a6f76e867283974c8ced9d3aa2c5658d3150230cf1.jpg', mechanics: 90, macro: 82, colorVariations: ['a2d2ff', '00b4d8', '023e8a'] },
  // Mages (10)
  { id: 'h041', name: 'Zata', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/fcd5c439a7cc37896ab98d568b662bec5ec66637da75d1.jpg', mechanics: 97, macro: 85, colorVariations: ['d1d4f9', '7400b8', '480ca8'] },
  { id: 'h042', name: 'Yue', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/3ee26051086fee856dc6df74811e9e35658d4142ce14c1.jpg', mechanics: 94, macro: 88, colorVariations: ['bde0fe', '5e60ce', '3d348b'] },
  { id: 'h043', name: 'Lauriel', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/18d4327ac2e366a736a060be082bbbef5943917dab8d81.jpg', mechanics: 93, macro: 80, colorVariations: ['c0aede', 'a28089', '6a040f'] },
  { id: 'h044', name: 'Dirak', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/ab0b68ebd2e8df3116d91231ec0e55fc5e16e1f05c8701-1.jpg', mechanics: 80, macro: 94, colorVariations: ['a2d2ff', '00b4d8', '023e8a'] },
  { id: 'h045', name: 'Veera', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/82a7e1d31f6b20d3faa502e1a215b76c6595119091e7a2-e1718879982854.jpg', mechanics: 68, macro: 84, colorVariations: ['ffc6c7', 'e5383b', 'b1a7a6'] },
  { id: 'h046', name: 'Natalya', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/a450850337d6a5d19250b1d1e39692f15eccc530c915e1.jpg', mechanics: 78, macro: 80, colorVariations: ['f2a1a1', 'ba181b', '660708'] },
  { id: 'h047', name: 'Preyta', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/f2f8893606262e7c0547c4f47f670995590bf38eabfc81.jpg', mechanics: 75, macro: 89, colorVariations: ['b6e3f4', '80ed99', '57cc99'] },
  { id: 'h048', name: 'Gildur', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/10800_B40-1.jpg', mechanics: 70, macro: 87, colorVariations: ['ffdfbf', 'f9c74f', 'f8961e'] },
  { id: 'h049', name: 'Ignis', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/a2c0e8ef7742c926f9bb10fbab12b03d5970da7009dc11.jpg', mechanics: 82, macro: 86, colorVariations: ['fdffb6', 'fca311', 'dc2f02'] },
  { id: 'h050', name: 'Bonnie', role: HeroRole.Mage, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/a2ed1b1815df9c719e4f9b4be5eb3a74658d4cd7d3ef61.jpg', mechanics: 85, macro: 85, colorVariations: ['a0c4ff', 'fdc500', 'f94144'] },
  // Assassins (10)
  { id: 'h051', name: 'Paine', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/47861c6d53d72d0dbea2d1dba0b0e0365e8ade6f180931.jpg', mechanics: 92, macro: 86, colorVariations: ['343a40', 'c9184a', '800f2f'] },
  { id: 'h052', name: 'Sinestrea', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/680ef284724e077237f33cfc2d8fa72d5fa194bad60f31.jpg', mechanics: 94, macro: 81, colorVariations: ['ced4da', 'ffc6c7', 'f08080'] },
  { id: 'h053', name: 'Quillen', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/f6004ed060dcff380fc5b13574986bbc5bf778bc905561.jpg', mechanics: 89, macro: 75, colorVariations: ['adb5bd', '343a40', 'fca311'] },
  { id: 'h054', name: 'Wukong', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/aea009bf921dd684d19ee76c0c1441215ef5c39d1bd6b1.jpg', mechanics: 85, macro: 78, colorVariations: ['ffd6a5', 'f48c06', 'ffc300'] },
  { id: 'h055', name: 'Kriknak', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/0dac2ca73eb28c03de2e43f85e868df458e710b5baeb41.png', mechanics: 88, macro: 84, colorVariations: ['d1d4f9', '7400b8', '480ca8'] },
  { id: 'h056', name: 'Zill', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/b1a6c37ad9558ac5767e25ded5b6fcf759966ca7c1d431.jpg', mechanics: 86, macro: 83, colorVariations: ['b6e3f4', '80ed99', '57cc99'] },
  { id: 'h057', name: 'Enzo', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/81d7c827262287ce87639f3bfa048f5a5d149a6d571091.jpg', mechanics: 95, macro: 77, colorVariations: ['6c757d', '343a40', '212529'] },
  { id: 'h058', name: 'Bright', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/0045a9d59dc140647f4fa67b446c732c5fc55919650441.jpg', mechanics: 91, macro: 82, colorVariations: ['f8f9fa', 'e9ecef', 'ffd166'] },
  { id: 'h059', name: 'The Flash', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/dbb8d783c711cc0d2961e72cc8ed122c5ad9685dd58c11.jpg', mechanics: 90, macro: 88, colorVariations: ['ffadad', 'd90429', 'e85d04'] },
  { id: 'h060', name: 'Batman', role: HeroRole.Assassin, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/bb649e26633a61d78f7147d56c0828c6658d3bb600ae01.jpg', mechanics: 83, macro: 90, colorVariations: ['495057', '343a40', '212529'] },
  // Marksmen (10)
  { id: 'h061', name: 'Slimz', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/122fe2fc229ca42dcbe6946db07ccd435b345a87702a11.png', mechanics: 84, macro: 82, colorVariations: ['caffbf', '80b918', '2b9348'] },
  { id: 'h062', name: 'Fennik', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/ab3f51a9731ffa085fd56a87139b8a775860e26837e191.jpg', mechanics: 86, macro: 79, colorVariations: ['ffdfbf', 'f9c74f', 'f8961e'] },
  { id: 'h063', name: 'Valhein', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/4b36c6e5e2d1ce9dd9e2841d2902043c5ee04efeb2f2d1.jpg', mechanics: 70, macro: 70, colorVariations: ['a0c4ff', 'fdc500', 'f94144'] },
  { id: 'h064', name: 'Yorn', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/44086d0bc26a170b21038a7cbf9413365c4938b95b2f91.jpg', mechanics: 80, macro: 75, colorVariations: ['ffd6a5', 'f48c06', 'ffc300'] },
  { id: 'h065', name: 'Tel Annas', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/5064b1bbcb8dcac94f88292537d6c35459e96577aa90c1.jpg', mechanics: 87, macro: 78, colorVariations: ['9bf6ff', '4361ee', 'f72585'] },
  { id: 'h066', name: 'Laville', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/c30059d2dc46ed31b72a4b02aa9e61f75eb136829228d1.jpg', mechanics: 88, macro: 83, colorVariations: ['bdb2ff', 'ef476f', 'ffd166'] },
  { id: 'h067', name: 'Joker', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/aaba7b63f6e2f5577fbb3465925c8026658d3d704767f1.jpg', mechanics: 85, macro: 84, colorVariations: ['d1d4f9', '7400b8', '480ca8'] },
  { id: 'h068', name: 'Wisp', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/f3a7fe63c79a26ea789064ea3361781f5aec0b6084aa01.jpg', mechanics: 82, macro: 76, colorVariations: ['ffc6c7', 'f7d1e4', 'e0b1cb'] },
  { id: 'h069', name: 'Teeri', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/3499773a79087475e48194e0fd02e27d658d428c2cbe51.jpg', mechanics: 89, macro: 80, colorVariations: ['bde0fe', '5e60ce', '3d348b'] },
  { id: 'h070', name: 'Celica', role: HeroRole.Marksman, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/194741793e21d4392965d4d63515e78b5d6fa738d07e61.jpg', mechanics: 86, macro: 81, colorVariations: ['caffbf', '80b918', '2b9348'] },
  // Supports & Tanks (10)
  { id: 'h071', name: 'Xeniel', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/a56369ce162e24700689527a54d89b755a179e8628f391.jpg', mechanics: 75, macro: 96, colorVariations: ['a9d6e5', '61a5c2', '2c7da0'] },
  { id: 'h072', name: 'Alice', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/b9dd8e24c0fbad107475f6e31f5e36365847d373da15b1.png', mechanics: 65, macro: 89, colorVariations: ['ffb3c6', 'efbdeb', 'd291bc'] },
  { id: 'h073', name: 'Annette', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/17f4f562b9121128b4aff9e7b41644185f041e77964551.jpg', mechanics: 72, macro: 91, colorVariations: ['a2d2ff', '00b4d8', '023e8a'] },
  { id: 'h074', name: 'Rouie', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/7f7ce6b3593a8ea52de5fa3be55469f85eb1402d093b71.jpg', mechanics: 68, macro: 98, colorVariations: ['bde0fe', '5e60ce', '3d348b'] },
  { id: 'h075', name: 'TeeMee', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/d048143eef92ff2734c99f53b46e19db5a4dabef8a0fe1.jpg', mechanics: 78, macro: 88, colorVariations: ['ffd6a5', 'f48c06', 'ffc300'] },
  { id: 'h076', name: 'Sephera', role: HeroRole.Support, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/eef053fb25793d536185559e8bf5a82d5c132caaa102e1.jpg', mechanics: 76, macro: 87, colorVariations: ['9bf6ff', '4361ee', 'f72585'] },
  { id: 'h077', name: 'Cresht', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/04b0a1140d89b8ef0cd4a655753bbb895c4938662bc9f1.jpg', mechanics: 75, macro: 88, colorVariations: ['89c2d9', '468faf', '014f86'] },
  { id: 'h078', name: 'Toro', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/ffd2c29391b67831e97a0b16534a65d45ef5921c2bcb41.jpg', mechanics: 60, macro: 86, colorVariations: ['cb997e', '997b66', '6b705c'] },
  { id: 'h079', name: 'Arthur', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/06/Honeyview_Arthur_111-e1718875297358.jpg', mechanics: 70, macro: 78, colorVariations: ['b7b7a4', '6b705c', '463f3a'] },
  { id: 'h080', name: 'Max', role: HeroRole.Tank, imageUrl: 'https://lienquan.garena.vn/wp-content/uploads/2024/05/9b5e17b2059b1e710663e1ec542f254b5acdd5b0220031.jpg', mechanics: 78, macro: 89, colorVariations: ['ffe8d6', 'b7b7a4', '8a817c'] },
];
