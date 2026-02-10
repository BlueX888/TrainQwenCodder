// 成就管理器类
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = {
      clicker: {
        id: 'clicker',
        name: '点击达人',
        description: '点击屏幕50次',
        target: 50,
        progress: 0,
        unlocked: false,
        icon: '🖱️'
      },
      survivor: {
        id: 'survivor',
        name: '时间旅者',
        description: '游戏运行30秒',
        target: 30000, // 毫秒
        progress: 0,
        unlocked: false,
        icon: '⏰'
      },
      collector: {
        id: 'collector',
        name: '收藏家',
        description: '收集10个物品',
        target: 10,
        progress: 0,
        unlocked: false,
        icon: '💎'
      }
    };
    
    this.loadProgress();
  }

  // 从localStorage加载成就进度
  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          if (this.achievements[key]) {
            this.achievements[key].progress = data[key].progress;
            this.achievements[key].unlocked = data[key].unlocked;
          }
        });
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }

  // 保存成就进度到localStorage
  saveProgress() {
    const data = {};
    Object.keys(this.achievements).forEach(key => {
      data[key] = {
        progress: this.achievements[key].progress,
        unlocked: this.achievements[key].unlocked
      };
    });
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }

  // 更新成就进度
  updateProgress(achievementId, value) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    achievement.progress = value;
    
    if (achievement.progress >= achievement.target) {
      this.unlockAchievement(achievementId);
    }
    
    this.saveProgress();
  }

  // 解锁成就
  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.progress = achievement.target;
    this.saveProgress();
    
    // 触发成就弹窗
    this.scene.showAchievementPopup(achievement);
  }

  // 获取所有成就
  getAllAchievements() {
    return Object.values(this.achievements);
  }

  // 重置所有成就（用于测试）
  resetAll() {
    Object.values(this.achievements).forEach(achievement => {
      achievement.progress = 0;
      achievement.unlocked = false;
    });
    this.saveProgress();
  }
}

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.collectCount = 0;
    this.startTime = 0;
    this.collectibles = [];
  }

  preload() {
    // 创建简单的纹理
    this.createTextures();
  }

  create() {
    this.startTime = this.time.now;
    
    // 初始化成就管理器
    this.achievementManager = new AchievementManager(this);

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    this.add.text(400, 30, '成就系统演示', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建说明文本
    this.add.text(400, 80, '点击屏幕、收集物品以解锁成就', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 创建统计面板
    this.createStatsPanel();

    // 创建成就列表面板
    this.createAchievementPanel();

    // 创建可收集物品
    this.createCollectibles();

    // 创建重置按钮
    this.createResetButton();

    // 监听点击事件
    this.input.on('pointerdown', this.onPointerDown, this);

    // 创建弹窗容器（初始隐藏）
    this.popupContainer = null;
  }

  createTextures() {
    // 创建收集物品纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture('collectible', 32, 32);
    graphics.destroy();
  }

  createStatsPanel() {
    const panelX = 50;
    const panelY = 130;

    this.add.text(panelX, panelY, '当前进度:', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 点击计数
    this.clickText = this.add.text(panelX, panelY + 35, '点击次数: 0 / 50', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc'
    });

    // 时间计数
    this.timeText = this.add.text(panelX, panelY + 60, '运行时间: 0s / 30s', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc'
    });

    // 收集计数
    this.collectText = this.add.text(panelX, panelY + 85, '收集物品: 0 / 10', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#cccccc'
    });
  }

  createAchievementPanel() {
    const panelX = 450;
    const panelY = 130;

    this.add.text(panelX, panelY, '成就列表:', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.achievementTexts = [];
    const achievements = this.achievementManager.getAllAchievements();
    
    achievements.forEach((achievement, index) => {
      const y = panelY + 35 + index * 60;
      
      // 成就图标和名称
      const nameText = this.add.text(panelX, y, 
        `${achievement.icon} ${achievement.name}`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: achievement.unlocked ? '#00ff00' : '#888888',
        fontStyle: achievement.unlocked ? 'bold' : 'normal'
      });

      // 成就描述
      const descText = this.add.text(panelX + 20, y + 22, 
        achievement.description, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#aaaaaa'
      });

      this.achievementTexts.push({ nameText, descText, achievement });
    });
  }

  createCollectibles() {
    // 创建10个可收集物品
    for (let i = 0; i < 10; i++) {
      const x = 100 + (i % 5) * 120;
      const y = 350 + Math.floor(i / 5) * 80;
      
      const collectible = this.add.sprite(x, y, 'collectible');
      collectible.setInteractive({ useHandCursor: true });
      collectible.setData('collected', false);
      
      collectible.on('pointerdown', () => {
        if (!collectible.getData('collected')) {
          collectible.setData('collected', true);
          collectible.setAlpha(0.3);
          this.collectCount++;
          this.achievementManager.updateProgress('collector', this.collectCount);
          this.updateStats();
        }
      });

      this.collectibles.push(collectible);
    }
  }

  createResetButton() {
    const buttonX = 400;
    const buttonY = 550;

    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x8b0000, 1);
    buttonBg.fillRoundedRect(buttonX - 80, buttonY - 20, 160, 40, 8);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(buttonX - 80, buttonY - 20, 160, 40),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText = this.add.text(buttonX, buttonY, '重置成就', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    buttonBg.on('pointerdown', () => {
      this.achievementManager.resetAll();
      this.clickCount = 0;
      this.collectCount = 0;
      this.startTime = this.time.now;
      
      // 重置收集物品
      this.collectibles.forEach(c => {
        c.setData('collected', false);
        c.setAlpha(1);
      });
      
      this.updateStats();
      this.updateAchievementDisplay();
    });

    buttonBg.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0xb00000, 1);
      buttonBg.fillRoundedRect(buttonX - 80, buttonY - 20, 160, 40, 8);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x8b0000, 1);
      buttonBg.fillRoundedRect(buttonX - 80, buttonY - 20, 160, 40, 8);
    });
  }

  onPointerDown(pointer) {
    // 忽略UI元素的点击
    if (pointer.y < 120 || pointer.y > 500) return;
    
    this.clickCount++;
    this.achievementManager.updateProgress('clicker', this.clickCount);
    this.updateStats();
  }

  updateStats() {
    this.clickText.setText(`点击次数: ${this.clickCount} / 50`);
    
    const elapsedSeconds = Math.floor((this.time.now - this.startTime) / 1000);
    this.timeText.setText(`运行时间: ${elapsedSeconds}s / 30s`);
    
    this.collectText.setText(`收集物品: ${this.collectCount} / 10`);
  }

  updateAchievementDisplay() {
    this.achievementTexts.forEach(({ nameText, achievement }) => {
      const updated = this.achievementManager.achievements[achievement.id];
      nameText.setColor(updated.unlocked ? '#00ff00' : '#888888');
      nameText.setFontStyle(updated.unlocked ? 'bold' : 'normal');
    });
  }

  showAchievementPopup(achievement) {
    // 如果已有弹窗，先移除
    if (this.popupContainer) {
      this.popupContainer.destroy();
    }

    // 创建弹窗容器
    this.popupContainer = this.add.container(400, -150);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d44, 1);
    bg.lineStyle(3, 0xffd700, 1);
    bg.fillRoundedRect(-150, -60, 300, 120, 12);
    bg.strokeRoundedRect(-150, -60, 300, 120, 12);

    // 成就图标
    const icon = this.add.text(-120, -30, achievement.icon, {
      fontSize: '48px'
    });

    // 成就解锁文本
    const unlockText = this.add.text(0, -35, '成就解锁!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 成就名称
    const nameText = this.add.text(0, -5, achievement.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 成就描述
    const descText = this.add.text(0, 25, achievement.description, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.popupContainer.add([bg, icon, unlockText, nameText, descText]);

    // 动画：滑入
    this.tweens.add({
      targets: this.popupContainer,
      y: 100,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 动画：3秒后滑出并销毁
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: this.popupContainer,
        y: -150,
        duration: 400,
        ease: 'Back.easeIn',
        onComplete: () => {
          if (this.popupContainer) {
            this.popupContainer.destroy();
            this.popupContainer = null;
          }