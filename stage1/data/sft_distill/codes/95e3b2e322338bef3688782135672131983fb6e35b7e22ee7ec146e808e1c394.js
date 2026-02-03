// 成就系统游戏
class AchievementSystem {
  constructor() {
    this.achievements = [
      { id: 'first_click', name: '初次点击', desc: '点击任意位置', unlocked: false, icon: '👆' },
      { id: 'click_master', name: '点击大师', desc: '累计点击100次', unlocked: false, icon: '🖱️', progress: 0, target: 100 },
      { id: 'speed_clicker', name: '快速点击', desc: '1秒内点击10次', unlocked: false, icon: '⚡', progress: 0, target: 10 },
      { id: 'survivor', name: '生存者', desc: '存活30秒', unlocked: false, icon: '⏰', progress: 0, target: 30 },
      { id: 'collector', name: '收藏家', desc: '收集10个星星', unlocked: false, icon: '⭐', progress: 0, target: 10 },
      { id: 'combo_king', name: '连击之王', desc: '达成5连击', unlocked: false, icon: '🔥', progress: 0, target: 5 },
      { id: 'explorer', name: '探索者', desc: '访问所有4个角落', unlocked: false, icon: '🧭', corners: [] },
      { id: 'rainbow', name: '彩虹猎人', desc: '收集3种颜色的宝石', unlocked: false, icon: '🌈', colors: new Set() },
      { id: 'precise', name: '精准射手', desc: '连续5次点击目标', unlocked: false, icon: '🎯', progress: 0, target: 5 },
      { id: 'patient', name: '耐心玩家', desc: '60秒不点击', unlocked: false, icon: '🧘', progress: 0, target: 60 },
      { id: 'speedrun', name: '速通者', desc: '10秒内收集5个星星', unlocked: false, icon: '🏃', progress: 0, target: 5 },
      { id: 'completionist', name: '完美主义者', desc: '解锁所有其他成就', unlocked: false, icon: '👑' }
    ];
    
    this.load();
  }
  
  save() {
    localStorage.setItem('phaser_achievements', JSON.stringify(this.achievements));
  }
  
  load() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      data.forEach((saved, i) => {
        this.achievements[i].unlocked = saved.unlocked;
        if (saved.progress !== undefined) this.achievements[i].progress = saved.progress;
        if (saved.corners) this.achievements[i].corners = saved.corners;
        if (saved.colors) this.achievements[i].colors = new Set(saved.colors);
      });
    }
  }
  
  unlock(id) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      this.save();
      return achievement;
    }
    return null;
  }
  
  updateProgress(id, value) {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.progress = value;
      if (achievement.progress >= achievement.target) {
        return this.unlock(id);
      }
      this.save();
    }
    return null;
  }
  
  getUnlockedCount() {
    return this.achievements.filter(a => a.unlocked && a.id !== 'completionist').length;
  }
  
  reset() {
    this.achievements.forEach(a => {
      a.unlocked = false;
      if (a.progress !== undefined) a.progress = 0;
      if (a.corners) a.corners = [];
      if (a.colors) a.colors = new Set();
    });
    this.save();
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.recentClicks = [];
    this.survivalTime = 0;
    this.starCount = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.lastClickTime = 0;
    this.noClickTime = 0;
    this.speedrunStartTime = null;
    this.speedrunStars = 0;
    this.consecutiveHits = 0;
  }
  
  preload() {
    // 不需要加载外部资源
  }
  
  create() {
    this.achievementSystem = new AchievementSystem();
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 标题
    this.add.text(400, 30, '成就系统演示', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 说明文字
    this.add.text(400, 70, '点击屏幕、收集星星、访问角落来解锁成就！', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // 统计信息
    this.statsText = this.add.text(20, 100, '', {
      fontSize: '14px',
      color: '#ffffff',
      lineSpacing: 5
    });
    
    // 创建游戏元素
    this.stars = [];
    this.gems = [];
    this.targets = [];
    
    // 生成星星
    for (let i = 0; i < 3; i++) {
      this.spawnStar();
    }
    
    // 生成彩色宝石
    const gemColors = [0xff0000, 0x00ff00, 0x0000ff];
    gemColors.forEach((color, i) => {
      const gem = this.add.graphics();
      gem.fillStyle(color, 1);
      gem.fillCircle(0, 0, 15);
      gem.x = 150 + i * 100;
      gem.y = 500;
      gem.setInteractive(new Phaser.Geom.Circle(0, 0, 15), Phaser.Geom.Circle.Contains);
      gem.colorType = i;
      this.gems.push(gem);
    });
    
    // 生成目标
    for (let i = 0; i < 2; i++) {
      const target = this.add.graphics();
      target.lineStyle(3, 0xff0000, 1);
      target.strokeCircle(0, 0, 20);
      target.lineStyle(2, 0xff0000, 1);
      target.beginPath();
      target.moveTo(-15, 0);
      target.lineTo(15, 0);
      target.moveTo(0, -15);
      target.lineTo(0, 15);
      target.strokePath();
      target.x = 200 + i * 300;
      target.y = 300;
      target.setInteractive(new Phaser.Geom.Circle(0, 0, 20), Phaser.Geom.Circle.Contains);
      this.targets.push(target);
    }
    
    // 角落标记
    const corners = [
      { x: 50, y: 150, name: '左上' },
      { x: 750, y: 150, name: '右上' },
      { x: 50, y: 550, name: '左下' },
      { x: 750, y: 550, name: '右下' }
    ];
    
    corners.forEach((corner, i) => {
      const marker = this.add.graphics();
      marker.fillStyle(0x444444, 0.5);
      marker.fillCircle(0, 0, 25);
      marker.x = corner.x;
      marker.y = corner.y;
      marker.setInteractive(new Phaser.Geom.Circle(0, 0, 25), Phaser.Geom.Circle.Contains);
      marker.cornerId = i;
      
      this.add.text(corner.x, corner.y, corner.name, {
        fontSize: '12px',
        color: '#888888'
      }).setOrigin(0.5);
    });
    
    // 成就按钮
    const achievementBtn = this.add.graphics();
    achievementBtn.fillStyle(0x4a4a4a, 1);
    achievementBtn.fillRoundedRect(650, 20, 130, 40, 10);
    achievementBtn.setInteractive(new Phaser.Geom.Rectangle(650, 20, 130, 40), Phaser.Geom.Rectangle.Contains);
    
    this.add.text(715, 40, '查看成就', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 重置按钮
    const resetBtn = this.add.graphics();
    resetBtn.fillStyle(0x8b0000, 1);
    resetBtn.fillRoundedRect(650, 70, 130, 30, 8);
    resetBtn.setInteractive(new Phaser.Geom.Rectangle(650, 70, 130, 30), Phaser.Geom.Rectangle.Contains);
    
    this.add.text(715, 85, '重置成就', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 输入事件
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      this.handleClick(pointer, gameObject);
    });
    
    this.input.on('pointerdown', (pointer) => {
      if (!pointer.downElement) {
        this.handleClick(pointer, null);
      }
    });
    
    achievementBtn.on('pointerdown', () => {
      this.showAchievementList();
    });
    
    resetBtn.on('pointerdown', () => {
      this.achievementSystem.reset();
      this.scene.restart();
    });
    
    // 成就弹窗容器
    this.achievementPopups = [];
  }
  
  spawnStar() {
    const star = this.add.graphics();
    star.fillStyle(0xffff00, 1);
    
    // 绘制星星
    const points = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
      const radius = i % 2 === 0 ? 15 : 7;
      points.push(Math.cos(angle) * radius);
      points.push(Math.sin(angle) * radius);
    }
    star.fillPoints(points, true);
    
    star.x = Phaser.Math.Between(100, 700);
    star.y = Phaser.Math.Between(200, 450);
    star.setInteractive(new Phaser.Geom.Circle(0, 0, 15), Phaser.Geom.Circle.Contains);
    star.isStar = true;
    
    this.stars.push(star);
  }
  
  handleClick(pointer, gameObject) {
    const currentTime = this.time.now;
    this.clickCount++;
    this.lastClickTime = currentTime;
    this.noClickTime = 0;
    
    // 记录最近点击用于检测快速点击
    this.recentClicks.push(currentTime);
    this.recentClicks = this.recentClicks.filter(t => currentTime - t < 1000);
    
    // 检查首次点击
    this.checkAchievement('first_click');
    
    // 检查点击大师
    this.checkAchievement('click_master', this.clickCount);
    
    // 检查快速点击
    if (this.recentClicks.length >= 10) {
      this.checkAchievement('speed_clicker', 10);
    }
    
    // 处理游戏对象点击
    if (gameObject) {
      // 星星收集
      if (gameObject.isStar) {
        this.starCount++;
        this.combo++;
        this.comboTimer = 2000;
        
        // 速通计时
        if (this.speedrunStartTime === null) {
          this.speedrunStartTime = currentTime;
          this.speedrunStars = 0;
        }
        
        if (currentTime - this.speedrunStartTime < 10000) {
          this.speedrunStars++;
          if (this.speedrunStars >= 5) {
            this.checkAchievement('speedrun', 5);
          }
        } else {
          this.speedrunStartTime = currentTime;
          this.speedrunStars = 1;
        }
        
        gameObject.destroy();
        this.stars = this.stars.filter(s => s !== gameObject);
        
        this.time.delayedCall(1000, () => this.spawnStar());
        
        this.checkAchievement('collector', this.starCount);
        this.checkAchievement('combo_king', this.combo);
      }
      
      // 宝石收集
      if (gameObject.colorType !== undefined) {
        const achievement = this.achievementSystem.achievements.find(a => a.id === 'rainbow');
        if (!achievement.unlocked) {
          achievement.colors.add(gameObject.colorType);
          if (achievement.colors.size >= 3) {
            this.unlockAchievement('rainbow');
          }
          this.achievementSystem.save();
        }
      }
      
      // 目标点击
      if (this.targets.includes(gameObject)) {
        this.consecutiveHits++;
        this.checkAchievement('precise', this