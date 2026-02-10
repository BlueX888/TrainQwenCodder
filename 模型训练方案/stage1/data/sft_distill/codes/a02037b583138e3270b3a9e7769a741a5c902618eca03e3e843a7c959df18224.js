// 成就管理器类
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = {
      clicker: { id: 'clicker', name: '点击大师', desc: '点击100次', target: 100, current: 0, unlocked: false },
      survivor: { id: 'survivor', name: '生存者', desc: '存活60秒', target: 60, current: 0, unlocked: false },
      combo: { id: 'combo', name: '连击王', desc: '达成10连击', target: 10, current: 0, unlocked: false },
      collector: { id: 'collector', name: '收藏家', desc: '收集20个物品', target: 20, current: 0, unlocked: false },
      champion: { id: 'champion', name: '冠军', desc: '达到1000分', target: 1000, current: 0, unlocked: false }
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

  updateProgress(id, value) {
    const achievement = this.achievements[id];
    if (!achievement || achievement.unlocked) return false;

    achievement.current = Math.min(value, achievement.target);
    this.saveProgress();

    if (achievement.current >= achievement.target && !achievement.unlocked) {
      achievement.unlocked = true;
      this.saveProgress();
      return true; // 成就解锁
    }
    return false;
  }

  getAll() {
    return Object.values(this.achievements);
  }

  reset() {
    Object.values(this.achievements).forEach(ach => {
      ach.current = 0;
      ach.unlocked = false;
    });
    this.saveProgress();
  }
}

// 成就弹窗类
class AchievementPopup {
  constructor(scene, achievement) {
    this.scene = scene;
    this.container = scene.add.container(400, -150);

    // 背景
    const bg = scene.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-200, -60, 400, 120, 10);
    bg.lineStyle(3, 0xf39c12, 1);
    bg.strokeRoundedRect(-200, -60, 400, 120, 10);

    // 图标背景
    const iconBg = scene.add.graphics();
    iconBg.fillStyle(0xf39c12, 1);
    iconBg.fillCircle(-140, 0, 35);

    // 图标（星星）
    const icon = scene.add.graphics();
    icon.fillStyle(0xffffff, 1);
    icon.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 - 90) * Math.PI / 180;
      const x = -140 + Math.cos(angle) * 25;
      const y = Math.sin(angle) * 25;
      if (i === 0) icon.moveTo(x, y);
      else icon.lineTo(x, y);
      const innerAngle = (i * 144 + 72 - 90) * Math.PI / 180;
      const ix = -140 + Math.cos(innerAngle) * 12;
      const iy = Math.sin(innerAngle) * 12;
      icon.lineTo(ix, iy);
    }
    icon.closePath();
    icon.fillPath();

    // 成就解锁文本
    const unlockText = scene.add.text(-60, -30, '成就解锁!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold'
    });

    // 成就名称
    const nameText = scene.add.text(-60, -5, achievement.name, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 成就描述
    const descText = scene.add.text(-60, 25, achievement.desc, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#bdc3c7'
    });

    this.container.add([bg, iconBg, icon, unlockText, nameText, descText]);
    this.container.setDepth(1000);

    this.show();
  }

  show() {
    this.scene.tweens.add({
      targets: this.container,
      y: 100,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(3000, () => this.hide());
      }
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this.container,
      y: -150,
      alpha: 0,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.container.destroy();
      }
    });
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.surviveTime = 0;
    this.comboCount = 0;
    this.collectCount = 0;
    this.score = 0;
    this.lastClickTime = 0;
    this.collectibles = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化成就管理器
    this.achievementManager = new AchievementManager(this);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x34495e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 标题
    this.add.text(400, 30, '成就系统演示', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建游戏区域
    this.createGameArea();

    // 创建成就面板
    this.createAchievementPanel();

    // 创建统计面板
    this.createStatsPanel();

    // 创建重置按钮
    this.createResetButton();

    // 生成收集物
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true
    });

    // 存活时间计时器
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.surviveTime++;
        this.checkAchievement('survivor', this.surviveTime);
        this.updateStats();
      },
      callbackScope: this,
      loop: true
    });
  }

  createGameArea() {
    // 游戏区域背景
    const gameArea = this.add.graphics();
    gameArea.fillStyle(0x2c3e50, 1);
    gameArea.fillRect(50, 100, 500, 400);
    gameArea.lineStyle(2, 0x3498db, 1);
    gameArea.strokeRect(50, 100, 500, 400);

    // 可点击区域
    const clickZone = this.add.graphics();
    clickZone.fillStyle(0x3498db, 1);
    clickZone.fillRoundedRect(100, 150, 200, 100, 10);
    clickZone.setInteractive(new Phaser.Geom.Rectangle(100, 150, 200, 100), Phaser.Geom.Rectangle.Contains);

    this.add.text(200, 200, '点击我!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    clickZone.on('pointerdown', () => {
      this.handleClick();
    });

    // 提示文本
    this.add.text(300, 520, '点击蓝色区域、收集绿色物品、达成目标解锁成就', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    }).setOrigin(0.5);
  }

  createAchievementPanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x2c3e50, 1);
    panel.fillRect(570, 100, 210, 400);
    panel.lineStyle(2, 0xf39c12, 1);
    panel.strokeRect(570, 100, 210, 400);

    this.add.text(675, 120, '成就列表', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.achievementTexts = [];
    const achievements = this.achievementManager.getAll();
    achievements.forEach((ach, index) => {
      const y = 160 + index * 60;
      const text = this.add.text(580, y, '', {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#ecf0f1',
        wordWrap: { width: 190 }
      });
      this.achievementTexts.push(text);
    });

    this.updateAchievementPanel();
  }

  updateAchievementPanel() {
    const achievements = this.achievementManager.getAll();
    achievements.forEach((ach, index) => {
      const status = ach.unlocked ? '✓' : `${ach.current}/${ach.target}`;
      const color = ach.unlocked ? '#2ecc71' : '#ecf0f1';
      this.achievementTexts[index].setText(`${ach.name}\n${ach.desc}\n${status}`);
      this.achievementTexts[index].setColor(color);
    });
  }

  createStatsPanel() {
    this.add.text(50, 520, '统计:', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });

    this.statsText = this.add.text(50, 540, '', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#bdc3c7'
    });

    this.updateStats();
  }

  updateStats() {
    this.statsText.setText(
      `点击: ${this.clickCount} | 时间: ${this.surviveTime}s | 连击: ${this.comboCount} | 收集: ${this.collectCount} | 分数: ${this.score}`
    );
  }

  createResetButton() {
    const btn = this.add.graphics();
    btn.fillStyle(0xe74c3c, 1);
    btn.fillRoundedRect(350, 150, 150, 50, 10);
    btn.setInteractive(new Phaser.Geom.Rectangle(350, 150, 150, 50), Phaser.Geom.Rectangle.Contains);

    this.add.text(425, 175, '重置成就', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      this.achievementManager.reset();
      this.updateAchievementPanel();
    });
  }

  handleClick() {
    this.clickCount++;
    this.score += 10;

    // 检测连击
    const currentTime = this.time.now;
    if (currentTime - this.lastClickTime < 500) {
      this.comboCount++;
      this.checkAchievement('combo', this.comboCount);
    } else {
      this.comboCount = 1;
    }
    this.lastClickTime = currentTime;

    this.checkAchievement('clicker', this.clickCount);
    this.checkAchievement('champion', this.score);
    this.updateStats();
  }

  spawnCollectible() {
    const x = Phaser.Math.Between(100, 500);
    const y = Phaser.Math.Between(300, 450);

    const collectible = this.add.graphics();
    collectible.fillStyle(0x2ecc71, 1);
    collectible.fillCircle(x, y, 15);
    collectible.setInteractive(new Phaser.Geom.Circle(x, y, 15), Phaser.Geom.Circle.Contains);

    collectible.on('pointerdown', () => {
      this.collectCount++;
      this.score += 50;
      this.checkAchievement('collector', this.collectCount);
      this.checkAchievement('champion', this.score);
      this.updateStats();
      collectible.destroy();
    });

    this.collectibles.push(collectible);

    // 3秒后自动消失
    this.time.delayedCall(3000, () => {
      if (collectible.scene) {
        collectible.destroy();
      }
    });
  }

  checkAchievement(id, value) {