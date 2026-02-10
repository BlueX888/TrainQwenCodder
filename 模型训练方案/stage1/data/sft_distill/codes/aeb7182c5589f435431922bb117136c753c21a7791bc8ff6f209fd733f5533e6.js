// 成就系统完整实现
class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = this.initAchievements();
    this.loadProgress();
  }

  initAchievements() {
    return {
      firstClick: { id: 'firstClick', name: '初次尝试', desc: '点击屏幕1次', target: 1, current: 0, unlocked: false },
      click10: { id: 'click10', name: '点击新手', desc: '点击屏幕10次', target: 10, current: 0, unlocked: false },
      click50: { id: 'click50', name: '点击达人', desc: '点击屏幕50次', target: 50, current: 0, unlocked: false },
      click100: { id: 'click100', name: '点击大师', desc: '点击屏幕100次', target: 100, current: 0, unlocked: false },
      
      moveShort: { id: 'moveShort', name: '小步快跑', desc: '移动距离达到500', target: 500, current: 0, unlocked: false },
      moveMedium: { id: 'moveMedium', name: '长途跋涉', desc: '移动距离达到2000', target: 2000, current: 0, unlocked: false },
      moveLong: { id: 'moveLong', name: '马拉松', desc: '移动距离达到5000', target: 5000, current: 0, unlocked: false },
      
      time30: { id: 'time30', name: '坚持30秒', desc: '游戏时间达到30秒', target: 30, current: 0, unlocked: false },
      time60: { id: 'time60', name: '坚持1分钟', desc: '游戏时间达到60秒', target: 60, current: 0, unlocked: false },
      time120: { id: 'time120', name: '坚持2分钟', desc: '游戏时间达到120秒', target: 120, current: 0, unlocked: false },
      
      combo5: { id: 'combo5', name: '连击新手', desc: '达成5连击', target: 5, current: 0, unlocked: false },
      combo10: { id: 'combo10', name: '连击高手', desc: '达成10连击', target: 10, current: 0, unlocked: false },
      combo20: { id: 'combo20', name: '连击大师', desc: '达成20连击', target: 20, current: 0, unlocked: false },
      
      fastClick: { id: 'fastClick', name: '手速如飞', desc: '1秒内点击5次', target: 5, current: 0, unlocked: false },
      
      keyPress20: { id: 'keyPress20', name: '键盘侠', desc: '按键20次', target: 20, current: 0, unlocked: false },
      keyPress50: { id: 'keyPress50', name: '键盘大师', desc: '按键50次', target: 50, current: 0, unlocked: false },
      
      allDirections: { id: 'allDirections', name: '四面八方', desc: '使用所有方向键', target: 4, current: 0, unlocked: false },
      
      speedDemon: { id: 'speedDemon', name: '速度恶魔', desc: '移动速度超过300', target: 300, current: 0, unlocked: false },
      
      explorer: { id: 'explorer', name: '探索者', desc: '访问所有四个角落', target: 4, current: 0, unlocked: false },
      
      collector: { id: 'collector', name: '收藏家', desc: '解锁10个成就', target: 10, current: 0, unlocked: false }
    };
  }

  loadProgress() {
    const saved = localStorage.getItem('phaser_achievements');
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(this.achievements).forEach(key => {
        if (data[key]) {
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

  updateProgress(achievementId, value, isIncrement = true) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return false;

    if (isIncrement) {
      achievement.current += value;
    } else {
      achievement.current = Math.max(achievement.current, value);
    }

    if (achievement.current >= achievement.target) {
      achievement.unlocked = true;
      this.saveProgress();
      this.scene.showAchievementPopup(achievement);
      
      // 检查收藏家成就
      const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
      if (unlockedCount >= 10 && !this.achievements.collector.unlocked) {
        this.updateProgress('collector', 10, false);
      }
      
      return true;
    }

    this.saveProgress();
    return false;
  }

  getUnlockedCount() {
    return Object.values(this.achievements).filter(a => a.unlocked).length;
  }

  getTotalCount() {
    return Object.keys(this.achievements).length;
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.clickCount = 0;
    this.keyPressCount = 0;
    this.totalDistance = 0;
    this.gameTime = 0;
    this.comboCount = 0;
    this.lastClickTime = 0;
    this.recentClicks = [];
    this.maxSpeed = 0;
    this.directionsUsed = new Set();
    this.cornersVisited = new Set();
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    this.achievementManager = new AchievementManager(this);
    
    // 创建玩家
    this.createPlayer();
    
    // 创建UI
    this.createUI();
    
    // 创建成就列表按钮
    this.createAchievementListButton();
    
    // 输入处理
    this.setupInput();
    
    // 开始游戏计时
    this.startTime = Date.now();
    
    // 添加说明文本
    this.createInstructions();
  }

  createPlayer() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');
    this.playerVelocity = { x: 0, y: 0 };
    this.lastPlayerPos = { x: 400, y: 300 };
  }

  createUI() {
    // 状态显示
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statsText.setDepth(100);

    // 成就弹窗容器（初始隐藏）
    this.achievementPopups = [];
  }

  createAchievementListButton() {
    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonX = 800 - buttonWidth - 10;
    const buttonY = 10;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x4444ff, 1);
    buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
    buttonGraphics.lineStyle(2, 0xffffff, 1);
    buttonGraphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);

    const buttonText = this.add.text(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2, '成就列表', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    buttonGraphics.setInteractive(
      new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );

    buttonGraphics.on('pointerdown', () => {
      this.showAchievementList();
    });

    buttonGraphics.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x6666ff, 1);
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
      buttonGraphics.lineStyle(2, 0xffffff, 1);
      buttonGraphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
    });

    buttonGraphics.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x4444ff, 1);
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
      buttonGraphics.lineStyle(2, 0xffffff, 1);
      buttonGraphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
    });
  }

  createInstructions() {
    const instructions = [
      '控制说明：',
      '- 点击屏幕移动',
      '- 方向键移动',
      '- 点击右上角查看成就'
    ];

    this.add.text(10, 550, instructions.join('\n'), {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  setupInput() {
    // 点击输入
    this.input.on('pointerdown', (pointer) => {
      this.handleClick(pointer);
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 监听所有按键
    this.input.keyboard.on('keydown', () => {
      this.keyPressCount++;
      this.achievementManager.updateProgress('keyPress20', 1);
      this.achievementManager.updateProgress('keyPress50', 1);
    });
  }

  handleClick(pointer) {
    this.clickCount++;
    const currentTime = Date.now();

    // 更新点击成就
    this.achievementManager.updateProgress('firstClick', 1);
    this.achievementManager.updateProgress('click10', 1);
    this.achievementManager.updateProgress('click50', 1);
    this.achievementManager.updateProgress('click100', 1);

    // 连击检测
    if (currentTime - this.lastClickTime < 1000) {
      this.comboCount++;
    } else {
      this.comboCount = 1;
    }

    this.achievementManager.updateProgress('combo5', this.comboCount, false);
    this.achievementManager.updateProgress('combo10', this.comboCount, false);
    this.achievementManager.updateProgress('combo20', this.comboCount, false);

    // 快速点击检测
    this.recentClicks.push(currentTime);
    this.recentClicks = this.recentClicks.filter(t => currentTime - t < 1000);
    if (this.recentClicks.length >= 5) {
      this.achievementManager.updateProgress('fastClick', 5, false);
    }

    this.lastClickTime = currentTime;

    // 移动玩家
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.x, pointer.y);
    this.playerVelocity.x = Math.cos(angle) * 5;
    this.playerVelocity.y = Math.sin(angle) * 5;
  }

  update(time, delta) {
    // 更新游戏时间
    this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
    this.achievementManager.updateProgress('time30', this.gameTime, false);
    this.achievementManager.updateProgress('time60', this.gameTime, false);
    this.achievementManager.updateProgress('time120', this.gameTime, false);

    // 键盘移动
    const speed = 3;
    if (this.cursors.left.isDown) {
      this.playerVelocity.x = -speed;
      this.directionsUsed.add('left');
    } else if (this.cursors.right.isDown) {
      this.playerVelocity.x = speed;
      this.directionsUsed.add('right');
    } else {
      this.playerVelocity.x *= 0.95;
    }

    if (this.cursors.up.isDown) {
      this.playerVelocity.y = -speed;
      this.directionsUsed.add('up');
    } else if (this.cursors.down.isDown) {
      this.playerVelocity.y = speed;
      this.directionsUsed.add('down');
    } else {
      this.playerVelocity.y *= 0.95;
    }

    // 检查方向键成就
    if (this.directionsUsed.size === 4) {
      this.achievementManager.updateProgress('allDirect