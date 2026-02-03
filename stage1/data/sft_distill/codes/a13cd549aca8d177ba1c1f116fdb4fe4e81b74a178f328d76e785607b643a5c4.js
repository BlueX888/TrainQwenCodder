// 全局信号记录
window.__signals__ = {
  currentScene: 'MenuScene',
  sceneTransitions: [],
  buttonClicks: 0,
  timestamp: Date.now()
};

// 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 记录场景启动
    window.__signals__.currentScene = 'MenuScene';
    window.__signals__.sceneTransitions.push({
      scene: 'MenuScene',
      time: Date.now()
    });

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    const titleText = this.add.text(400, 150, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建黄色按钮背景
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0xffcc00, 1);
    buttonGraphics.fillRoundedRect(300, 280, 200, 80, 10);
    
    // 添加按钮边框
    buttonGraphics.lineStyle(3, 0xff9900, 1);
    buttonGraphics.strokeRoundedRect(300, 280, 200, 80, 10);

    // 创建按钮文本
    const buttonText = this.add.text(400, 320, '开始游戏', {
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(400, 320, 200, 80);
    buttonZone.setInteractive({ useHandCursor: true });

    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xffdd33, 1);
      buttonGraphics.fillRoundedRect(300, 280, 200, 80, 10);
      buttonGraphics.lineStyle(3, 0xff9900, 1);
      buttonGraphics.strokeRoundedRect(300, 280, 200, 80, 10);
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xffcc00, 1);
      buttonGraphics.fillRoundedRect(300, 280, 200, 80, 10);
      buttonGraphics.lineStyle(3, 0xff9900, 1);
      buttonGraphics.strokeRoundedRect(300, 280, 200, 80, 10);
    });

    // 点击事件 - 切换到游戏场景
    buttonZone.on('pointerdown', () => {
      // 记录按钮点击
      window.__signals__.buttonClicks++;
      window.__signals__.lastButtonClick = Date.now();

      // 按下效果
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xcc9900, 1);
      buttonGraphics.fillRoundedRect(300, 280, 200, 80, 10);
      buttonGraphics.lineStyle(3, 0xff9900, 1);
      buttonGraphics.strokeRoundedRect(300, 280, 200, 80, 10);

      // 延迟切换场景，展示按下效果
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });

    // 添加说明文本
    const infoText = this.add.text(400, 450, '点击按钮开始游戏', {
      fontSize: '20px',
      color: '#95a5a6'
    });
    infoText.setOrigin(0.5);

    console.log('[MenuScene] 场景已创建');
  }

  update(time, delta) {
    // MenuScene 不需要每帧更新
  }
}

// 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.level = 1;
    this.health = 100;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 记录场景启动
    window.__signals__.currentScene = 'GameScene';
    window.__signals__.sceneTransitions.push({
      scene: 'GameScene',
      time: Date.now()
    });
    window.__signals__.gameState = {
      score: this.score,
      level: this.level,
      health: this.health
    };

    // 创建游戏背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a252f, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题
    const titleText = this.add.text(400, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建游戏信息显示
    this.scoreText = this.add.text(50, 120, `得分: ${this.score}`, {
      fontSize: '24px',
      color: '#00ff00'
    });

    this.levelText = this.add.text(50, 160, `等级: ${this.level}`, {
      fontSize: '24px',
      color: '#00ffff'
    });

    this.healthText = this.add.text(50, 200, `生命值: ${this.health}`, {
      fontSize: '24px',
      color: '#ff6b6b'
    });

    // 创建一个简单的游戏元素（可移动的方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(360, 280, 80, 80);
    this.player = playerGraphics;
    this.playerX = 400;
    this.playerY = 320;

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建返回菜单按钮
    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0xe74c3c, 1);
    backButtonGraphics.fillRoundedRect(300, 480, 200, 60, 10);
    backButtonGraphics.lineStyle(2, 0xc0392b, 1);
    backButtonGraphics.strokeRoundedRect(300, 480, 200, 60, 10);

    const backButtonText = this.add.text(400, 510, '返回菜单', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    backButtonText.setOrigin(0.5);

    // 返回按钮交互
    const backButtonZone = this.add.zone(400, 510, 200, 60);
    backButtonZone.setInteractive({ useHandCursor: true });

    backButtonZone.on('pointerover', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0xff6b6b, 1);
      backButtonGraphics.fillRoundedRect(300, 480, 200, 60, 10);
      backButtonGraphics.lineStyle(2, 0xc0392b, 1);
      backButtonGraphics.strokeRoundedRect(300, 480, 200, 60, 10);
    });

    backButtonZone.on('pointerout', () => {
      backButtonGraphics.clear();
      backButtonGraphics.fillStyle(0xe74c3c, 1);
      backButtonGraphics.fillRoundedRect(300, 480, 200, 60, 10);
      backButtonGraphics.lineStyle(2, 0xc0392b, 1);
      backButtonGraphics.strokeRoundedRect(300, 480, 200, 60, 10);
    });

    backButtonZone.on('pointerdown', () => {
      window.__signals__.buttonClicks++;
      this.scene.start('MenuScene');
    });

    // 添加说明文本
    const infoText = this.add.text(400, 380, '使用方向键移动绿色方块', {
      fontSize: '18px',
      color: '#95a5a6'
    });
    infoText.setOrigin(0.5);

    console.log('[GameScene] 场景已创建');
  }

  update(time, delta) {
    // 键盘控制
    const speed = 3;
    let moved = false;

    if (this.cursors.left.isDown) {
      this.playerX -= speed;
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.playerX += speed;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      this.playerY -= speed;
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.playerY += speed;
      moved = true;
    }

    // 边界检测
    this.playerX = Phaser.Math.Clamp(this.playerX, 40, 760);
    this.playerY = Phaser.Math.Clamp(this.playerY, 100, 460);

    // 更新玩家位置
    if (moved) {
      this.player.clear();
      this.player.fillStyle(0x00ff00, 1);
      this.player.fillRect(this.playerX - 40, this.playerY - 40, 80, 80);

      // 模拟得分增加
      this.score += 1;
      this.scoreText.setText(`得分: ${this.score}`);

      // 更新全局信号
      window.__signals__.gameState = {
        score: this.score,
        level: this.level,
        health: this.health,
        playerX: this.playerX,
        playerY: this.playerY
      };
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene]
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始化信息
console.log('[Game] Phaser3 双场景游戏已启动');
console.log('[Game] 初始场景: MenuScene');
console.log('[Signals] 可通过 window.__signals__ 查看状态');