// 成就管理器类
class AchievementManager {
  constructor() {
    this.achievements = {
      firstClick: { id: 'firstClick', name: '初次尝试', desc: '点击第一次', unlocked: false, progress: 0, target: 1 },
      click100: { id: 'click100', name: '点击狂魔', desc: '累计点击100次', unlocked: false, progress: 0, target: 100 },
      survive60: { id: 'survive60', name: '坚持不懈', desc: '存活60秒', unlocked: false, progress: 0, target: 60 },
      collect10: { id: 'collect10', name: '收藏家', desc: '收集10个物品', unlocked: false, progress: 0, target: 10 },
      combo5: { id: 'combo5', name: '连击大师', desc: '达成5连击', unlocked: false, progress: 0, target: 5 },
      perfect10: { id: 'perfect10', name: '完美主义', desc: '连续10次完美点击', unlocked: false, progress: 0, target: 10 },
      speedster: { id: 'speedster', name: '速度之王', desc: '3秒内点击20次', unlocked: false, progress: 0, target: 20 },
      explorer: { id: 'explorer', name: '探索者', desc: '访问所有4个区域', unlocked: false, progress: 0, target: 4 }
    };
    
    this.load();
  }
  
  // 从localStorage加载成就数据
  load() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          if (this.achievements[key]) {
            this.achievements[key] = { ...this.achievements[key], ...data[key] };
          }
        });
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }
  
  // 保存成就数据到localStorage
  save() {
    try {
      localStorage.setItem('phaser_achievements', JSON.stringify(this.achievements));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }
  
  // 更新成就进度
  updateProgress(achievementId, progress) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return null;
    
    achievement.progress = progress;
    
    if (achievement.progress >= achievement.target) {
      achievement.unlocked = true;
      this.save();
      return achievement;
    }
    
    this.save();
    return null;
  }
  
  // 增加成就进度
  incrementProgress(achievementId, amount = 1) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return null;
    
    achievement.progress += amount;
    
    if (achievement.progress >= achievement.target) {
      achievement.unlocked = true;
      this.save();
      return achievement;
    }
    
    this.save();
    return null;
  }
  
  // 获取所有成就
  getAllAchievements() {
    return Object.values(this.achievements);
  }
  
  // 重置所有成就（用于测试）
  reset() {
    Object.values(this.achievements).forEach(ach => {
      ach.unlocked = false;
      ach.progress = 0;
    });
    this.save();
  }
}

// 成就弹窗类
class AchievementPopup extends Phaser.GameObjects.Container {
  constructor(scene, achievement) {
    super(scene, 900, 100);
    
    // 背景
    const bg = scene.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(0, 0, 350, 100, 10);
    bg.lineStyle(3, 0xf39c12, 1);
    bg.strokeRoundedRect(0, 0, 350, 100, 10);
    this.add(bg);
    
    // 成就图标
    const icon = scene.add.graphics();
    icon.fillStyle(0xf39c12, 1);
    icon.fillStar(50, 50, 5, 30, 15);
    icon.lineStyle(2, 0xffffff, 1);
    icon.strokeStar(50, 50, 5, 30, 15);
    this.add(icon);
    
    // 成就解锁文字
    const unlockText = scene.add.text(110, 20, '成就解锁!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    this.add(unlockText);
    
    // 成就名称
    const nameText = scene.add.text(110, 45, achievement.name, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.add(nameText);
    
    // 成就描述
    const descText = scene.add.text(110, 68, achievement.desc, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#bdc3c7'
    });
    this.add(descText);
    
    scene.add.existing(this);
    
    // 动画效果
    this.showAnimation();
  }
  
  showAnimation() {
    // 滑入动画
    this.scene.tweens.add({
      targets: this,
      x: 450,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // 停留3秒后滑出
        this.scene.time.delayedCall(3000, () => {
          this.hideAnimation();
        });
      }
    });
  }
  
  hideAnimation() {
    this.scene.tweens.add({
      targets: this,
      x: 900,
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
    super(scene, 400, 300);
    
    this.achievementManager = achievementManager;
    this.visible = false;
    
    // 半透明背景遮罩
    const overlay = scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(-400, -300, 800, 600);
    this.add(overlay);
    
    // 面板背景
    const panelBg = scene.add.graphics();
    panelBg.fillStyle(0x34495e, 0.95);
    panelBg.fillRoundedRect(-350, -250, 700, 500, 15);
    panelBg.lineStyle(4, 0xf39c12, 1);
    panelBg.strokeRoundedRect(-350, -250, 700, 500, 15);
    this.add(panelBg);
    
    // 标题
    const title = scene.add.text(0, -220, '成就列表', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.add(title);
    
    // 关闭按钮
    const closeBtn = scene.add.text(310, -240, 'X', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#e74c3c',
      fontStyle: 'bold'
    });
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.add(closeBtn);
    
    // 成就列表
    this.achievementList = scene.add.container(0, -150);
    this.add(this.achievementList);
    
    scene.add.existing(this);
    this.setDepth(1000);
  }
  
  show() {
    this.visible = true;
    this.updateList();
  }
  
  hide() {
    this.visible = false;
  }
  
  updateList() {
    this.achievementList.removeAll(true);
    
    const achievements = this.achievementManager.getAllAchievements();
    let yOffset = 0;
    
    achievements.forEach((ach, index) => {
      const itemBg = this.scene.add.graphics();
      const bgColor = ach.unlocked ? 0x27ae60 : 0x7f8c8d;
      itemBg.fillStyle(bgColor, 0.3);
      itemBg.fillRoundedRect(-320, yOffset, 640, 50, 8);
      itemBg.lineStyle(2, bgColor, 1);
      itemBg.strokeRoundedRect(-320, yOffset, 640, 50, 8);
      this.achievementList.add(itemBg);
      
      // 图标
      const icon = this.scene.add.graphics();
      if (ach.unlocked) {
        icon.fillStyle(0xf39c12, 1);
        icon.fillStar(-290, yOffset + 25, 5, 15, 8);
      } else {
        icon.fillStyle(0x95a5a6, 1);
        icon.fillCircle(-290, yOffset + 25, 12);
      }
      this.achievementList.add(icon);
      
      // 名称
      const name = this.scene.add.text(-260, yOffset + 10, ach.name, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: ach.unlocked ? '#ffffff' : '#95a5a6',
        fontStyle: 'bold'
      });
      this.achievementList.add(name);
      
      // 描述
      const desc = this.scene.add.text(-260, yOffset + 30, ach.desc, {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: ach.unlocked ? '#ecf0f1' : '#7f8c8d'
      });
      this.achievementList.add(desc);
      
      // 进度
      const progress = this.scene.add.text(280, yOffset + 20, 
        `${Math.min(ach.progress, ach.target)}/${ach.target}`, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: ach.unlocked ? '#f39c12' : '#95a5a6'
      });
      progress.setOrigin(1, 0.5);
      this.achievementList.add(progress);
      
      yOffset += 60;
    });
  }
}

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  
  preload() {
    // 无需加载外部资源
  }
  
  create() {
    // 初始化成就管理器
    this.achievementManager = new AchievementManager();
    
    // 游戏状态
    this.gameState = {
      clickCount: 0,
      collectCount: 0,
      comboCount: 0,
      perfectCount: 0,
      speedClicks: 0,
      speedStartTime: 0,
      visitedZones: new Set(),
      startTime: this.time.now
    };
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 创建4个区域用于探索成就
    this.createZones();
    
    // 创建可收集物品
    this.createCollectibles();
    
    // 创建点击区域
    this.createClickArea();
    
    // 创建UI
    this.createUI();
    
    // 创建成就面板
    this.achievementPanel = new AchievementPanel(this, this.achievementManager);
    
    // 添加键盘控制
    this.input.keyboard.on('keydown-A', () => {
      this.achievementPanel.show();
    });
    
    // 更新存活时间
    this.time.addEvent({
      delay: 1000,
      callback: this.updateSurviveTime,
      callbackScope: this,
      loop: true
    });
    
    // 重置速度点击计数器
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        this.gameState.speedClicks = 0;
        this.gameState.speedStartTime = this.time.now;
      },
      callbackScope: this,
      loop: true
    });
  }
  
  createZones() {
    const zones = [
      { x: 100, y: 100, color: 0xe74c3c, name: '红色区域' },
      { x: 700, y: 100, color: 0x3498db, name: '蓝色区域' },
      { x: 100, y: 500, color: 0x2ecc71, name: '绿色区域' },
      { x: 700, y: 500, color: 0xf39c12, name: '黄色区域