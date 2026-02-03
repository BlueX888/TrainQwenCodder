// 成就系统游戏
class AchievementScene extends Phaser.Scene {
  constructor() {
    super('AchievementScene');
    this.achievements = null;
    this.stats = {
      clicks: 0,
      keyPresses: 0,
      fastClicks: 0,
      lastClickTime: 0,
      playTime: 0,
      colorChanges: 0,
      currentColor: 0,
      shapeCreated: 0,
      circleClicks: 0,
      rectClicks: 0,
      tripleCombo: 0,
      lastActionType: '',
      actionSequence: [],
      maxCombo: 0,
      spaceBarPresses: 0,
      enterPresses: 0,
      mouseMoveDist: 0,
      lastMouseX: 0,
      lastMouseY: 0,
      achievementsUnlocked: 0
    };
    this.notificationQueue = [];
    this.isShowingNotification = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化成就系统
    this.achievements = new AchievementManager(this);
    
    // 从localStorage加载已解锁成就
    this.achievements.loadFromStorage();
    
    // 创建UI背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 标题
    this.add.text(400, 30, '🏆 成就系统演示', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 统计信息显示
    this.statsText = this.add.text(20, 70, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      lineSpacing: 5
    });
    
    // 创建交互按钮
    this.createButtons();
    
    // 创建成就列表显示
    this.createAchievementList();
    
    // 设置输入监听
    this.setupInput();
    
    // 更新统计显示
    this.updateStatsDisplay();
    
    // 游戏时间计时器
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.stats.playTime++;
        this.achievements.check('TIME_PLAYED', this.stats.playTime);
        this.updateStatsDisplay();
      },
      loop: true
    });
  }

  createButtons() {
    const buttonData = [
      { x: 250, y: 200, text: '点击按钮', color: 0x4CAF50, action: 'click' },
      { x: 250, y: 260, text: '切换颜色', color: 0x2196F3, action: 'color' },
      { x: 250, y: 320, text: '创建圆形', color: 0xFF9800, action: 'circle' },
      { x: 250, y: 380, text: '创建矩形', color: 0xE91E63, action: 'rect' },
      { x: 250, y: 440, text: '重置进度', color: 0x9E9E9E, action: 'reset' }
    ];
    
    buttonData.forEach(btn => {
      this.createButton(btn.x, btn.y, btn.text, btn.color, btn.action);
    });
  }

  createButton(x, y, text, color, action) {
    const button = this.add.container(x, y);
    
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-80, -20, 160, 40, 8);
    
    const label = this.add.text(0, 0, text, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    button.add([bg, label]);
    button.setSize(160, 40);
    button.setInteractive(new Phaser.Geom.Rectangle(-80, -20, 160, 40), Phaser.Geom.Rectangle.Contains);
    
    // 悬停效果
    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color, 0.8);
      bg.fillRoundedRect(-80, -20, 160, 40, 8);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-80, -20, 160, 40, 8);
    });
    
    // 点击处理
    button.on('pointerdown', () => {
      this.handleButtonAction(action);
    });
  }

  handleButtonAction(action) {
    const now = this.time.now;
    
    switch(action) {
      case 'click':
        this.stats.clicks++;
        
        // 检查快速点击
        if (now - this.stats.lastClickTime < 300) {
          this.stats.fastClicks++;
          this.achievements.check('FAST_CLICKER', this.stats.fastClicks);
        }
        this.stats.lastClickTime = now;
        
        this.achievements.check('FIRST_CLICK', this.stats.clicks);
        this.achievements.check('CLICK_MASTER', this.stats.clicks);
        this.achievements.check('CLICK_LEGEND', this.stats.clicks);
        break;
        
      case 'color':
        this.stats.colorChanges++;
        this.stats.currentColor = (this.stats.currentColor + 1) % 7;
        this.achievements.check('COLOR_EXPLORER', this.stats.colorChanges);
        break;
        
      case 'circle':
        this.stats.shapeCreated++;
        this.stats.circleClicks++;
        this.createShape('circle');
        this.achievements.check('SHAPE_CREATOR', this.stats.shapeCreated);
        this.achievements.check('CIRCLE_LOVER', this.stats.circleClicks);
        break;
        
      case 'rect':
        this.stats.shapeCreated++;
        this.stats.rectClicks++;
        this.createShape('rect');
        this.achievements.check('SHAPE_CREATOR', this.stats.shapeCreated);
        this.achievements.check('SQUARE_MASTER', this.stats.rectClicks);
        break;
        
      case 'reset':
        this.resetProgress();
        return;
    }
    
    // 检查连击
    this.updateCombo(action);
    this.updateStatsDisplay();
  }

  createShape(type) {
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFA500];
    const color = colors[this.stats.currentColor];
    const x = Phaser.Math.Between(450, 750);
    const y = Phaser.Math.Between(100, 500);
    
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 0.8);
    
    if (type === 'circle') {
      graphics.fillCircle(0, 0, 20);
    } else {
      graphics.fillRect(-20, -20, 40, 40);
    }
    
    graphics.setPosition(x, y);
    
    // 添加动画
    this.tweens.add({
      targets: graphics,
      scale: { from: 0, to: 1 },
      alpha: { from: 0, to: 0.8 },
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // 3秒后消失
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: graphics,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => graphics.destroy()
      });
    });
  }

  updateCombo(action) {
    this.stats.actionSequence.push(action);
    if (this.stats.actionSequence.length > 3) {
      this.stats.actionSequence.shift();
    }
    
    // 检查三连击（三个不同操作）
    if (this.stats.actionSequence.length === 3) {
      const unique = new Set(this.stats.actionSequence);
      if (unique.size === 3) {
        this.stats.tripleCombo++;
        this.achievements.check('COMBO_MASTER', this.stats.tripleCombo);
      }
    }
    
    // 检查连击数
    if (action === this.stats.lastActionType) {
      this.stats.maxCombo++;
    } else {
      this.stats.maxCombo = 1;
    }
    this.stats.lastActionType = action;
    
    this.achievements.check('PERSISTENT', this.stats.maxCombo);
  }

  setupInput() {
    // 键盘输入
    this.input.keyboard.on('keydown', (event) => {
      this.stats.keyPresses++;
      
      if (event.key === ' ') {
        this.stats.spaceBarPresses++;
        this.achievements.check('SPACE_CADET', this.stats.spaceBarPresses);
      }
      
      if (event.key === 'Enter') {
        this.stats.enterPresses++;
        this.achievements.check('ENTER_KEY', this.stats.enterPresses);
      }
      
      this.achievements.check('KEYBOARD_WARRIOR', this.stats.keyPresses);
      this.updateStatsDisplay();
    });
    
    // 鼠标移动
    this.input.on('pointermove', (pointer) => {
      if (this.stats.lastMouseX !== 0) {
        const dist = Phaser.Math.Distance.Between(
          this.stats.lastMouseX,
          this.stats.lastMouseY,
          pointer.x,
          pointer.y
        );
        this.stats.mouseMoveDist += dist;
        this.achievements.check('MOUSE_MARATHON', Math.floor(this.stats.mouseMoveDist));
      }
      this.stats.lastMouseX = pointer.x;
      this.stats.lastMouseY = pointer.y;
    });
  }

  createAchievementList() {
    const listX = 450;
    const listY = 100;
    
    this.add.text(listX, listY - 30, '📋 成就列表', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#FFD700',
      fontStyle: 'bold'
    });
    
    this.achievementListText = this.add.text(listX, listY, '', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#cccccc',
      lineSpacing: 3,
      wordWrap: { width: 330 }
    });
    
    this.updateAchievementList();
  }

  updateAchievementList() {
    const list = this.achievements.getAllAchievements();
    let text = '';
    
    list.forEach((ach, index) => {
      const icon = ach.unlocked ? '✅' : '🔒';
      const progress = ach.progress ? ` (${ach.progress}/${ach.target})` : '';
      text += `${icon} ${ach.name}${progress}\n`;
    });
    
    this.achievementListText.setText(text);
  }

  updateStatsDisplay() {
    const unlocked = this.achievements.getUnlockedCount();
    const total = this.achievements.getTotalCount();
    
    const text = `
📊 当前统计：
━━━━━━━━━━━━━━━━━━━━
🏆 成就进度: ${unlocked}/${total}
👆 总点击: ${this.stats.clicks}
⚡ 快速点击: ${this.stats.fastClicks}
⌨️  按键次数: ${this.stats.keyPresses}
🎨 颜色切换: ${this.stats.colorChanges}
📐 创建形状: ${this.stats.shapeCreated}
⭕ 圆形点击: ${this.stats.circleClicks}
⬜ 矩形点击: ${this.stats.rectClicks}
🔥 三连击: ${this.stats.tripleCombo}
⏱️  游戏时间: ${this.stats.playTime}秒
🖱️  鼠标移动: ${Math.floor(this.stats.mouseMoveDist)}px
    `.trim();
    
    this.statsText.setText(text);
  }

  resetProgress() {
    if (confirm('确定要重置所有进度吗？这将清除所有成就！')) {
      localStorage.removeItem('achievements');
      this.scene.restart();
    }
  }

  showAchievementNotification(achievement) {
    this.notificationQueue.push(achievement);
    if (!this.isShowingNotification) {
      this.showNextNotification();
    }
  }

  showNextNotification() {
    if (this.notificationQueue.length === 0) {
      this.isShowingNotification = false;
      return;
    }
    
    this.isShowingNotification = true;
    const achievement = this.notificationQueue.shift();
    
    // 创建通知容器
    const notification = this.add.container(400, -100);
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-200, -60, 400, 120, 12);
    bg.lineStyle(3, 0xFFD700, 1);
    bg.strokeRound