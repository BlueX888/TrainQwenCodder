// 主菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 标题
    const title = this.add.text(width / 2, height / 3, 'PAUSE MENU DEMO', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // 开始按钮
    const startBtn = this.add.text(width / 2, height / 2, 'Press SPACE to Start', {
      fontSize: '24px',
      color: '#00ff00'
    });
    startBtn.setOrigin(0.5);
    
    // 说明文字
    const instructions = this.add.text(width / 2, height / 2 + 80, 
      'Arrow Keys: Move\nESC: Pause Menu\nCollect Green Squares!', {
      fontSize: '18px',
      color: '#aaaaaa',
      align: 'center'
    });
    instructions.setOrigin(0.5);
    
    // 监听空格键开始游戏
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.isPaused = false;
    this.currentSelection = 0; // 0=继续, 1=重新开始, 2=返回主菜单
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, width, height);
    
    // 创建玩家（使用Graphics生成纹理）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00d9ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();
    
    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.player.speed = 200;
    
    // 创建目标物体纹理
    const targetGraphics = this.add.graphics();
    targetGraphics.fillStyle(0x00ff00, 1);
    targetGraphics.fillRect(0, 0, 30, 30);
    targetGraphics.generateTexture('target', 30, 30);
    targetGraphics.destroy();
    
    // 创建目标物体
    this.target = this.add.sprite(
      Phaser.Math.Between(50, width - 50),
      Phaser.Math.Between(50, height - 50),
      'target'
    );
    
    // 分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    
    // 暂停菜单元素（初始隐藏）
    this.createPauseMenu();
    
    // 监听ESC键
    this.escKey.on('down', () => {
      if (!this.isPaused) {
        this.pauseGame();
      }
    });
  }

  createPauseMenu() {
    const { width, height } = this.cameras.main;
    
    // 半透明遮罩
    this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.pauseOverlay.setVisible(false);
    this.pauseOverlay.setDepth(100);
    
    // 菜单背景
    this.menuBg = this.add.rectangle(width / 2, height / 2, 400, 350, 0x16213e);
    this.menuBg.setStrokeStyle(4, 0x00d9ff);
    this.menuBg.setVisible(false);
    this.menuBg.setDepth(101);
    
    // 标题
    this.pauseTitle = this.add.text(width / 2, height / 2 - 120, 'PAUSED', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.pauseTitle.setOrigin(0.5);
    this.pauseTitle.setVisible(false);
    this.pauseTitle.setDepth(102);
    
    // 菜单选项
    this.menuOptions = [
      { text: 'Continue', action: 'continue' },
      { text: 'Restart', action: 'restart' },
      { text: 'Main Menu', action: 'menu' }
    ];
    
    this.menuTexts = [];
    this.menuOptions.forEach((option, index) => {
      const y = height / 2 - 30 + index * 70;
      const text = this.add.text(width / 2, y, option.text, {
        fontSize: '28px',
        color: '#aaaaaa'
      });
      text.setOrigin(0.5);
      text.setVisible(false);
      text.setDepth(102);
      this.menuTexts.push(text);
    });
    
    // 选择指示器
    this.selector = this.add.text(width / 2 - 120, height / 2 - 30, '>', {
      fontSize: '32px',
      color: '#00ff00'
    });
    this.selector.setVisible(false);
    this.selector.setDepth(102);
    
    // 提示文字
    this.hintText = this.add.text(width / 2, height / 2 + 140, 
      '↑↓: Select  ENTER: Confirm', {
      fontSize: '16px',
      color: '#888888'
    });
    this.hintText.setOrigin(0.5);
    this.hintText.setVisible(false);
    this.hintText.setDepth(102);
  }

  pauseGame() {
    this.isPaused = true;
    this.currentSelection = 0;
    
    // 显示暂停菜单
    this.pauseOverlay.setVisible(true);
    this.menuBg.setVisible(true);
    this.pauseTitle.setVisible(true);
    this.selector.setVisible(true);
    this.hintText.setVisible(true);
    this.menuTexts.forEach(text => text.setVisible(true));
    
    this.updateMenuSelection();
    
    // 监听方向键和回车键
    this.cursors.up.on('down', this.menuUp, this);
    this.cursors.down.on('down', this.menuDown, this);
    this.enterKey.on('down', this.menuConfirm, this);
  }

  resumeGame() {
    this.isPaused = false;
    
    // 隐藏暂停菜单
    this.pauseOverlay.setVisible(false);
    this.menuBg.setVisible(false);
    this.pauseTitle.setVisible(false);
    this.selector.setVisible(false);
    this.hintText.setVisible(false);
    this.menuTexts.forEach(text => text.setVisible(false));
    
    // 移除事件监听
    this.cursors.up.off('down', this.menuUp, this);
    this.cursors.down.off('down', this.menuDown, this);
    this.enterKey.off('down', this.menuConfirm, this);
  }

  menuUp() {
    this.currentSelection = (this.currentSelection - 1 + this.menuOptions.length) % this.menuOptions.length;
    this.updateMenuSelection();
  }

  menuDown() {
    this.currentSelection = (this.currentSelection + 1) % this.menuOptions.length;
    this.updateMenuSelection();
  }

  updateMenuSelection() {
    // 更新所有选项颜色
    this.menuTexts.forEach((text, index) => {
      if (index === this.currentSelection) {
        text.setColor('#ffffff');
        text.setScale(1.1);
      } else {
        text.setColor('#aaaaaa');
        text.setScale(1);
      }
    });
    
    // 更新选择指示器位置
    const selectedText = this.menuTexts[this.currentSelection];
    this.selector.setPosition(selectedText.x - 120, selectedText.y);
  }

  menuConfirm() {
    const action = this.menuOptions[this.currentSelection].action;
    
    switch(action) {
      case 'continue':
        this.resumeGame();
        break;
      case 'restart':
        this.scene.restart();
        break;
      case 'menu':
        this.scene.start('MenuScene');
        break;
    }
  }

  update(time, delta) {
    if (this.isPaused) {
      return; // 暂停时不更新游戏逻辑
    }
    
    const { width, height } = this.cameras.main;
    
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.x -= this.player.speed * delta / 1000;
    } else if (this.cursors.right.isDown) {
      this.player.x += this.player.speed * delta / 1000;
    }
    
    if (this.cursors.up.isDown) {
      this.player.y -= this.player.speed * delta / 1000;
    } else if (this.cursors.down.isDown) {
      this.player.y += this.player.speed * delta / 1000;
    }
    
    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, width - 20);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, height - 20);
    
    // 碰撞检测
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.target.x, this.target.y
    );
    
    if (distance < 35) {
      // 收集目标
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      
      // 重新放置目标
      this.target.setPosition(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 50)
      );
      
      // 简单的闪烁效果
      this.target.setAlpha(0.5);
      this.tweens.add({
        targets: this.target,
        alpha: 1,
        duration: 200
      });
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene],
  parent: 'game-container'
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出状态验证变量（用于测试）
if (typeof window !== 'undefined') {
  window.gameState = {
    getScore: () => {
      const gameScene = game.scene.getScene('GameScene');
      return gameScene ? gameScene.score : 0;
    },
    isPaused: () => {
      const gameScene = game.scene.getScene('GameScene');
      return gameScene ? gameScene.isPaused : false;
    },
    getCurrentSelection: () => {
      const gameScene = game.scene.getScene('GameScene');
      return gameScene ? gameScene.currentSelection : -1;
    }
  };
}