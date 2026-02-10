// 成就管理器类
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = {
      clicker: {
        id: 'clicker',
        name: '点击大师',
        description: '点击屏幕50次',
        target: 50,
        current: 0,
        unlocked: false
      },
      survivor: {
        id: 'survivor',
        name: '生存专家',
        description: '存活30秒',
        target: 30000,
        current: 0,
        unlocked: false
      },
      collector: {
        id: 'collector',
        name: '收藏家',
        description: '收集10个物品',
        target: 10,
        current: 0,
        unlocked: false
      }
    };
    
    this.loadProgress();
  }
  
  // 从localStorage加载进度
  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
          if (this.achievements[key]) {
            this.achievements[key].current = data[key].current;
            this.achievements[key].unlocked = data[key].unlocked;
          }
        });
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }
  
  // 保存进度到localStorage
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
  
  // 更新成就进度
  updateProgress(achievementId, value) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;
    
    achievement.current = value;
    
    // 检查是否达成
    if (achievement.current >= achievement.target) {
      this.unlockAchievement(achievementId);
    }
    
    this.saveProgress();
  }
  
  // 解锁成就
  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;
    
    achievement.unlocked = true;
    achievement.current = achievement.target;
    this.saveProgress();
    
    // 显示成就弹窗
    this.scene.showAchievementPopup(achievement);
  }
  
  // 获取所有成就
  getAllAchievements() {
    return Object.values(this.achievements);
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.itemsCollected = 0;
    this.startTime = 0;
    this.items = [];
    this.player = null;
  }
  
  preload() {
    // 创建纹理
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
    
    // 创建玩家
    this.player = this.add.rectangle(400, 300, 40, 40, 0x00ff88);
    this.player.setInteractive();
    
    // 创建收集物品
    this.createItems();
    
    // 创建UI
    this.createUI();
    
    // 输入监听
    this.input.on('pointerdown', this.handleClick, this);
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 显示已解锁成就
    this.displayUnlockedAchievements();
  }
  
  createTextures() {
    // 使用Graphics创建纹理
    const graphics = this.add.graphics();
    
    // 玩家纹理
    graphics.fillStyle(0x00ff88, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    
    // 物品纹理
    graphics.clear();
    graphics.fillStyle(0xffaa00, 1);
    graphics.fillCircle(15, 15, 15);
    graphics.generateTexture('item', 30, 30);
    
    graphics.destroy();
  }
  
  createItems() {
    // 创建15个可收集物品
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.add.circle(x, y, 15, 0xffaa00);
      item.setData('collected', false);
      this.items.push(item);
    }
  }
  
  createUI() {
    // 标题
    const title = this.add.text(400, 30, '成就系统演示', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // 进度显示
    this.clickText = this.add.text(20, 70, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    this.timeText = this.add.text(20, 100, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    this.itemText = this.add.text(20, 130, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    // 说明文字
    const instructions = this.add.text(400, 570, '点击屏幕 | 方向键移动收集物品', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    instructions.setOrigin(0.5);
  }
  
  displayUnlockedAchievements() {
    const achievements = this.achievementManager.getAllAchievements();
    const unlocked = achievements.filter(a => a.unlocked);
    
    if (unlocked.length > 0) {
      const text = this.add.text(600, 70, '已解锁成就:', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffaa00',
        fontStyle: 'bold'
      });
      
      unlocked.forEach((achievement, index) => {
        this.add.text(600, 95 + index * 25, `✓ ${achievement.name}`, {
          fontSize: '12px',
          fontFamily: 'Arial',
          color: '#00ff88'
        });
      });
    }
  }
  
  handleClick(pointer) {
    this.clickCount++;
    this.achievementManager.updateProgress('clicker', this.clickCount);
  }
  
  update(time, delta) {
    // 更新存活时间
    const survivalTime = time - this.startTime;
    this.achievementManager.updateProgress('survivor', survivalTime);
    
    // 更新UI
    const clickAchievement = this.achievementManager.achievements.clicker;
    this.clickText.setText(`点击: ${clickAchievement.current}/${clickAchievement.target} ${clickAchievement.unlocked ? '✓' : ''}`);
    
    const timeAchievement = this.achievementManager.achievements.survivor;
    const seconds = Math.floor(timeAchievement.current / 1000);
    const targetSeconds = Math.floor(timeAchievement.target / 1000);
    this.timeText.setText(`存活: ${seconds}s/${targetSeconds}s ${timeAchievement.unlocked ? '✓' : ''}`);
    
    const itemAchievement = this.achievementManager.achievements.collector;
    this.itemText.setText(`收集: ${itemAchievement.current}/${itemAchievement.target} ${itemAchievement.unlocked ? '✓' : ''}`);
    
    // 玩家移动
    const speed = 200;
    if (this.cursors.left.isDown) {
      this.player.x -= speed * delta / 1000;
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed * delta / 1000;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed * delta / 1000;
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed * delta / 1000;
    }
    
    // 限制边界
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);
    
    // 检测碰撞
    this.checkItemCollection();
  }
  
  checkItemCollection() {
    this.items.forEach(item => {
      if (item.getData('collected')) return;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        item.x, item.y
      );
      
      if (distance < 30) {
        item.setData('collected', true);
        item.setAlpha(0.2);
        this.itemsCollected++;
        this.achievementManager.updateProgress('collector', this.itemsCollected);
      }
    });
  }
  
  showAchievementPopup(achievement) {
    // 创建弹窗容器
    const popup = this.add.container(400, -200);
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d44, 0.95);
    bg.fillRoundedRect(-180, -80, 360, 160, 10);
    bg.lineStyle(3, 0xffaa00, 1);
    bg.strokeRoundedRect(-180, -80, 360, 160, 10);
    
    // 成就图标
    const icon = this.add.graphics();
    icon.fillStyle(0xffaa00, 1);
    icon.fillStar(-130, 0, 5, 30, 15);
    
    // 文字
    const title = this.add.text(0, -30, '🏆 成就解锁！', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffaa00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    const name = this.add.text(0, 10, achievement.name, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    name.setOrigin(0.5);
    
    const desc = this.add.text(0, 40, achievement.description, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#cccccc'
    });
    desc.setOrigin(0.5);
    
    popup.add([bg, icon, title, name, desc]);
    
    // 动画：滑入
    this.tweens.add({
      targets: popup,
      y: 150,
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // 动画：停留后滑出
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: popup,
        y: -200,
        duration: 500,
        ease: 'Back.easeIn',
        onComplete: () => {
          popup.destroy();
        }
      });
    });
    
    // 粒子效果
    this.createCelebrationParticles(400, 150);
  }
  
  createCelebrationParticles(x, y) {
    const colors = [0xffaa00, 0x00ff88, 0xff00ff, 0x00ffff];
    
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = Phaser.Math.Between(100, 200);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const particle = this.add.circle(x, y, 5, colors[i % colors.length]);
      
      this.tweens.add({
        targets: particle,
        x: x + vx * 0.5,
        y: y + vy * 0.5,
        alpha: 0,
        scale: 0,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);