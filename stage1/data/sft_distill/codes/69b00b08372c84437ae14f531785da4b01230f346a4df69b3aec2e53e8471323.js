class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.targetScore = 15;
    this.aiSpeed = 360;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家（绿色方块）
    this.player = this.physics.add.sprite(100, 100, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(300, 300);
    this.player.setDrag(800, 800);

    // 创建 AI（紫色圆形）
    this.ai = this.physics.add.sprite(700, 500, 'aiTex');
    this.ai.setCollideWorldBounds(true);

    // 创建可收集物品组
    this.collectibles = this.physics.add.group();
    this.createCollectibles();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.ai,
      this.hitByAI,
      null,
      this
    );

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 15', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 添加游戏说明
    this.add.text(16, 50, 'Arrow Keys: Move | Collect 15 items to win!', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    this.add.text(16, 75, 'Avoid the Purple AI!', {
      fontSize: '16px',
      fill: '#ff00ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.lineStyle(2, 0x00aa00, 1);
    playerGraphics.strokeRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（紫色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x9900ff, 1);
    aiGraphics.fillCircle(20, 20, 20);
    aiGraphics.lineStyle(3, 0x6600aa, 1);
    aiGraphics.strokeCircle(20, 20, 20);
    aiGraphics.generateTexture('aiTex', 40, 40);
    aiGraphics.destroy();

    // 创建收集物品纹理（黄色小圆点）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.lineStyle(1, 0xffaa00, 1);
    itemGraphics.strokeCircle(8, 8, 8);
    itemGraphics.generateTexture('itemTex', 16, 16);
    itemGraphics.destroy();
  }

  createCollectibles() {
    // 使用固定种子生成随机位置
    const seed = 12345;
    let randomValue = seed;
    
    const getRandomInRange = (min, max) => {
      randomValue = (randomValue * 9301 + 49297) % 233280;
      return min + (randomValue / 233280) * (max - min);
    };

    // 生成 15 个收集物品
    for (let i = 0; i < this.targetScore; i++) {
      const x = getRandomInRange(50, 750);
      const y = getRandomInRange(120, 550);
      
      const item = this.collectibles.create(x, y, 'itemTex');
      item.setCircle(8);
      item.body.setAllowGravity(false);
      
      // 添加闪烁动画效果
      this.tweens.add({
        targets: item,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  collectItem(player, item) {
    if (this.gameOver || this.gameWon) return;

    // 移除物品
    item.destroy();
    
    // 增加分数
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / ${this.targetScore}`);

    // 检查是否获胜
    if (this.score >= this.targetScore) {
      this.winGame();
    }

    // 播放收集音效（视觉反馈）
    const flash = this.add.circle(item.x, item.y, 20, 0xffff00, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  hitByAI(player, ai) {
    if (this.gameOver || this.gameWon) return;

    this.loseGame();
  }

  winGame() {
    this.gameWon = true;
    this.gameOver = true;
    
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);
    
    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);

    // 添加胜利动画
    this.tweens.add({
      targets: this.statusText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log('Game Won! Final Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);
    
    this.statusText.setText('GAME OVER!');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);

    // 玩家变红
    this.player.setTint(0xff0000);

    console.log('Game Over! Final Score:', this.score);
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

    // 玩家控制
    this.handlePlayerMovement();

    // AI 追踪玩家
    this.handleAIMovement();
  }

  handlePlayerMovement() {
    const acceleration = 600;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }
  }

  handleAIMovement() {
    // AI 以固定速度追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);