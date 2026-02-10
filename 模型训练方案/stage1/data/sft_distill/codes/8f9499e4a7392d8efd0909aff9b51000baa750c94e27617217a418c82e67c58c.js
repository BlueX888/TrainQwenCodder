// 成就系统管理类
class AchievementManager {
  constructor() {
    this.achievements = [
      { id: 'first_click', name: '初次尝试', desc: '点击按钮1次', target: 1, current: 0, unlocked: false },
      { id: 'click_master', name: '点击大师', desc: '点击按钮50次', target: 50, current: 0, unlocked: false },
      { id: 'speed_demon', name: '速度恶魔', desc: '3秒内点击10次', target: 10, current: 0, unlocked: false, timeLimit: 3000 },
      { id: 'combo_starter', name: '连击入门', desc: '达成5连击', target: 5, current: 0, unlocked: false },
      { id: 'combo_master', name: '连击大师', desc: '达成20连击', target: 20, current: 0, unlocked: false },
      { id: 'persistent', name: '坚持不懈', desc: '游戏运行60秒', target: 60000, current: 0, unlocked: false },
      { id: 'color_hunter', name: '色彩猎人', desc: '点击5种不同颜色', target: 5, current: 0, unlocked: false, colors: new Set() },
      { id: 'reset_veteran', name: '重置老手', desc: '重置进度3次', target: 3, current: 0, unlocked: false },
      { id: 'achievement_viewer', name: '成就查看者', desc: '打开成就面板5次', target: 5, current: 0, unlocked: false },
      { id: 'completionist', name: '完美主义者', desc: '解锁所有其他成就', target: 9, current: 0, unlocked: false }
    ];
    
    this.loadProgress();
    this.clickTimes = [];
    this.comboCount = 0;
    this.comboTimer = null;
    this.startTime = Date.now();
  }

  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        data.forEach((savedAch, index) => {
          if (this.achievements[index]) {
            this.achievements[index].current = savedAch.current;
            this.achievements[index].unlocked = savedAch.unlocked;
            if (savedAch.colors) {
              this.achievements[index].colors = new Set(savedAch.colors);
            }
          }
        });
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }

  saveProgress() {
    const data = this.achievements.map(ach => ({
      id: ach.id,
      current: ach.current,
      unlocked: ach.unlocked,
      colors: ach.colors ? Array.from(ach.colors) : undefined
    }));
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }

  checkAchievement(id) {
    const ach = this.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked && ach.current >= ach.target) {
      ach.unlocked = true;
      this.saveProgress();
      this.checkCompletionist();
      return ach;
    }
    return null;
  }

  checkCompletionist() {
    const completionist = this.achievements.find(a => a.id === 'completionist');
    if (completionist && !completionist.unlocked) {
      const unlockedCount = this.achievements.filter(a => a.unlocked && a.id !== 'completionist').length;
      completionist.current = unlockedCount;
      if (unlockedCount >= 9) {
        completionist.unlocked = true;
        this.saveProgress();
        return completionist;
      }
    }
    return null;
  }

  onButtonClick(color) {
    const now = Date.now();
    const unlockedAchievements = [];

    // 点击次数成就
    const firstClick = this.achievements.find(a => a.id === 'first_click');
    if (!firstClick.unlocked) {
      firstClick.current++;
      const result = this.checkAchievement('first_click');
      if (result) unlockedAchievements.push(result);
    }

    const clickMaster = this.achievements.find(a => a.id === 'click_master');
    if (!clickMaster.unlocked) {
      clickMaster.current++;
      const result = this.checkAchievement('click_master');
      if (result) unlockedAchievements.push(result);
    }

    // 速度成就
    this.clickTimes.push(now);
    this.clickTimes = this.clickTimes.filter(t => now - t < 3000);
    const speedDemon = this.achievements.find(a => a.id === 'speed_demon');
    if (!speedDemon.unlocked) {
      speedDemon.current = this.clickTimes.length;
      const result = this.checkAchievement('speed_demon');
      if (result) unlockedAchievements.push(result);
    }

    // 连击成就
    this.comboCount++;
    if (this.comboTimer) clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => { this.comboCount = 0; }, 1000);

    const comboStarter = this.achievements.find(a => a.id === 'combo_starter');
    if (!comboStarter.unlocked && this.comboCount >= 5) {
      comboStarter.current = this.comboCount;
      const result = this.checkAchievement('combo_starter');
      if (result) unlockedAchievements.push(result);
    }

    const comboMaster = this.achievements.find(a => a.id === 'combo_master');
    if (!comboMaster.unlocked && this.comboCount >= 20) {
      comboMaster.current = this.comboCount;
      const result = this.checkAchievement('combo_master');
      if (result) unlockedAchievements.push(result);
    }

    // 颜色成就
    const colorHunter = this.achievements.find(a => a.id === 'color_hunter');
    if (!colorHunter.unlocked) {
      colorHunter.colors.add(color);
      colorHunter.current = colorHunter.colors.size;
      const result = this.checkAchievement('color_hunter');
      if (result) unlockedAchievements.push(result);
    }

    this.saveProgress();
    return unlockedAchievements;
  }

  updateTime() {
    const elapsed = Date.now() - this.startTime;
    const persistent = this.achievements.find(a => a.id === 'persistent');
    if (!persistent.unlocked) {
      persistent.current = elapsed;
      const result = this.checkAchievement('persistent');
      if (result) return [result];
    }
    return [];
  }

  onReset() {
    const resetVeteran = this.achievements.find(a => a.id === 'reset_veteran');
    if (!resetVeteran.unlocked) {
      resetVeteran.current++;
      const result = this.checkAchievement('reset_veteran');
      this.saveProgress();
      if (result) return [result];
    }
    return [];
  }

  onViewAchievements() {
    const viewer = this.achievements.find(a => a.id === 'achievement_viewer');
    if (!viewer.unlocked) {
      viewer.current++;
      const result = this.checkAchievement('achievement_viewer');
      this.saveProgress();
      if (result) return [result];
    }
    return [];
  }

  getProgress() {
    return {
      total: this.achievements.length,
      unlocked: this.achievements.filter(a => a.unlocked).length,
      achievements: this.achievements
    };
  }

  resetAll() {
    this.achievements.forEach(ach => {
      ach.current = 0;
      ach.unlocked = false;
      if (ach.colors) ach.colors.clear();
    });
    this.clickTimes = [];
    this.comboCount = 0;
    this.startTime = Date.now();
    this.saveProgress();
  }
}

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.achievementManager = new AchievementManager();
    this.achievementQueue = [];
    this.showingAchievement = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    this.add.text(400, 40, '成就系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建状态显示
    this.statusText = this.add.text(400, 90, '', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.comboText = this.add.text(400, 115, '', {
      fontSize: '18px',
      color: '#ffaa00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建彩色按钮
    const colors = [
      { hex: 0xff6b6b, name: 'red' },
      { hex: 0x4ecdc4, name: 'cyan' },
      { hex: 0xffe66d, name: 'yellow' },
      { hex: 0x95e1d3, name: 'green' },
      { hex: 0xf38181, name: 'pink' },
      { hex: 0xaa96da, name: 'purple' }
    ];

    const startY = 160;
    colors.forEach((color, index) => {
      const y = startY + Math.floor(index / 3) * 80;
      const x = 200 + (index % 3) * 200;
      this.createColorButton(x, y, color.hex, color.name);
    });

    // 创建控制按钮
    this.createButton(150, 480, '查看成就', 0x4a90e2, () => {
      const newAchs = this.achievementManager.onViewAchievements();
      this.queueAchievements(newAchs);
      this.showAchievementPanel();
    });

    this.createButton(400, 480, '重置进度', 0xe74c3c, () => {
      const newAchs = this.achievementManager.onReset();
      this.queueAchievements(newAchs);
      this.achievementManager.resetAll();
      this.updateStatus();
    });

    this.createButton(650, 480, '清除存档', 0x95a5a6, () => {
      localStorage.removeItem('phaser_achievements');
      this.scene.restart();
    });

    // 创建成就进度条
    this.createProgressBar();

    // 更新状态
    this.updateStatus();

    // 定时检查时间成就
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const newAchs = this.achievementManager.updateTime();
        this.queueAchievements(newAchs);
        this.updateStatus();
      },
      loop: true
    });
  }

  createColorButton(x, y, color, name) {
    const button = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-60, -25, 120, 50, 10);
    bg.lineStyle(2, 0xffffff, 0.5);
    bg.strokeRoundedRect(-60, -25, 120, 50, 10);

    const text = this.add.text(0, 0, '点击', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, text]);
    button.setSize(120, 50);
    button.setInteractive(new Phaser.Geom.Rectangle(-60, -25, 120, 50), Phaser.Geom.Rectangle.Contains);

    button.on('pointerdown', () => {
      bg.clear();
      bg.fillStyle(color, 0.8);
      bg.fillRoundedRect(-60, -25, 120, 50, 10);
      bg.lineStyle(2, 0xffffff, 0.8);
      bg.strokeRoundedRect(-60, -25, 120, 50, 10);

      const newAchs = this.achievementManager.onButtonClick(name);
      this.queueAchievements(newAchs);
      this.updateStatus();
    });

    button.on('pointerup', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-60, -25, 120, 50, 10);
      bg.lineStyle(2, 0xffffff, 0.5);
      bg.strokeRoundedRect(-60, -25, 120, 50, 10);
    });

    button.on('pointerover', () => {
      bg.lineStyle(3, 0xffffff, 1);
      bg.strokeRoundedRect(-60, -25, 120, 50, 10);
    });

    button.on('pointerout', () => {
      bg.lineStyle(2, 0xffffff, 0.5);
      bg.strokeRoundedRect(-60, -25, 120, 50, 10