// 成就管理器类
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = this.initAchievements();
    this.loadProgress();
  }

  initAchievements() {
    return {
      'first_click': {
        id: 'first_click',
        name: '初次点击',
        description: '点击屏幕1次',
        target: 1,
        current: 0,
        unlocked: false,
        icon: '👆'
      },
      'click_master': {
        id: 'click_master',
        name: '点击大师',
        description: '累计点击50次',
        target: 50,
        current: 0,
        unlocked: false,
        icon: '🖱️'
      },
      'speed_clicker': {
        id: 'speed_clicker',
        name: '快速点击',
        description: '1秒内点击5次',
        target: 5,
        current: 0,
        unlocked: false,
        icon: '⚡'
      },
      'corner_hunter': {
        id: 'corner_hunter',
        name: '角落猎人',
        description: '点击四个角落',
        target: 4,
        current: 0,
        unlocked: false,
        icon: '📐',
        corners: { tl: false, tr: false, bl: false, br: false }
      },
      'center_focus': {
        id: 'center_focus',
        name: '中心聚焦',
        description: '在中心区域点击10次',
        target: 10,
        current: 0,
        unlocked: false,
        icon: '🎯'
      },
      'time_survivor': {
        id: 'time_survivor',
        name: '时间生存者',
        description: '游戏运行30秒',
        target: 30000,
        current: 0,
        unlocked: false,
        icon: '⏱️'
      },
      'combo_starter': {
        id: 'combo_starter',
        name: 'Combo新手',
        description: '达到5连击',
        target: 5,
        current: 0,
        unlocked: false,
        icon: '🔥'
      },
      'combo_master': {
        id: 'combo_master',
        name: 'Combo大师',
        description: '达到10连击',
        target: 10,
        current: 0,
        unlocked: false,
        icon: '💥'
      },
      'key_presser': {
        id: 'key_presser',
        name: '键盘战士',
        description: '按下空格键20次',
        target: 20,
        current: 0,
        unlocked: false,
        icon: '⌨️'
      },
      'rainbow_collector': {
        id: 'rainbow_collector',
        name: '彩虹收集者',
        description: '点击所有颜色区域',
        target: 6,
        current: 0,
        unlocked: false,
        icon: '🌈',
        colors: { red: false, green: false, blue: false, yellow: false, purple: false, cyan: false }
      },
      'pattern_master': {
        id: 'pattern_master',
        name: '图案大师',
        description: '按顺序点击1-2-3-4区域',
        target: 4,
        current: 0,
        unlocked: false,
        icon: '🔢',
        sequence: []
      },
      'achievement_hunter': {
        id: 'achievement_hunter',
        name: '成就猎人',
        description: '解锁其他所有成就',
        target: 11,
        current: 0,
        unlocked: false,
        icon: '🏆'
      }
    };
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('phaser_achievements');
      if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          if (this.achievements[key]) {
            this.achievements[key] = { ...this.achievements[key], ...data[key] };
          }
        });
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
  }

  saveProgress() {
    try {
      localStorage.setItem('phaser_achievements', JSON.stringify(this.achievements));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }

  updateAchievement(id, increment = 1, extraData = null) {
    const achievement = this.achievements[id];
    if (!achievement || achievement.unlocked) return false;

    if (extraData) {
      Object.assign(achievement, extraData);
    }

    achievement.current += increment;

    if (achievement.current >= achievement.target) {
      achievement.unlocked = true;
      achievement.current = achievement.target;
      this.saveProgress();
      this.scene.showAchievementPopup(achievement);
      
      // 检查成就猎人
      this.checkAchievementHunter();
      return true;
    }

    this.saveProgress();
    return false;
  }

  checkAchievementHunter() {
    const unlockedCount = Object.values(this.achievements).filter(a => 
      a.unlocked && a.id !== 'achievement_hunter'
    ).length;
    
    if (unlockedCount >= 11 && !this.achievements.achievement_hunter.unlocked) {
      this.achievements.achievement_hunter.current = unlockedCount;
      this.achievements.achievement_hunter.unlocked = true;
      this.saveProgress();
      this.scene.showAchievementPopup(this.achievements.achievement_hunter);
    }
  }

  getProgress() {
    return Object.values(this.achievements);
  }

  resetAll() {
    this.achievements = this.initAchievements();
    localStorage.removeItem('phaser_achievements');
    this.scene.scene.restart();
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.totalClicks = 0;
    this.comboCount = 0;
    this.comboTimer = null;
    this.lastClickTime = 0;
    this.clickTimestamps = [];
    this.spaceCount = 0;
    this.gameStartTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    this.gameStartTime = this.time.now;
    
    // 初始化成就管理器
    this.achievementManager = new AchievementManager(this);

    // 创建背景
    this.createBackground();

    // 创建彩虹区域
    this.createRainbowZones();

    // 创建数字区域
    this.createNumberZones();

    // 创建UI
    this.createUI();

    // 设置输入
    this.setupInput();

    // 时间检测
    this.time.addEvent({
      delay: 1000,
      callback: this.checkTimeAchievement,
      callbackScope: this,
      loop: true
    });

    // 显示提示
    this.showInstructions();
  }

  createBackground() {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
  }

  createRainbowZones() {
    const colors = [
      { name: 'red', color: 0xff0000, x: 100, y: 100 },
      { name: 'green', color: 0x00ff00, x: 250, y: 100 },
      { name: 'blue', color: 0x0000ff, x: 400, y: 100 },
      { name: 'yellow', color: 0xffff00, x: 550, y: 100 },
      { name: 'purple', color: 0xff00ff, x: 175, y: 200 },
      { name: 'cyan', color: 0x00ffff, x: 475, y: 200 }
    ];

    this.rainbowZones = [];
    colors.forEach(zone => {
      const graphics = this.add.graphics();
      graphics.fillStyle(zone.color, 0.6);
      graphics.fillCircle(zone.x, zone.y, 40);
      graphics.setInteractive(
        new Phaser.Geom.Circle(zone.x, zone.y, 40),
        Phaser.Geom.Circle.Contains
      );
      graphics.on('pointerdown', () => this.onRainbowClick(zone.name));
      this.rainbowZones.push({ graphics, name: zone.name });
    });
  }

  createNumberZones() {
    const positions = [
      { num: 1, x: 100, y: 400 },
      { num: 2, x: 250, y: 400 },
      { num: 3, x: 400, y: 400 },
      { num: 4, x: 550, y: 400 }
    ];

    this.numberZones = [];
    positions.forEach(pos => {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x4a4a6a, 1);
      graphics.fillRoundedRect(pos.x - 30, pos.y - 30, 60, 60, 10);
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRoundedRect(pos.x - 30, pos.y - 30, 60, 60, 10);

      const text = this.add.text(pos.x, pos.y, pos.num.toString(), {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const zone = this.add.zone(pos.x, pos.y, 60, 60).setInteractive();
      zone.on('pointerdown', () => this.onNumberClick(pos.num));
      
      this.numberZones.push({ graphics, text, zone, num: pos.num });
    });
  }

  createUI() {
    // 顶部信息栏
    const uiBg = this.add.graphics();
    uiBg.fillStyle(0x0f0f1e, 0.9);
    uiBg.fillRect(0, 0, 800, 60);

    this.clickText = this.add.text(20, 15, 'Clicks: 0', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.comboText = this.add.text(150, 15, 'Combo: 0', {
      fontSize: '18px',
      color: '#ffaa00'
    });

    this.timeText = this.add.text(280, 15, 'Time: 0s', {
      fontSize: '18px',
      color: '#00ff00'
    });

    // 成就按钮
    const achievementBtn = this.add.graphics();
    achievementBtn.fillStyle(0x4a4a6a, 1);
    achievementBtn.fillRoundedRect(650, 10, 130, 40, 5);
    achievementBtn.setInteractive(
      new Phaser.Geom.Rectangle(650, 10, 130, 40),
      Phaser.Geom.Rectangle.Contains
    );
    achievementBtn.on('pointerdown', () => this.showAchievementPanel());

    this.add.text(715, 30, '🏆 Achievements', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 重置按钮
    const resetBtn = this.add.graphics();
    resetBtn.fillStyle(0x8a2a2a, 1);
    resetBtn.fillRoundedRect(20, 520, 100, 35, 5);
    resetBtn.setInteractive(
      new Phaser.Geom.Rectangle(20, 520, 100, 35),
      Phaser.Geom.Rectangle.Contains
    );
    resetBtn.on('pointerdown', () => {
      if (confirm('Reset all achievements?')) {
        this.achievementManager.resetAll();
      }
    });

    this.add.text(70, 537.5, 'Reset', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  showInstructions() {
    const instructions = [
      '🎮 Achievement System Demo',
      '• Click anywhere to earn achievements',
      '• Click colored circles for rainbow achievement',
      '• Click numbers 1-2-3-4 in order',
      '• Press SPACE for keyboard achievement',
      '• Click corners and center area',
      '• Build combos by clicking quickly'
    ];

    const text = this.add.text(400, 320, instructions.join('\n'), {
      fontSize: '14px',
      color: '#aaaaaa',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setAlpha(0.7);
  }

  setupInput() {
    // 鼠标点击
    this.input.on('pointerdown', (pointer) => {
      this.onScreenClick(pointer);
    });

    // 键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.spaceCount++;
      this.achievementManager.updateAchievement('key_presser', 1);
    });
  }

  onScreenClick(pointer) {
    this.totalClicks++;
    this.clickText.setText(`Clicks: ${this.totalClicks}`);

    // 第一次点击
    if (this.totalClicks === 1) {
      this.achievementManager.updateAch