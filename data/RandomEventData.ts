import { RandomEvent } from '../types';

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const RANDOM_EVENTS: RandomEvent[] = [
    {
        id: 'EVT001',
        title: 'Buổi Chụp Hình Của Nhà Tài Trợ',
        description: (teamName) => `Một trong những nhà tài trợ chính muốn tổ chức một buổi chụp hình quảng cáo với một tuyển thủ của ${teamName}. Bạn sẽ cử ai đi?`,
        imageUrl: 'https://api.dicebear.com/8.x/icons/svg?seed=camera',
        condition: (playerWon) => playerWon, // Only after a win
        choices: [
            {
                text: 'Cử MVP của trận vừa rồi đi.',
                effects: {
                    reputation: 5,
                    budget: 5000,
                    playerStat: { stat: 'morale', change: 5, target: 'mvp_of_last_match' }
                },
                news: {
                    title: 'Tuyển thủ tỏa sáng trong buổi chụp hình',
                    content: `Sau màn trình diễn ấn tượng, [P:{playerName}] đã được chọn làm gương mặt đại diện cho buổi chụp hình của nhà tài trợ, giúp tăng cường hình ảnh cho cả đội.`
                }
            },
            {
                text: 'Cử tuyển thủ có tinh thần thấp nhất.',
                effects: {
                    reputation: 2,
                    playerStat: { stat: 'morale', change: 10, target: 'lowest_morale' }
                },
                news: {
                    title: 'Cơ hội vực dậy tinh thần',
                    content: `[T:{teamName}] đã tạo cơ hội cho [P:{playerName}] tham gia sự kiện của nhà tài trợ, một động thái được cho là để giúp anh ấy lấy lại sự tự tin.`
                }
            },
            {
                text: 'Từ chối, chúng tôi cần tập trung luyện tập.',
                effects: { reputation: -5 }
            }
        ]
    },
    {
        id: 'EVT002',
        title: 'Cựu Tuyển Thủ Ghé Thăm',
        description: (teamName) => `Một huyền thoại của ${teamName} ghé thăm gaming house và đề nghị chia sẻ kinh nghiệm với một thành viên trong đội.`,
        imageUrl: 'https://api.dicebear.com/8.x/icons/svg?seed=star',
        choices: [
            {
                text: 'Tuyệt vời! Hãy để anh ấy huấn luyện riêng.',
                effects: { playerStat: { stat: 'macro', change: 1, target: 'random_player' } },
                news: {
                    title: 'Huyền thoại truyền lửa',
                    content: `[P:{playerName}] đã có một buổi huấn luyện đặc biệt với một cựu tuyển thủ, hứa hẹn sẽ mang lại những cải thiện về mặt chiến thuật.`
                }
            },
            {
                text: 'Tổ chức một buổi giao lưu với người hâm mộ.',
                effects: { fanCount: 500, reputation: 3 }
            },
            {
                text: 'Cảm ơn nhưng chúng tôi đang theo lịch trình.',
                effects: {}
            }
        ]
    },
    {
        id: 'EVT003',
        title: 'Lời Mời Tham Gia Talkshow',
        description: (teamName, opponentName, playerWon) => `Một kênh truyền thông lớn mời HLV của ${teamName} tham gia talkshow để nói về ${playerWon ? 'chiến thắng' : 'thất bại'} gần đây trước ${opponentName}.`,
        imageUrl: 'https://api.dicebear.com/8.x/icons/svg?seed=microphone',
        choices: [
            {
                text: 'Đồng ý tham gia, đây là cơ hội tốt.',
                effects: { fanCount: 250, reputation: 5, budget: 1500 },
                news: {
                    title: 'HLV xuất hiện trên truyền thông',
                    content: `HLV của [T:{teamName}] đã có những chia sẻ thẳng thắn về trận đấu vừa qua, thu hút sự chú ý của đông đảo người hâm mộ.`
                }
            },
            {
                text: 'Từ chối để giữ sự tập trung cho đội.',
                effects: { reputation: -2 }
            }
        ]
    },
    {
        id: 'EVT004',
        title: 'Hỏng Hóc Thiết Bị',
        description: () => 'Một vài chiếc ghế gaming cao cấp đột nhiên bị hỏng. Bạn sẽ xử lý thế nào?',
        imageUrl: 'https://api.dicebear.com/8.x/icons/svg?seed=settings',
        choices: [
            {
                text: 'Mua mới ngay lập tức.',
                effects: { budget: -7500 }
            },
            {
                text: 'Sửa chữa với chi phí thấp hơn.',
                effects: { budget: -2500, playerStat: { stat: 'form', change: -1, target: 'random_player' } }
            }
        ]
    },
    {
        id: 'EVT005',
        title: 'Giao Lưu Cùng Fan Hâm Mộ',
        description: (teamName) => `Cộng đồng người hâm mộ của ${teamName} muốn tổ chức một buổi gặp mặt nhỏ sau trận đấu.`,
        imageUrl: 'https://api.dicebear.com/8.x/icons/svg?seed=people',
        condition: (playerWon) => playerWon,
        choices: [
            {
                text: 'Đồng ý, đây là cách tri ân người hâm mộ.',
                effects: { fanCount: 1000, reputation: 3, playerStat: { stat: 'morale', change: 5, target: 'random_player' } },
                 news: {
                    title: '[T:{teamName}] thân thiết với người hâm mộ',
                    content: `Buổi giao lưu ấm cúng sau trận đấu đã giúp [T:{teamName}] đến gần hơn với các fan, tạo nên một hình ảnh đẹp trong cộng đồng.`
                }
            },
            {
                text: 'Gửi tặng vật phẩm có chữ ký.',
                effects: { fanCount: 200, budget: -500 }
            },
            {
                text: 'Từ chối do các tuyển thủ cần nghỉ ngơi.',
                effects: { fanCount: -150, reputation: -2 }
            }
        ]
    }
];