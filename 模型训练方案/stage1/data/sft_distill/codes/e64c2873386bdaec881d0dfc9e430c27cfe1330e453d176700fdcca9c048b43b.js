// 成就管理器类
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = this.initAchievements();
    this.loadProgress();
  }

  initAchievements() {
    return [
      { id: 'first_click', name: '初次尝试', desc: '点击任意位置', unlocked: false, condition: () => this.scene.stats.clicks >= 1 },
      { id: 'click_master', name: '点击大师', desc: '累计点击100次', unlocked: false, condition: () => this.scene.stats.clicks >= 100 },
      { id: 'survivor_10', name: '存活者', desc: '存活10秒', unlocked: false, condition: () => this.scene.stats.survivalTime >= 10 },
      { id: 'survivor_60', name: '持久战士', desc: '存活60秒', unlocked: false, condition: () => this.scene.stats.survivalTime >= 60 },
      { id: 'combo_5', name: '连击新手', desc: '达成5连击', unlocked: false, condition: () => this.scene.stats.maxCombo >= 5 },
      { id: 'combo_20', name: '连击大师', desc: '达成20连击', unlocked: false, condition: () => this.scene.stats.maxCombo >= 20 },
      { id: 'collector_10', name: '收藏家', desc: '收集10个物品', unlocked: false, condition: () => this.scene.stats.collected >= 10 },
      { id: 'collector_50', name: '贪婪收藏家', desc: '收集50个物品', unlocked: false, condition: () => this.scene.stats.collected >= 50 },
      { id: 'score_1000', name: '千分达成', desc: '获得1000分', unlocked: false, condition: () => this.scene.stats.score >= 1000 },
      { id: 'score_5000', name: '五千豪杰', desc: '获得5000分', unlocked: false, condition: () => this.scene.stats.score >= 5000 },
      { id: 'speed_demon', name: '速度恶魔', desc: '3秒内点击20次', unlocked: false, condition: () => this.scene.stats.clicksIn3Sec >= 20 },
      { id: 'explorer', name: '探索者', desc: '访问所有四个角落', unlocked: false, condition: () => this.scene.stats.cornersVisited >= 4 },
      { id: 'perfectionist', name: '完美主义者', desc: '连续收集10个不失误', unlocked: false, condition: () => this.scene.stats.perfectStreak >= 10 },
      { id: 'keyboard_warrior', name: '键盘战士', desc: '使用所有方向键', unlocked: false, condition: () => this.scene.stats.keysUsed.size >= 4 },
      { id: 'multitasker', name: '多面手', desc: '同时满足5个条件', unlocked: false, condition: () => {
        return this.scene.stats.clicks >= 50 &&
               this.scene.stats.collected >= 20 &&
               this.scene.stats.score >= 2000 &&
               this.scene.stats.maxCombo >= 10 &&
               this.scene.stats.survivalTime >= 30;
      }}
    ];
  }

  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      this.achievements.forEach(ach => {
        if (data[ach.id]) {
          ach.unlocked = true;
        }
      });
    }
  }

  saveProgress() {
    const data = {};
    this.achievements.forEach(ach => {
      if (ach.unlocked) {
        data[ach.id] = true;
      }
    });
    localStorage.setItem('phaser_achievements', JSON.stringify(data));
  }

  checkAchievements() {
    const newlyUnlocked = [];
    this.achievements.forEach(ach => {
      if (!ach.unlocked && ach.condition()) {
        ach.unlocked = true;
        newlyUnlocked.push(ach);
      }
    });
    
    if (newlyUnlocked.length > 0) {
      this.saveProgress();
      newlyUnlocked.forEach(ach => {
        this.scene.showAchievementPopup(ach);
      });
    }
  }

  getUnlockedCount() {
    return this.achievements.filter(a => a.unlocked).length;
  }
}

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.stats = {
      clicks: 0,
      survivalTime: 0,
      maxCombo: 0,
      currentCombo: 0,
      collected: 0,
      score: 0,
      clicksIn3Sec: 0,
      cornersVisited: 0,
      perfectStreak: 0,
      currentPerfectStreak: 0,
      keysUsed: new Set(),
      visitedCorners: new Set()
    };
    this.startTime = 0;
    this.clickTimes = [];
    this.collectibles = [];
    this.popupQueue = [];
    this.currentPopup = null;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 创建收集物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.generateTexture('collectible', 20, 20);
    graphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 30, 30);
    playerGraphics.generateTexture('player', 30, 30);
    playerGraphics.destroy();
  }

  create() {
    this.startTime = Date.now();
    
    // 初始化成就系统
    this.achievementManager = new AchievementManager(this);

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.add.sprite(400, 300, 'player');

    // 创建UI
    this.createUI();

    // 设置输入
    this.setupInput();

    // 生成收集物
    this.spawnCollectibles();

    // 设置定时器
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnCollectibles,
      callbackScope: this,
      loop: true
    });
  }

  createUI() {
    // 统计信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 成就计数
    this.achievementText = this.add.text(10, 550, '', {
      fontSize: '16px',
      fill: '#ffd700',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });

    // 提示文本
    this.add.text(400, 30, '使用方向键移动，点击鼠标，收集黄色圆点！', {
      fontSize: '16px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 角落标记
    this.createCornerMarkers();
  }

  createCornerMarkers() {
    const corners = [
      { x: 50, y: 50, label: '左上' },
      { x: 750, y: 50, label: '右上' },
      { x: 50, y: 550, label: '左下' },
      { x: 750, y: 550, label: '右下' }
    ];

    corners.forEach((corner, index) => {
      const marker = this.add.graphics();
      marker.lineStyle(2, 0x666666, 0.5);
      marker.strokeRect(corner.x - 30, corner.y - 30, 60, 60);
      
      this.add.text(corner.x, corner.y, corner.label, {
        fontSize: '12px',
        fill: '#666666',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });
  }

  setupInput() {
    // 鼠标点击
    this.input.on('pointerdown', () => {
      this.stats.clicks++;
      
      // 记录点击时间用于速度成就
      const now = Date.now();
      this.clickTimes.push(now);
      this.clickTimes = this.clickTimes.filter(t => now - t < 3000);
      this.stats.clicksIn3Sec = this.clickTimes.length;
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  spawnCollectibles() {
    if (this.collectibles.length < 10) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(80, 520);
      const collectible = this.add.sprite(x, y, 'collectible');
      collectible.setData('value', 100);
      this.collectibles.push(collectible);

      // 添加闪烁动画
      this.tweens.add({
        targets: collectible,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  update(time, delta) {
    // 更新存活时间
    this.stats.survivalTime = Math.floor((Date.now() - this.startTime) / 1000);

    // 玩家移动
    const speed = 200 * (delta / 1000);
    let moved = false;

    if (this.cursors.left.isDown) {
      this.player.x = Math.max(15, this.player.x - speed);
      this.stats.keysUsed.add('left');
      moved = true;
    }
    if (this.cursors.right.isDown) {
      this.player.x = Math.min(785, this.player.x + speed);
      this.stats.keysUsed.add('right');
      moved = true;
    }
    if (this.cursors.up.isDown) {
      this.player.y = Math.max(15, this.player.y - speed);
      this.stats.keysUsed.add('up');
      moved = true;
    }
    if (this.cursors.down.isDown) {
      this.player.y = Math.min(585, this.player.y + speed);
      this.stats.keysUsed.add('down');
      moved = true;
    }

    // 检查角落访问
    this.checkCornerVisit();

    // 碰撞检测
    this.collectibles.forEach((collectible, index) => {
      if (!collectible.active) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        collectible.x, collectible.y
      );

      if (distance < 30) {
        this.collectItem(collectible, index);
      }
    });

    // 连击超时检测
    if (moved && Date.now() - (this.lastCollectTime || 0) > 2000) {
      if (this.stats.currentCombo > 0) {
        this.stats.currentCombo = 0;
        this.stats.currentPerfectStreak = 0;
      }
    }

    // 检查成就
    this.achievementManager.checkAchievements();

    // 更新UI
    this.updateUI();
  }

  checkCornerVisit() {
    const corners = [
      { x: 50, y: 50, id: 'tl' },
      { x: 750, y: 50, id: 'tr' },
      { x: 50, y: 550, id: 'bl' },
      { x: 750, y: 550, id: 'br' }
    ];

    corners.forEach(corner => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        corner.x, corner.y
      );
      if (distance < 40 && !this.stats.visitedCorners.has(corner.id)) {
        this.stats.visitedCorners.add(corner.id);
        this.stats.cornersVisited = this.stats.visitedCorners.size;
      }
    });
  }

  collectItem(collectible, index) {
    this.stats.collected++;
    this.stats.score += collectible.getData('value');
    this.stats.currentCombo++;
    this.stats.currentPerfectStreak++;
    
    if (this.stats.currentCombo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.currentCombo;
    }
    if (this.stats.currentPerfectStreak > this.stats.perfectStreak) {
      this.stats.perfectStreak = this.stats.currentPerfectStreak;
    }

    this.lastCollectTime = Date.now();

    // 收集特效
    this.tweens.add({
      targets: collectible,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        collectible.destroy();
      }
    });