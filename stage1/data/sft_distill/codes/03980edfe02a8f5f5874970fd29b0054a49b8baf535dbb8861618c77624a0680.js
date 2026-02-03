// 成就管理器类
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = {
      clicker: {
        id: 'clicker',
        name: '点击大师',
        description: '点击屏幕100次',
        target: 100,
        current: 0,
        unlocked: false,
        icon: '🖱️'
      },
      survivor: {
        id: 'survivor',
        name: '生存专家',
        description: '存活30秒',
        target: 30000,
        current: 0,
        unlocked: false,
        icon: '⏱️'
      },
      collector: {
        id: 'collector',
        name: '收藏家',
        description: '收集20个物品',
        target: 20,
        current: 0,
        unlocked: false,
        icon: '💎'
      },
      combo: {
        id: 'combo',
        name: '连击王',
        description: '达成10连击',
        target: 10,
        current: 0,
        unlocked: false,
        icon: '⚡'
      },
      explorer: {
        id: 'explorer',
        name: '探索者',
        description: '访问4个区域',
        target: 4,
        current: 0,
        unlocked: false,
        icon: '🗺️'
      }
    };
    
    this.loadProgress();
  }

  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        if (this.achievements[key]) {
          this.achievements[key].current = data[key].current;
          this.achievements[key].unlocked = data[key].unlocked;
        }
      });
    }
  }

  saveProgress() {
    const data = {};
    Object.keys(this.achievements).forEach(key => {
      data[key] = {
        current: this.achievements[key].current,
        unlocked: this.achievements[key].unlocked
      };
    });
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }

  updateProgress(achievementId, value) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return false;

    achievement.current = Math.min(value, achievement.target);
    
    if (achievement.current >= achievement.target && !achievement.unlocked) {
      achievement.unlocked = true;
      this.saveProgress();
      return true; // 成就解锁
    }
    
    this.saveProgress();
    return false;
  }

  getAchievement(id) {
    return this.achievements[id];
  }

  getAllAchievements() {
    return Object.values(this.achievements);
  }
}

// 成就弹窗类
class AchievementPopup extends Phaser.GameObjects.Container {
  constructor(scene, achievement) {
    super(scene, 400, -100);
    
    // 背景
    const bg = scene.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-150, -40, 300, 80, 10);
    bg.lineStyle(3, 0xf39c12, 1);
    bg.strokeRoundedRect(-150, -40, 300, 80, 10);
    this.add(bg);

    // 成就图标背景
    const iconBg = scene.add.graphics();
    iconBg.fillStyle(0xf39c12, 1);
    iconBg.fillCircle(-100, 0, 25);
    this.add(iconBg);

    // 成就图标文字
    const iconText = scene.add.text(-100, 0, achievement.icon, {
      fontSize: '32px',
      color: '#ffffff'
    });
    iconText.setOrigin(0.5);
    this.add(iconText);

    // "成就解锁"标题
    const title = scene.add.text(-50, -15, '🎉 成就解锁!', {
      fontSize: '14px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    this.add(title);

    // 成就名称
    const name = scene.add.text(-50, 5, achievement.name, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.add(name);

    // 成就描述
    const desc = scene.add.text(-50, 25, achievement.description, {
      fontSize: '12px',
      color: '#bdc3c7'
    });
    this.add(desc);

    scene.add.existing(this);
    this.setDepth(1000);

    // 动画效果
    this.show();
  }

  show() {
    this.scene.tweens.add({
      targets: this,
      y: 80,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(3000, () => {
          this.hide();
        });
      }
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this,
      y: -100,
      alpha: 0,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.destroy();
      }
    });
  }
}

// 成就面板类
class AchievementPanel extends Phaser.GameObjects.Container {
  constructor(scene, achievementManager) {
    super(scene, 600, 50);
    
    this.achievementManager = achievementManager;
    
    // 背景
    const bg = scene.add.graphics();
    bg.fillStyle(0x34495e, 0.9);
    bg.fillRoundedRect(0, 0, 180, 400, 8);
    bg.lineStyle(2, 0x95a5a6, 1);
    bg.strokeRoundedRect(0, 0, 180, 400, 8);
    this.add(bg);

    // 标题
    const title = scene.add.text(90, 15, '成就系统', {
      fontSize: '18px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5, 0);
    this.add(title);

    // 成就列表
    this.achievementTexts = [];
    const achievements = achievementManager.getAllAchievements();
    achievements.forEach((ach, index) => {
      const y = 50 + index * 70;
      
      // 成就项背景
      const itemBg = scene.add.graphics();
      if (ach.unlocked) {
        itemBg.fillStyle(0x27ae60, 0.3);
      } else {
        itemBg.fillStyle(0x7f8c8d, 0.2);
      }
      itemBg.fillRoundedRect(10, y, 160, 60, 5);
      this.add(itemBg);

      // 图标
      const icon = scene.add.text(25, y + 10, ach.icon, {
        fontSize: '24px'
      });
      this.add(icon);

      // 名称
      const name = scene.add.text(55, y + 8, ach.name, {
        fontSize: '12px',
        color: ach.unlocked ? '#2ecc71' : '#bdc3c7',
        fontStyle: 'bold'
      });
      this.add(name);

      // 进度
      const progress = scene.add.text(55, y + 25, `${ach.current}/${ach.target}`, {
        fontSize: '10px',
        color: '#95a5a6'
      });
      this.add(progress);
      this.achievementTexts.push({ progress, icon, name, itemBg, achievement: ach });

      // 进度条
      const progressBarBg = scene.add.graphics();
      progressBarBg.fillStyle(0x34495e, 1);
      progressBarBg.fillRect(55, y + 40, 110, 8);
      this.add(progressBarBg);

      const progressBar = scene.add.graphics();
      const percent = Math.min(ach.current / ach.target, 1);
      progressBar.fillStyle(ach.unlocked ? 0x2ecc71 : 0x3498db, 1);
      progressBar.fillRect(55, y + 40, 110 * percent, 8);
      this.add(progressBar);
      this.achievementTexts[index].progressBar = progressBar;
    });

    scene.add.existing(this);
    this.setDepth(100);
  }

  update() {
    // 更新进度显示
    this.achievementTexts.forEach(item => {
      const ach = item.achievement;
      item.progress.setText(`${ach.current}/${ach.target}`);
      
      // 更新进度条
      item.progressBar.clear();
      const percent = Math.min(ach.current / ach.target, 1);
      item.progressBar.fillStyle(ach.unlocked ? 0x2ecc71 : 0x3498db, 1);
      item.progressBar.fillRect(55, item.progressBar.y, 110 * percent, 8);
      
      // 更新颜色
      if (ach.unlocked) {
        item.name.setColor('#2ecc71');
      }
    });
  }
}

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化成就管理器
    this.achievementManager = new AchievementManager(this);
    
    // 游戏状态
    this.clickCount = this.achievementManager.getAchievement('clicker').current;
    this.survivalTime = this.achievementManager.getAchievement('survivor').current;
    this.collectedItems = this.achievementManager.getAchievement('collector').current;
    this.comboCount = 0;
    this.maxCombo = this.achievementManager.getAchievement('combo').current;
    this.visitedZones = new Set();
    const explorerData = this.achievementManager.getAchievement('explorer').current;
    for (let i = 0; i < explorerData; i++) {
      this.visitedZones.add(i);
    }
    
    this.lastClickTime = 0;
    this.startTime = Date.now() - this.survivalTime;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建4个区域
    this.zones = [];
    const zoneColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12];
    const zonePositions = [
      { x: 100, y: 150, name: '红色区域' },
      { x: 300, y: 150, name: '蓝色区域' },
      { x: 100, y: 350, name: '绿色区域' },
      { x: 300, y: 350, name: '黄色区域' }
    ];

    zonePositions.forEach((pos, index) => {
      const zone = this.add.graphics();
      zone.fillStyle(zoneColors[index], 0.3);
      zone.fillRect(pos.x, pos.y, 150, 150);
      zone.lineStyle(2, zoneColors[index], 1);
      zone.strokeRect(pos.x, pos.y, 150, 150);
      
      const label = this.add.text(pos.x + 75, pos.y + 75, pos.name, {
        fontSize: '12px',
        color: '#ffffff'
      });
      label.setOrigin(0.5);
      
      this.zones.push({ graphics: zone, x: pos.x, y: pos.y, w: 150, h: 150, index });
    });

    // 可收集物品
    this.items = [];
    this.spawnItems();

    // 玩家（用于探索区域）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(0, 0, 15);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();
    
    this.player = this.add.sprite(400, 500, 'player');

    // UI文本
    this.statsText = this.add.text(20, 20, '', {
      fontSize: '14px',
      color: '#ecf0f1',
      backgroundColor: '#2c3e5088',
      padding: { x: 10, y: 8 }
    });
    this.statsText.setDepth(50);

    // 成就面板
    this.achievementPanel = new AchievementPanel(this, this.achievementManager);

    // 说明文本
    const instructions = this.add.text(400, 550, 
      '点击屏幕 | 方向键移动探索区域 | 自动收集物品', {
      fontSize: '12px',
      color: '#95a5a6'
    });
    instructions.setOrigin(0.5);

    // 输入处理
    this.input.on('pointerdown', this.handleClick, this);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.updateStats();
  }

  handleClick() {
    this.clickCount++;
    
    // 连击系统
    const now = Date.now();
    if (now - this.lastClickTime < 500) {