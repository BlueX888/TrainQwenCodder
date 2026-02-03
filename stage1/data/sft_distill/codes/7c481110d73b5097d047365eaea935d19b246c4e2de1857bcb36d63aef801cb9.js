// 成就系统完整实现
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = this.initAchievements();
    this.progress = this.loadProgress();
    this.listeners = [];
  }

  initAchievements() {
    return [
      { id: 'first_click', name: '初次点击', desc: '点击屏幕1次', target: 1, current: 0, type: 'click' },
      { id: 'click_master', name: '点击大师', desc: '点击屏幕50次', target: 50, current: 0, type: 'click' },
      { id: 'click_legend', name: '点击传奇', desc: '点击屏幕200次', target: 200, current: 0, type: 'click' },
      { id: 'key_warrior', name: '键盘战士', desc: '按下任意键20次', target: 20, current: 0, type: 'key' },
      { id: 'survivor', name: '存活者', desc: '游戏运行30秒', target: 30, current: 0, type: 'time' },
      { id: 'veteran', name: '老兵', desc: '游戏运行120秒', target: 120, current: 0, type: 'time' },
      { id: 'combo_starter', name: '连击入门', desc: '3秒内点击5次', target: 5, current: 0, type: 'combo' },
      { id: 'combo_master', name: '连击大师', desc: '3秒内点击15次', target: 15, current: 0, type: 'combo' },
      { id: 'explorer', name: '探索者', desc: '点击所有4个角落', target: 4, current: 0, type: 'corner' },
      { id: 'center_fan', name: '中心爱好者', desc: '点击中心区域10次', target: 10, current: 0, type: 'center' },
      { id: 'space_cadet', name: '空格学员', desc: '按空格键10次', target: 10, current: 0, type: 'space' },
      { id: 'arrow_master', name: '方向大师', desc: '按下所有4个方向键', target: 4, current: 0, type: 'arrow' },
      { id: 'persistent', name: '坚持不懈', desc: '重置进度后再次获得5个成就', target: 5, current: 0, type: 'reset' },
      { id: 'speed_demon', name: '速度恶魔', desc: '10秒内获得3个成就', target: 3, current: 0, type: 'speed' },
      { id: 'completionist', name: '完美主义者', desc: '解锁所有其他成就', target: 14, current: 0, type: 'meta' }
    ];
  }

  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      const progress = JSON.parse(saved);
      this.achievements.forEach(ach => {
        if (progress[ach.id]) {
          ach.current = progress[ach.id].current;
          ach.unlocked = progress[ach.id].unlocked;
          ach.unlockedAt = progress[ach.id].unlockedAt;
        }
      });
    }
    return this.achievements.reduce((acc, ach) => {
      acc[ach.id] = { current: ach.current || 0, unlocked: ach.unlocked || false, unlockedAt: ach.unlockedAt };
      return acc;
    }, {});
  }

  saveProgress() {
    const progress = this.achievements.reduce((acc, ach) => {
      acc[ach.id] = { current: ach.current, unlocked: ach.unlocked, unlockedAt: ach.unlockedAt };
      return acc;
    }, {});
    localStorage.setItem('phaser_achievements', JSON.stringify(progress));
  }

  updateProgress(type, value = 1, data = {}) {
    let unlocked = [];
    
    this.achievements.forEach(ach => {
      if (ach.unlocked) return;
      
      if (ach.type === type) {
        if (type === 'corner') {
          ach.corners = ach.corners || new Set();
          ach.corners.add(data.corner);
          ach.current = ach.corners.size;
        } else if (type === 'arrow') {
          ach.arrows = ach.arrows || new Set();
          ach.arrows.add(data.arrow);
          ach.current = ach.arrows.size;
        } else {
          ach.current += value;
        }
        
        if (ach.current >= ach.target) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
          unlocked.push(ach);
        }
      }
    });

    // 检查元成就
    const unlockedCount = this.achievements.filter(a => a.unlocked && a.id !== 'completionist').length;
    const metaAch = this.achievements.find(a => a.id === 'completionist');
    if (!metaAch.unlocked && unlockedCount >= 14) {
      metaAch.current = unlockedCount;
      metaAch.unlocked = true;
      metaAch.unlockedAt = Date.now();
      unlocked.push(metaAch);
    }

    if (unlocked.length > 0) {
      this.saveProgress();
      unlocked.forEach(ach => {
        this.listeners.forEach(callback => callback(ach));
      });
    }
  }

  onUnlock(callback) {
    this.listeners.push(callback);
  }

  reset() {
    localStorage.removeItem('phaser_achievements');
    this.achievements.forEach(ach => {
      ach.current = 0;
      ach.unlocked = false;
      ach.unlockedAt = null;
      ach.corners = null;
      ach.arrows = null;
    });
    this.saveProgress();
  }

  getStats() {
    const total = this.achievements.length;
    const unlocked = this.achievements.filter(a => a.unlocked).length;
    return { total, unlocked, percentage: Math.round((unlocked / total) * 100) };
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.keyCount = 0;
    this.spaceCount = 0;
    this.centerClickCount = 0;
    this.startTime = 0;
    this.comboClicks = [];
    this.recentUnlocks = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    this.startTime = Date.now();
    
    // 初始化成就系统
    this.achievementManager = new AchievementManager(this);
    this.achievementManager.onUnlock((achievement) => {
      this.showAchievementPopup(achievement);
      this.updateRecentUnlocks(achievement);
    });

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    this.add.text(400, 30, '🏆 成就系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建说明文本
    const instructions = [
      '点击屏幕 - 触发点击相关成就',
      '按空格键 - 触发空格成就',
      '按方向键 - 触发方向键成就',
      '点击四个角落 - 触发探索成就',
      '点击中心区域 - 触发中心成就',
      '快速连续点击 - 触发连击成就',
      '等待时间流逝 - 触发时间成就'
    ];

    let yPos = 80;
    instructions.forEach(text => {
      this.add.text(20, yPos, text, {
        fontSize: '14px',
        color: '#aaaaaa'
      });
      yPos += 20;
    });

    // 创建统计信息显示
    this.statsText = this.add.text(20, 240, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 10 }
    });

    // 创建成就列表
    this.createAchievementList();

    // 创建重置按钮
    this.createResetButton();

    // 创建中心区域指示器
    const centerGraphics = this.add.graphics();
    centerGraphics.lineStyle(2, 0x00ff00, 0.3);
    centerGraphics.strokeRect(300, 200, 200, 200);
    this.add.text(400, 300, '中心区域', {
      fontSize: '16px',
      color: '#00ff00',
      alpha: 0.5
    }).setOrigin(0.5);

    // 创建角落指示器
    this.createCornerIndicators();

    // 输入处理
    this.input.on('pointerdown', (pointer) => {
      this.handleClick(pointer);
    });

    this.input.keyboard.on('keydown', (event) => {
      this.handleKeyPress(event);
    });

    // 更新统计信息
    this.updateStats();
  }

  createCornerIndicators() {
    const corners = [
      { x: 50, y: 50, name: 'TL' },
      { x: 750, y: 50, name: 'TR' },
      { x: 50, y: 550, name: 'BL' },
      { x: 750, y: 550, name: 'BR' }
    ];

    corners.forEach(corner => {
      const g = this.add.graphics();
      g.lineStyle(2, 0xff6600, 0.5);
      g.strokeCircle(corner.x, corner.y, 30);
      this.add.text(corner.x, corner.y, corner.name, {
        fontSize: '12px',
        color: '#ff6600',
        alpha: 0.5
      }).setOrigin(0.5);
    });
  }

  createAchievementList() {
    this.achievementListContainer = this.add.container(420, 80);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a3e, 1);
    bg.fillRoundedRect(0, 0, 360, 460, 10);
    this.achievementListContainer.add(bg);

    const title = this.add.text(180, 15, '成就列表', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.achievementListContainer.add(title);

    this.achievementTexts = [];
    this.achievementManager.achievements.forEach((ach, index) => {
      const y = 50 + index * 28;
      const text = this.add.text(10, y, '', {
        fontSize: '12px',
        color: '#ffffff'
      });
      this.achievementListContainer.add(text);
      this.achievementTexts.push({ text, achievement: ach });
    });

    this.updateAchievementList();
  }

  updateAchievementList() {
    this.achievementTexts.forEach(({ text, achievement }) => {
      const icon = achievement.unlocked ? '✅' : '🔒';
      const progress = achievement.unlocked ? 'UNLOCKED' : `${achievement.current}/${achievement.target}`;
      const color = achievement.unlocked ? '#00ff00' : '#888888';
      
      text.setText(`${icon} ${achievement.name} - ${progress}`);
      text.setColor(color);
    });
  }

  createResetButton() {
    const button = this.add.graphics();
    button.fillStyle(0xff4444, 1);
    button.fillRoundedRect(20, 550, 120, 40, 5);
    button.setInteractive(new Phaser.Geom.Rectangle(20, 550, 120, 40), Phaser.Geom.Rectangle.Contains);

    const buttonText = this.add.text(80, 570, '重置进度', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.on('pointerdown', () => {
      this.achievementManager.reset();
      this.clickCount = 0;
      this.keyCount = 0;
      this.spaceCount = 0;
      this.centerClickCount = 0;
      this.comboClicks = [];
      this.recentUnlocks = [];
      this.updateAchievementList();
      this.updateStats();
      
      // 更新重置后成就进度
      const resetAch = this.achievementManager.achievements.find(a => a.id === 'persistent');
      if (resetAch) {
        resetAch.current = 0;
      }
    });

    button.on('pointerover', () => {
      button.clear();
      button.fillStyle(0xff6666, 1);
      button.fillRoundedRect(20, 550, 120, 40, 5);
    });

    button.on('pointerout', () => {
      button.clear();
      button.fillStyle(0xff4444, 1);
      button.fillRoundedRect(20, 550, 120, 40, 5);
    });
  }

  handleClick(pointer) {
    this.clickCount++;
    
    // 点击成就
    this.achievementManager.updateProgress('click', 1);

    // 连击检测
    const now = Date