// 成就管理器类
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = {
      clicker: {
        id: 'clicker',
        name: '点击大师',
        description: '累计点击目标10次',
        target: 10,
        progress: 0,
        unlocked: false
      },
      survivor: {
        id: 'survivor',
        name: '时间旅者',
        description: '存活30秒',
        target: 30,
        progress: 0,
        unlocked: false
      },
      combo: {
        id: 'combo',
        name: '连击高手',
        description: '达成5连击',
        target: 5,
        progress: 0,
        unlocked: false
      }
    };
    
    this.loadFromStorage();
  }
  
  // 从localStorage加载成就数据
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('phaser_achievements');
      if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          if (this.achievements[key]) {
            this.achievements[key].progress = data[key].progress || 0;
            this.achievements[key].unlocked = data[key].unlocked || false;
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load achievements:', e);
    }
  }
  
  // 保存到localStorage
  saveToStorage() {
    try {
      const data = {};
      Object.keys(this.achievements).forEach(key => {
        data[key] = {
          progress: this.achievements[key].progress,
          unlocked: this.achievements[key].unlocked
        };
      });
      localStorage.setItem('phaser_achievements', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save achievements:', e);
    }
  }
  
  // 更新成就进度
  updateProgress(achievementId, value) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return false;
    
    achievement.progress = value;
    
    if (achievement.progress >= achievement.target) {
      achievement.unlocked = true;
      this.saveToStorage();
      return true; // 返回true表示成就解锁
    }
    
    this.saveToStorage();
    return false;
  }
  
  // 获取成就信息
  getAchievement(achievementId) {
    return this.achievements[achievementId];
  }
  
  // 重置所有成就（用于测试）
  reset() {
    Object.keys(this.achievements).forEach(key => {
      this.achievements[key].progress = 0;
      this.achievements[key].unlocked = false;
    });
    this.saveToStorage();
  }
}

// 成就弹窗类
class AchievementPopup {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.isShowing = false;
  }
  
  show(achievement) {
    if (this.isShowing) return;
    this.isShowing = true;
    
    // 创建容器
    this.container = this.scene.add.container(400, -150);
    
    // 背景
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-180, -60, 360, 120, 10);
    bg.lineStyle(3, 0xf39c12, 1);
    bg.strokeRoundedRect(-180, -60, 360, 120, 10);
    this.container.add(bg);
    
    // 成就图标（使用Graphics绘制奖杯）
    const icon = this.scene.add.graphics();
    icon.fillStyle(0xf39c12, 1);
    // 奖杯杯身
    icon.fillRect(-140, -20, 30, 30);
    // 奖杯底座
    icon.fillRect(-145, 10, 40, 8);
    // 奖杯把手
    icon.lineStyle(4, 0xf39c12, 1);
    icon.strokeCircle(-155, -5, 10);
    icon.strokeCircle(-105, -5, 10);
    this.container.add(icon);
    
    // 标题文字
    const title = this.scene.add.text(-90, -35, '🏆 成就解锁！', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    this.container.add(title);
    
    // 成就名称
    const name = this.scene.add.text(-90, -5, achievement.name, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    this.container.add(name);
    
    // 成就描述
    const desc = this.scene.add.text(-90, 20, achievement.description, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#bdc3c7'
    });
    this.container.add(desc);
    
    // 下滑动画
    this.scene.tweens.add({
      targets: this.container,
      y: 80,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 停留2秒后上滑消失
        this.scene.time.delayedCall(2000, () => {
          this.scene.tweens.add({
            targets: this.container,
            y: -150,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
              this.container.destroy();
              this.isShowing = false;
            }
          });
        });
      }
    });
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.survivalTime = 0;
    this.comboCount = 0;
    this.lastClickTime = 0;
    this.comboWindow = 1000; // 1秒内点击算连击
  }
  
  preload() {
    // 不需要加载外部资源
  }
  
  create() {
    // 初始化成就系统
    this.achievementManager = new AchievementManager(this);
    this.achievementPopup = new AchievementPopup(this);
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x34495e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 标题
    this.add.text(400, 40, '成就系统演示', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 创建可点击的目标
    this.createClickTarget();
    
    // 创建UI显示
    this.createUI();
    
    // 启动存活时间计时器
    this.time.addEvent({
      delay: 1000,
      callback: this.updateSurvivalTime,
      callbackScope: this,
      loop: true
    });
    
    // 重置按钮
    this.createResetButton();
    
    // 显示当前成就状态
    this.updateAchievementDisplay();
  }
  
  createClickTarget() {
    // 创建一个可点击的圆形目标
    const target = this.add.graphics();
    target.fillStyle(0xe74c3c, 1);
    target.fillCircle(0, 0, 40);
    target.lineStyle(4, 0xc0392b, 1);
    target.strokeCircle(0, 0, 40);
    
    const targetContainer = this.add.container(400, 300);
    targetContainer.add(target);
    
    const targetText = this.add.text(0, 0, '点我', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    targetContainer.add(targetText);
    
    // 设置交互
    targetContainer.setSize(80, 80);
    targetContainer.setInteractive(
      new Phaser.Geom.Circle(0, 0, 40),
      Phaser.Geom.Circle.Contains
    );
    
    targetContainer.on('pointerdown', () => {
      this.onTargetClick();
      
      // 点击动画
      this.tweens.add({
        targets: targetContainer,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true
      });
    });
    
    targetContainer.on('pointerover', () => {
      target.clear();
      target.fillStyle(0xff6b6b, 1);
      target.fillCircle(0, 0, 40);
      target.lineStyle(4, 0xc0392b, 1);
      target.strokeCircle(0, 0, 40);
    });
    
    targetContainer.on('pointerout', () => {
      target.clear();
      target.fillStyle(0xe74c3c, 1);
      target.fillCircle(0, 0, 40);
      target.lineStyle(4, 0xc0392b, 1);
      target.strokeCircle(0, 0, 40);
    });
  }
  
  createUI() {
    // 创建信息面板
    const panel = this.add.graphics();
    panel.fillStyle(0x2c3e50, 0.8);
    panel.fillRoundedRect(20, 100, 250, 200, 10);
    panel.lineStyle(2, 0x3498db, 1);
    panel.strokeRoundedRect(20, 100, 250, 200, 10);
    
    // 统计信息
    this.clickText = this.add.text(40, 120, '点击次数: 0/10', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ecf0f1'
    });
    
    this.survivalText = this.add.text(40, 160, '存活时间: 0/30秒', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ecf0f1'
    });
    
    this.comboText = this.add.text(40, 200, '当前连击: 0', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ecf0f1'
    });
    
    this.maxComboText = this.add.text(40, 240, '最高连击: 0/5', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ecf0f1'
    });
    
    // 成就列表面板
    const achievementPanel = this.add.graphics();
    achievementPanel.fillStyle(0x2c3e50, 0.8);
    achievementPanel.fillRoundedRect(530, 100, 250, 280, 10);
    achievementPanel.lineStyle(2, 0x3498db, 1);
    achievementPanel.strokeRoundedRect(530, 100, 250, 280, 10);
    
    this.add.text(655, 115, '成就列表', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.achievementTexts = {};
    let yPos = 160;
    Object.keys(this.achievementManager.achievements).forEach(key => {
      const achievement = this.achievementManager.achievements[key];
      const text = this.add.text(550, yPos, '', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#bdc3c7',
        wordWrap: { width: 220 }
      });
      this.achievementTexts[key] = text;
      yPos += 80;
    });
  }
  
  createResetButton() {
    const button = this.add.graphics();
    button.fillStyle(0xe74c3c, 1);
    button.fillRoundedRect(0, 0, 150, 40, 8);
    
    const buttonContainer = this.add.container(325, 520);
    buttonContainer.add(button);
    
    const buttonText = this.add.text(75, 20, '重置成就', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    buttonContainer.add(buttonText);
    
    buttonContainer.setSize(150, 40);
    buttonContainer.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 150, 40),
      Phaser.Geom.Rectangle.Contains
    );
    
    buttonContainer.on('pointerdown', () => {
      this.resetGame();
    });
    
    buttonContainer.on('pointerover', () => {
      button.clear();
      button.fillStyle(0xff6b6b, 1);
      button.fillRoundedRect(0, 0, 150, 40, 8);
    });
    
    buttonContainer.on('pointerout', () => {
      button.clear();
      button.fillStyle(0xe74c3c, 1);
      button.fillRoundedRect(0, 0, 150, 40, 8);
    });
  }
  
  onTargetClick() {