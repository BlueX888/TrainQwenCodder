// 成就系统游戏
class AchievementSystem {
  constructor() {
    this.achievements = {
      firstClick: { 
        id: 'firstClick', 
        name: '初次尝试', 
        desc: '点击按钮1次', 
        unlocked: false,
        icon: 'click',
        target: 1,
        current: 0
      },
      clickMaster: { 
        id: 'clickMaster', 
        name: '点击大师', 
        desc: '点击按钮50次', 
        unlocked: false,
        icon: 'click',
        target: 50,
        current: 0
      },
      speedClicker: { 
        id: 'speedClicker', 
        name: '手速达人', 
        desc: '5秒内点击10次', 
        unlocked: false,
        icon: 'speed',
        target: 10,
        current: 0
      },
      survivor: { 
        id: 'survivor', 
        name: '生存者', 
        desc: '游戏运行30秒', 
        unlocked: false,
        icon: 'time',
        target: 30000,
        current: 0
      },
      explorer: { 
        id: 'explorer', 
        name: '探险家', 
        desc: '移动总距离超过5000像素', 
        unlocked: false,
        icon: 'move',
        target: 5000,
        current: 0
      },
      collector: { 
        id: 'collector', 
        name: '收藏家', 
        desc: '收集10个物品', 
        unlocked: false,
        icon: 'collect',
        target: 10,
        current: 0
      },
      combo: { 
        id: 'combo', 
        name: '连击高手', 
        desc: '达成5连击', 
        unlocked: false,
        icon: 'combo',
        target: 5,
        current: 0
      },
      perfectionist: { 
        id: 'perfectionist', 
        name: '完美主义', 
        desc: '解锁所有其他成就', 
        unlocked: false,
        icon: 'star',
        target: 7,
        current: 0
      }
    };
    
    this.load();
  }
  
  load() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        if (this.achievements[key]) {
          this.achievements[key].unlocked = data[key].unlocked;
          this.achievements[key].current = data[key].current;
        }
      });
    }
  }
  
  save() {
    const data = {};
    Object.keys(this.achievements).forEach(key => {
      data[key] = {
        unlocked: this.achievements[key].unlocked,
        current: this.achievements[key].current
      };
    });
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }
  
  updateProgress(id, value) {
    const achievement = this.achievements[id];
    if (!achievement || achievement.unlocked) return null;
    
    achievement.current = value;
    
    if (achievement.current >= achievement.target) {
      achievement.unlocked = true;
      this.save();
      
      // 检查完美主义成就
      this.checkPerfectionist();
      
      return achievement;
    }
    
    this.save();
    return null;
  }
  
  checkPerfectionist() {
    let unlockedCount = 0;
    Object.keys(this.achievements).forEach(key => {
      if (key !== 'perfectionist' && this.achievements[key].unlocked) {
        unlockedCount++;
      }
    });
    
    if (unlockedCount >= 7 && !this.achievements.perfectionist.unlocked) {
      this.achievements.perfectionist.unlocked = true;
      this.achievements.perfectionist.current = unlockedCount;
      this.save();
      return this.achievements.perfectionist;
    }
    
    return null;
  }
  
  getAll() {
    return Object.values(this.achievements);
  }
  
  reset() {
    Object.keys(this.achievements).forEach(key => {
      this.achievements[key].unlocked = false;
      this.achievements[key].current = 0;
    });
    this.save();
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.totalDistance = 0;
    this.collectCount = 0;
    this.comboCount = 0;
    this.lastClickTime = 0;
    this.speedClickCount = 0;
    this.speedClickStartTime = 0;
  }
  
  preload() {
    // 创建纹理
    this.createTextures();
  }
  
  createTextures() {
    // 按钮纹理
    const btnGraphics = this.add.graphics();
    btnGraphics.fillStyle(0x4a90e2, 1);
    btnGraphics.fillRoundedRect(0, 0, 120, 50, 10);
    btnGraphics.lineStyle(3, 0xffffff, 1);
    btnGraphics.strokeRoundedRect(0, 0, 120, 50, 10);
    btnGraphics.generateTexture('button', 120, 50);
    btnGraphics.destroy();
    
    // 玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.lineStyle(2, 0xffffff, 1);
    playerGraphics.strokeCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();
    
    // 收集物纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffd700, 1);
    itemGraphics.fillStar(15, 15, 5, 15, 7);
    itemGraphics.generateTexture('item', 30, 30);
    itemGraphics.destroy();
  }
  
  create() {
    this.achievementSystem = new AchievementSystem();
    this.notificationQueue = [];
    this.isShowingNotification = false;
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 标题
    this.add.text(400, 30, '成就系统演示', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 点击按钮
    this.clickButton = this.add.sprite(150, 120, 'button').setInteractive();
    this.add.text(150, 120, '点击我', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.clickButton.on('pointerdown', () => this.handleClick());
    
    // 玩家
    this.player = this.add.sprite(400, 300, 'player');
    this.lastPlayerPos = { x: 400, y: 300 };
    
    // 收集物
    this.items = [];
    this.spawnItems();
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 统计信息
    this.statsText = this.add.text(20, 450, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      lineSpacing: 5
    });
    
    // 成就列表按钮
    const listBtn = this.add.sprite(650, 120, 'button').setInteractive();
    this.add.text(650, 120, '成就列表', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    listBtn.on('pointerdown', () => this.showAchievementList());
    
    // 重置按钮
    const resetBtn = this.add.sprite(650, 190, 'button').setInteractive();
    this.add.text(650, 190, '重置成就', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    resetBtn.on('pointerdown', () => this.resetAchievements());
    
    // 游戏开始时间
    this.startTime = this.time.now;
    
    this.updateStats();
  }
  
  handleClick() {
    this.clickCount++;
    
    // 检查速度点击
    const now = this.time.now;
    if (now - this.speedClickStartTime > 5000) {
      this.speedClickStartTime = now;
      this.speedClickCount = 1;
    } else {
      this.speedClickCount++;
    }
    
    // 检查连击
    if (now - this.lastClickTime < 500) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }
    this.lastClickTime = now;
    
    // 检查成就
    this.checkAchievement('firstClick', this.clickCount);
    this.checkAchievement('clickMaster', this.clickCount);
    this.checkAchievement('speedClicker', this.speedClickCount);
    this.checkAchievement('combo', this.comboCount);
    
    // 按钮动画
    this.tweens.add({
      targets: this.clickButton,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 100,
      yoyo: true
    });
    
    this.updateStats();
  }
  
  spawnItems() {
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(200, 400);
      const item = this.add.sprite(x, y, 'item');
      this.items.push(item);
    }
  }
  
  update(time, delta) {
    // 玩家移动
    const speed = 200;
    let moved = false;
    
    if (this.cursors.left.isDown) {
      this.player.x -= speed * delta / 1000;
      moved = true;
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed * delta / 1000;
      moved = true;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed * delta / 1000;
      moved = true;
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed * delta / 1000;
      moved = true;
    }
    
    // 限制边界
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 80, 420);
    
    // 计算移动距离
    if (moved) {
      const dx = this.player.x - this.lastPlayerPos.x;
      const dy = this.player.y - this.lastPlayerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.totalDistance += distance;
      
      this.lastPlayerPos.x = this.player.x;
      this.lastPlayerPos.y = this.player.y;
      
      this.checkAchievement('explorer', Math.floor(this.totalDistance));
    }
    
    // 检查收集
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        item.x, item.y
      );
      
      if (distance < 40) {
        this.collectCount++;
        item.destroy();
        this.items.splice(i, 1);
        
        this.checkAchievement('collector', this.collectCount);
        
        // 生成新物品
        if (this.collectCount < 10) {
          const x = Phaser.Math.Between(100, 700);
          const y = Phaser.Math.Between(200, 400);
          const newItem = this.add.sprite(x, y, 'item');
          this.items.push(newItem);
        }
      }
    }
    
    // 检查生存时间
    const survivalTime = time - this.startTime;
    this.checkAchievement('survivor', survivalTime);
    
    this.updateStats();
  }
  
  checkAchievement(id, value) {
    const unlocked = this.achievementSystem.updateProgress(id, value);
    if (unlocked) {
      this.queueNotification(unlocked);
      
      // 检查完美主义
      const perfect = this.achievementSystem.checkPerfectionist();
      if (perfect) {
        this.queueNotification(perfect);
      }
    }
  }
  
  queueNotification(achievement) {
    this.notificationQueue.push(achievement);
    if (!this.isShowingNotification) {
      this.showNextNotification();
    }
  }
  
  showNextNotification() {