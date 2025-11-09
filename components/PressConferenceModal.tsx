import React, { useMemo } from 'react';
import { Match, Player, Team } from '../types';

interface PressConferenceChoice {
    text: (context: { opponentName: string }) => string;
    effects: {
        morale: number;
        reputation: number;
    };
}

interface PressConferenceScenario {
    id: string;
    condition: (context: { playerWon: boolean; isStomp: boolean; isUpset: boolean; opponentRank: number; playerRank: number }) => boolean;
    question: (context: { opponentName: string }) => string;
    choices: PressConferenceChoice[];
}

const PRESS_CONFERENCE_SCENARIOS: PressConferenceScenario[] = [
    // --- WIN SCENARIOS ---
    {
        id: 'WIN_GENERIC',
        condition: ({ playerWon }) => playerWon,
        question: ({ opponentName }) => `Chúc mừng chiến thắng trước ${opponentName}! Điều gì đã tạo nên sự khác biệt trong ngày hôm nay?`,
        choices: [
            { text: () => "Toàn đội đã thi đấu như một khối thống nhất. Mọi người đều xứng đáng được khen ngợi.", effects: { morale: 5, reputation: 5 } },
            { text: () => "Chúng tôi đơn giản là đội mạnh hơn. Kết quả này không có gì đáng ngạc nhiên.", effects: { morale: 2, reputation: -5 } },
            { text: () => "Chúng tôi đã chuẩn bị kỹ lưỡng và khai thác tốt sai lầm của họ.", effects: { morale: 3, reputation: 3 } },
        ]
    },
    {
        id: 'WIN_STOMP',
        condition: ({ playerWon, isStomp }) => playerWon && isStomp,
        question: ({ opponentName }) => `Một chiến thắng hủy diệt trước ${opponentName}. Các bạn đã làm điều đó như thế nào?`,
        choices: [
            { text: () => "Chúng tôi đã vào trận với sự tập trung cao độ và không cho họ bất kỳ cơ hội nào.", effects: { morale: 7, reputation: 3 } },
            { text: () => "Thành thật mà nói, họ đã chơi không tốt. Chúng tôi chỉ đơn giản là tận dụng điều đó.", effects: { morale: 1, reputation: -4 } },
            { text: () => "Mọi thứ diễn ra đúng như kế hoạch. Đây là minh chứng cho sự chuẩn bị của ban huấn luyện.", effects: { morale: 4, reputation: 6 } },
        ]
    },
    {
        id: 'WIN_UPSET',
        condition: ({ playerWon, isUpset }) => playerWon && isUpset,
        question: ({ opponentName }) => `Không ai ngờ các bạn có thể đánh bại ${opponentName}, một đối thủ được đánh giá cao hơn. Cảm xúc của bạn lúc này là gì?`,
        choices: [
            { text: () => "Chúng tôi luôn tin vào khả năng của mình. Hôm nay chúng tôi đã chứng minh mọi người đã sai.", effects: { morale: 10, reputation: 8 } },
            { text: () => "Chúng tôi đã gặp một chút may mắn, nhưng chiến thắng này hoàn toàn xứng đáng.", effects: { morale: 6, reputation: 5 } },
            { text: () => `Đây là một chiến thắng lớn, nhưng chúng tôi sẽ không ngủ quên trên đó. Mùa giải vẫn còn dài.`, effects: { morale: 4, reputation: 10 } },
        ]
    },
    // --- LOSS SCENARIOS ---
    {
        id: 'LOSS_GENERIC',
        condition: ({ playerWon }) => !playerWon,
        question: ({ opponentName }) => `Một thất bại đáng tiếc trước ${opponentName}. Theo bạn, đâu là nguyên nhân chính?`,
        choices: [
            { text: () => "Hôm nay chúng tôi đã không có phong độ tốt nhất. Chúng tôi sẽ trở lại mạnh mẽ hơn.", effects: { morale: -2, reputation: 5 } },
            { text: () => "Một vài cá nhân đã thi đấu dưới sức, và chúng tôi phải trả giá.", effects: { morale: -10, reputation: -5 } },
            { text: ({ opponentName }) => `${opponentName} đã chơi quá xuất sắc. Phải dành lời khen cho họ.`, effects: { morale: 0, reputation: 8 } },
        ]
    },
    {
        id: 'LOSS_STOMP',
        condition: ({ playerWon, isStomp }) => !playerWon && isStomp,
        question: ({ opponentName }) => `Một trận thua nặng nề trước ${opponentName}. Có vẻ như mọi thứ đã không đi đúng hướng?`,
        choices: [
            { text: () => "Chúng tôi hoàn toàn bị áp đảo. Không có lời bào chữa nào, chúng tôi cần phải xem lại mọi thứ.", effects: { morale: -12, reputation: 4 } },
            { text: () => "Giai đoạn cấm chọn đã là một sai lầm và chúng tôi không thể gượng dậy được.", effects: { morale: -8, reputation: -2 } },
            { text: () => "Đây là một gáo nước lạnh cần thiết. Nó cho thấy chúng tôi còn rất nhiều việc phải làm.", effects: { morale: -5, reputation: 7 } },
        ]
    },
    {
        id: 'LOSS_CLOSE',
        condition: ({ playerWon, isStomp }) => !playerWon && !isStomp,
        question: ({ opponentName }) => `Một trận đấu cực kỳ căng thẳng và các bạn đã thua sát nút. Chỉ một chút nữa thôi là kết quả đã khác?`,
        choices: [
            { text: () => "Chỉ một pha giao tranh cuối cùng đã định đoạt tất cả. Thật đáng tiếc, nhưng đó là thể thao.", effects: { morale: -3, reputation: 6 } },
            { text: () => "Chúng tôi đã mắc một sai lầm chí mạng ở thời điểm quan trọng. Lỗi hoàn toàn thuộc về chúng tôi.", effects: { morale: -7, reputation: 2 } },
            { text: () => `Chúng tôi đã cống hiến tất cả. Dù thua, tôi vẫn tự hào về màn trình diễn của cả đội.`, effects: { morale: -1, reputation: 9 } },
        ]
    }
];

interface PressConferenceModalProps {
    match: Match;
    result: { scoreA: number; scoreB: number; };
    playerTeam: Team;
    opponentTeam: Team;
    onChoice: (effects: { morale: number; reputation: number }) => void;
    onClose: () => void;
}

export const PressConferenceModal: React.FC<PressConferenceModalProps> = ({ match, result, playerTeam, opponentTeam, onChoice, onClose }) => {

    const scenario = useMemo(() => {
        const playerWon = (playerTeam.id === match.teamA.id && result.scoreA > result.scoreB) || 
                          (playerTeam.id === match.teamB.id && result.scoreB > result.scoreA);

        const totalGames = result.scoreA + result.scoreB;
        const isStomp = (result.scoreA === 0 || result.scoreB === 0) && totalGames > 1;

        const playerRank = playerTeam.rank || 5;
        const opponentRank = opponentTeam.rank || 5;
        const isUpset = playerWon ? playerRank > opponentRank + 2 : opponentRank > playerRank + 2;

        const context = {
            playerWon,
            isStomp,
            isUpset,
            opponentName: opponentTeam.name,
            playerRank,
            opponentRank,
        };
        
        const eligibleScenarios = PRESS_CONFERENCE_SCENARIOS.filter(s => s.condition(context));
        
        if (eligibleScenarios.length === 0) {
            const generic = PRESS_CONFERENCE_SCENARIOS.filter(s => s.id === (playerWon ? 'WIN_GENERIC' : 'LOSS_GENERIC'));
            return generic[0];
        }
        
        return eligibleScenarios[Math.floor(Math.random() * eligibleScenarios.length)];

    }, [match, result, playerTeam, opponentTeam]);

    if (!scenario) {
        return null;
    }

    const contextForText = { opponentName: opponentTeam.name };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-cyan-500/30 rounded-xl shadow-2xl w-full max-w-lg">
                <header className="p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-300 tracking-wider">Họp Báo Sau Trận</h2>
                </header>
                <main className="p-6 space-y-4">
                    <p className="text-lg text-gray-300 italic">"{scenario.question(contextForText)}"</p>
                    <div className="space-y-3">
                        {scenario.choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => onChoice(choice.effects)}
                                className="w-full text-left bg-gray-700/50 p-3 rounded-md hover:bg-cyan-600/50 transition-colors"
                            >
                                {choice.text(contextForText)}
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};