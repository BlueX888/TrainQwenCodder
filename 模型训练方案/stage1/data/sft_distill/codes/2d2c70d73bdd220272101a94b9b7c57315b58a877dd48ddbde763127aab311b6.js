// 成就管理器类
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = {
      firstClick: { id: 'firstClick', name: '初次尝试', desc: '点击按钮1次', target: 1, current: 0, unlocked: false },
      clickMaster: { id: 'clickMaster', name: '点击大师', desc: '累计点击50次', target: 50, current: 0, unlocked: false },
      speedClicker: { id: 'speedClicker', name: '快速点击', desc: '1秒内点击10次', target: 10, current: 0, unlocked: false },
      survivor: { id: 'survivor', name: '生存者', desc: '存活30秒', target: 30000, current: 0, unlocked: false },
      explorer: { id: 'explorer', name: '探索者', desc: '点击5个不同区域', target: 5, current: 0, unlocked: false },
      combo: { id: 'combo', name: '连击高手', desc: '达成20连击', target: 20, current: 0, unlocked: false },
      patient: { id: 'patient', name: '耐心玩家', desc: '等待10秒不点击', target: 10000, current: 0, unlocked: false },
      colorCollector: { id: 'colorCollector', name: '颜色收集者', desc: '点击3种颜色按钮', target: 3, current: 0, unlocked: false },
      scoreHunter: { id: 'scoreHunter', name: '分数猎人', desc: '获得100分', target: 100, current: 0, unlocked: false },
      perfectionist: { id: 'perfectionist', name: '完美主义', desc: '解锁所有成就', target: 9, current: 0, unlocked: false }
    };
    
    this.loadProgress();
  }
  
  // 保存进度到localStorage
  saveProgress() {
    const data = {};
    for (let key in this.achievements) {
      const ach = this.achievements[key];
      data[key] = { current: ach.current, unlocked: ach.unlocked };
    }
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }
  
  // 从localStorage加载进度
  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        for (let key in data) {
          if (this.achievements[key]) {
            this.achievements[key].current = data[key].current;
            this.achievements[key].unlocked = data[key].unlocked;
          }
        }
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }
  
  // 更新成就进度
  updateProgress(achievementId, value) {
    const ach = this.achievements[achievementId];
    if (!ach || ach.unlocked) return;
    
    ach.current = value;
    if (ach.current >= ach.target) {
      this.unlockAchievement(achievementId);
    }
    this.saveProgress();
  }
  
  // 增加成就进度
  incrementProgress(achievementId, amount = 1) {
    const ach = this.achievements[achievementId];
    if (!ach || ach.unlocked) return;
    
    ach.current += amount;
    if (ach.current >= ach.target) {
      this.unlockAchievement(achievementId);
    }
    this.saveProgress();
  }
  
  // 解锁成就
  unlockAchievement(achievementId) {
    const ach = this.achievements[achievementId];
    if (!ach || ach.unlocked) return;
    
    ach.unlocked = true;
    this.scene.showAchievementPopup(ach);
    
    // 检查完美主义成就
    if (achievementId !== 'perfectionist') {
      const unlockedCount = Object.values(this.achievements)
        .filter(a => a.unlocked && a.id !== 'perfectionist').length;
      this.updateProgress('perfectionist', unlockedCount);
    }
    
    this.saveProgress();
  }
  
  // 重置所有成就（用于测试）
  resetAll() {
    for (let key in this.achievements) {
      this.achievements[key].current = 0;
      this.achievements[key].unlocked = false;
    }
    this.saveProgress();
  }
  
  // 获取成就列表
  getAchievementsList() {
    return Object.values(this.achievements);
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  
  preload() {
    // 无需预加载资源
  }
  
  create() {
    // 初始化变量
    this.clickCount = 0;
    this.score = 0;
    this.comboCount = 0;
    this.comboTimer = null;
    this.lastClickTime = 0;
    this.recentClicks = [];
    this.exploredAreas = new Set();
    this.clickedColors = new Set();
    this.idleTime = 0;
    this.startTime = this.time.now;
    
    // 创建成就管理器
    this.achievementManager = new AchievementManager(this);
    
    // 创建UI
    this.createUI();
    
    // 创建交互按钮
    this.createButtons();
    
    // 设置定时器
    this.time.addEvent({
      delay: 1000,
      callback: this.checkTimeBasedAchievements,
      callbackScope: this,
      loop: true
    });
  }
  
  createUI() {
    // 标题
    this.add.text(400, 30, '成就系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 统计信息
    this.statsText = this.add.text(20, 80, '', {
      fontSize: '16px',
      color: '#ffffff'
    });
    
    // 重置按钮
    const resetBtn = this.createButton(650, 80, 140, 40, '重置成就', 0xff4444);
    resetBtn.on('pointerdown', () => {
      this.achievementManager.resetAll();
      this.clickCount = 0;
      this.score = 0;
      this.comboCount = 0;
      this.exploredAreas.clear();
      this.clickedColors.clear();
      this.add.text(400, 300, '成就已重置！', {
        fontSize: '24px',
        color: '#ff4444'
      }).setOrigin(0.5);
      this.time.delayedCall(1000, () => {
        this.scene.restart();
      });
    });
    
    // 成就列表按钮
    const listBtn = this.createButton(650, 130, 140, 40, '查看成就', 0x4444ff);
    listBtn.on('pointerdown', () => {
      this.showAchievementsList();
    });
  }
  
  createButtons() {
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
    const positions = [
      { x: 150, y: 200, area: 'top-left' },
      { x: 350, y: 200, area: 'top-center' },
      { x: 550, y: 200, area: 'top-right' },
      { x: 250, y: 350, area: 'mid-left' },
      { x: 450, y: 350, area: 'mid-right' },
      { x: 150, y: 500, area: 'bottom-left' },
      { x: 350, y: 500, area: 'bottom-center' },
      { x: 550, y: 500, area: 'bottom-right' }
    ];
    
    positions.forEach((pos, index) => {
      const color = colors[index % colors.length];
      const btn = this.createButton(pos.x, pos.y, 120, 80, `+${index + 1}`, color);
      btn.on('pointerdown', () => {
        this.handleButtonClick(pos.area, color, index + 1);
      });
    });
  }
  
  createButton(x, y, width, height, text, color) {
    const container = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    
    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    container.add([bg, label]);
    container.setSize(width, height);
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    
    // 悬停效果
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 0.8);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.lineStyle(3, 0xffff00, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    });
    
    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
      bg.lineStyle(3, 0xffffff, 1);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    });
    
    return container;
  }
  
  handleButtonClick(area, color, points) {
    const now = this.time.now;
    
    // 重置空闲时间
    this.idleTime = 0;
    
    // 更新点击计数
    this.clickCount++;
    this.achievementManager.updateProgress('firstClick', this.clickCount);
    this.achievementManager.updateProgress('clickMaster', this.clickCount);
    
    // 更新分数
    this.score += points;
    this.achievementManager.updateProgress('scoreHunter', this.score);
    
    // 检测快速点击
    this.recentClicks.push(now);
    this.recentClicks = this.recentClicks.filter(time => now - time < 1000);
    if (this.recentClicks.length >= 10) {
      this.achievementManager.updateProgress('speedClicker', this.recentClicks.length);
    }
    
    // 连击系统
    if (now - this.lastClickTime < 1000) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastClickTime = now;
    this.achievementManager.updateProgress('combo', this.comboCount);
    
    // 探索区域
    this.exploredAreas.add(area);
    this.achievementManager.updateProgress('explorer', this.exploredAreas.size);
    
    // 颜色收集
    this.clickedColors.add(color);
    this.achievementManager.updateProgress('colorCollector', this.clickedColors.size);
  }
  
  checkTimeBasedAchievements() {
    const elapsed = this.time.now - this.startTime;
    
    // 生存时间
    this.achievementManager.updateProgress('survivor', elapsed);
    
    // 空闲时间
    this.idleTime += 1000;
    if (this.idleTime >= 10000) {
      this.achievementManager.updateProgress('patient', this.idleTime);
    }
  }
  
  showAchievementPopup(achievement) {
    const popup = this.add.container(400, -150);
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-180, -60, 360, 120, 15);
    bg.lineStyle(4, 0xf39c12, 1);
    bg.strokeRoundedRect(-180, -60, 360, 120, 15);
    
    // 图标
    const icon = this.add.graphics();
    icon.fillStyle(0xf39c12, 1);
    icon.fillStar(-130, 0, 5, 25, 15);
    
    // 文字
    const title = this.add.text(-90, -25, '🏆 成就解锁！', {
      fontSize: '18px',
      color: '#f39c12',
      fontStyle: 'bold'
    });
    
    const name = this.add.text(-90, 0, achievement.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    
    const desc = this.add.text(-90, 25, achievement.desc, {
      fontSize: '14px',
      color: '#bdc3c7'
    });
    
    popup.add([bg, icon, title, name, desc]);
    
    // 动画
    this.tweens.add({