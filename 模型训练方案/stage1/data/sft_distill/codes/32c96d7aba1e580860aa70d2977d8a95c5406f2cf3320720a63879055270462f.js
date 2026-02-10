// 成就系统完整实现
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = this.initAchievements();
    this.loadProgress();
  }

  initAchievements() {
    return [
      {
        id: 'first_click',
        name: '初次尝试',
        description: '点击屏幕1次',
        target: 1,
        current: 0,
        unlocked: false,
        type: 'click'
      },
      {
        id: 'click_master',
        name: '点击大师',
        description: '累计点击50次',
        target: 50,
        current: 0,
        unlocked: false,
        type: 'click'
      },
      {
        id: 'survivor',
        name: '幸存者',
        description: '存活30秒',
        target: 30,
        current: 0,
        unlocked: false,
        type: 'time'
      },
      {
        id: 'collector',
        name: '收集家',
        description: '收集10个物品',
        target: 10,
        current: 0,
        unlocked: false,
        type: 'collect'
      },
      {
        id: 'speed_demon',
        name: '速度恶魔',
        description: '移动距离超过5000像素',
        target: 5000,
        current: 0,
        unlocked: false,
        type: 'distance'
      },
      {
        id: 'combo_king',
        name: '连击之王',
        description: '达成10次连击',
        target: 10,
        current: 0,
        unlocked: false,
        type: 'combo'
      },
      {
        id: 'explorer',
        name: '探索者',
        description: '访问所有4个区域',
        target: 4,
        current: 0,
        unlocked: false,
        type: 'explore',
        visited: new Set()
      },
      {
        id: 'perfectionist',
        name: '完美主义者',
        description: '连续收集5个物品不失误',
        target: 5,
        current: 0,
        unlocked: false,
        type: 'perfect'
      },
      {
        id: 'fast_clicker',
        name: '快速点击',
        description: '1秒内点击5次',
        target: 5,
        current: 0,
        unlocked: false,
        type: 'fast_click',
        clicks: []
      },
      {
        id: 'completionist',
        name: '成就达人',
        description: '解锁所有其他成就',
        target: 9,
        current: 0,
        unlocked: false,
        type: 'meta'
      }
    ];
  }

  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      this.achievements.forEach(achievement => {
        const savedAch = data.find(a => a.id === achievement.id);
        if (savedAch) {
          achievement.current = savedAch.current;
          achievement.unlocked = savedAch.unlocked;
          if (achievement.type === 'explore' && savedAch.visited) {
            achievement.visited = new Set(savedAch.visited);
          }
        }
      });
    }
  }

  saveProgress() {
    const data = this.achievements.map(a => ({
      id: a.id,
      current: a.current,
      unlocked: a.unlocked,
      visited: a.visited ? Array.from(a.visited) : undefined
    }));
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }

  updateAchievement(type, value = 1) {
    this.achievements.forEach(achievement => {
      if (achievement.unlocked || achievement.type !== type) return;

      if (type === 'explore') {
        achievement.visited.add(value);
        achievement.current = achievement.visited.size;
      } else if (type === 'fast_click') {
        const now = Date.now();
        achievement.clicks.push(now);
        achievement.clicks = achievement.clicks.filter(t => now - t < 1000);
        achievement.current = achievement.clicks.length;
      } else {
        achievement.current += value;
      }

      if (achievement.current >= achievement.target) {
        this.unlockAchievement(achievement);
      }
    });

    this.saveProgress();
  }

  unlockAchievement(achievement) {
    achievement.unlocked = true;
    this.scene.events.emit('achievement-unlocked', achievement);
    
    // 检查元成就
    const unlockedCount = this.achievements.filter(a => 
      a.unlocked && a.type !== 'meta'
    ).length;
    const metaAch = this.achievements.find(a => a.type === 'meta');
    if (metaAch && !metaAch.unlocked) {
      metaAch.current = unlockedCount;
      if (unlockedCount >= metaAch.target) {
        metaAch.unlocked = true;
        this.scene.events.emit('achievement-unlocked', metaAch);
      }
    }
  }

  getAchievements() {
    return this.achievements;
  }
}

class AchievementPopup {
  constructor(scene, achievement) {
    this.scene = scene;
    this.container = scene.add.container(400, -150);

    // 背景
    const bg = scene.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-180, -60, 360, 120, 10);
    bg.lineStyle(3, 0xf39c12, 1);
    bg.strokeRoundedRect(-180, -60, 360, 120, 10);
    this.container.add(bg);

    // 图标
    const icon = scene.add.graphics();
    icon.fillStyle(0xf39c12, 1);
    icon.fillCircle(-130, 0, 30);
    icon.fillStyle(0xffffff, 1);
    icon.fillStar(-130, 0, 5, 15, 25, 0);
    this.container.add(icon);

    // 标题
    const title = scene.add.text(-80, -30, '🏆 成就解锁!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    this.container.add(title);

    // 成就名称
    const name = scene.add.text(-80, 0, achievement.name, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    this.container.add(name);

    // 描述
    const desc = scene.add.text(-80, 25, achievement.description, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    this.container.add(desc);

    this.show();
  }

  show() {
    // 滑入动画
    this.scene.tweens.add({
      targets: this.container,
      y: 80,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 停留后滑出
    this.scene.time.delayedCall(3000, () => {
      this.scene.tweens.add({
        targets: this.container,
        y: -150,
        duration: 400,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.container.destroy();
        }
      });
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化成就系统
    this.achievementManager = new AchievementManager(this);
    
    // 游戏状态
    this.clickCount = 0;
    this.survivalTime = 0;
    this.collectCount = 0;
    this.distance = 0;
    this.comboCount = 0;
    this.perfectStreak = 0;
    this.lastComboTime = 0;
    this.playerX = 400;
    this.playerY = 300;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建4个区域（用于探索成就）
    this.createZones();

    // 玩家
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 15);
    this.player.x = this.playerX;
    this.player.y = this.playerY;

    // 可收集物品
    this.collectibles = this.add.group();
    this.spawnCollectible();

    // UI文本
    this.createUI();

    // 输入
    this.input.on('pointerdown', this.handleClick, this);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 成就解锁监听
    this.events.on('achievement-unlocked', this.showAchievementPopup, this);

    // 计时器
    this.time.addEvent({
      delay: 1000,
      callback: this.updateSurvivalTime,
      callbackScope: this,
      loop: true
    });

    // 显示成就列表按钮
    this.createAchievementButton();
  }

  createZones() {
    this.zones = [
      { x: 0, y: 0, width: 400, height: 300, color: 0x3498db, name: 'Zone A' },
      { x: 400, y: 0, width: 400, height: 300, color: 0xe74c3c, name: 'Zone B' },
      { x: 0, y: 300, width: 400, height: 300, color: 0x2ecc71, name: 'Zone C' },
      { x: 400, y: 300, width: 400, height: 300, color: 0xf39c12, name: 'Zone D' }
    ];

    this.zones.forEach(zone => {
      const graphics = this.add.graphics();
      graphics.fillStyle(zone.color, 0.1);
      graphics.fillRect(zone.x, zone.y, zone.width, zone.height);
      graphics.lineStyle(2, zone.color, 0.3);
      graphics.strokeRect(zone.x, zone.y, zone.width, zone.height);

      const text = this.add.text(
        zone.x + zone.width / 2,
        zone.y + 20,
        zone.name,
        { fontSize: '16px', color: '#ffffff' }
      ).setOrigin(0.5);
    });
  }

  createUI() {
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatsText();
  }

  updateStatsText() {
    const unlockedCount = this.achievementManager.getAchievements()
      .filter(a => a.unlocked).length;
    
    this.statsText.setText([
      `点击: ${this.clickCount}`,
      `存活: ${this.survivalTime}s`,
      `收集: ${this.collectCount}`,
      `距离: ${Math.floor(this.distance)}`,
      `连击: ${this.comboCount}`,
      `完美: ${this.perfectStreak}`,
      `成就: ${unlockedCount}/10`
    ]);
  }

  createAchievementButton() {
    const button = this.add.graphics();
    button.fillStyle(0x3498db, 1);
    button.fillRoundedRect(650, 10, 140, 40, 5);
    button.setInteractive(
      new Phaser.Geom.Rectangle(650, 10, 140, 40),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText = this.add.text(720, 30, '查看成就', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    button.on('pointerdown', () => {
      this.showAchievementList();
    });
  }

  showAchievementList() {
    // 创建遮罩
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, 800, 600);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 800, 600),
      Phaser.Geom.Rectangle.Contains
    );

    // 面板
    const panel = this.add.graphics();
    panel.fillStyle(0x2c3e50, 1);
    panel.fillRoundedRect(100, 50, 600, 500, 10);
    panel.lineStyle(3, 0x3498db, 1);
    panel.strokeRoundedRect(100, 50, 600, 500, 10);

    // 标题
    const title = this.add.text(400, 80, '🏆 成就列表', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 成就列表
    const achievements = this.achiev