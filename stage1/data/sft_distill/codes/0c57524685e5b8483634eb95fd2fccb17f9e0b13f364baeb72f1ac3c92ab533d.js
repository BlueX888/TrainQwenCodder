class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gameState = 'playing'; // 'playing', 'won', 'lost'
    this.score = 0;
    this.targetScore = 5;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 使用固定种子的随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator(['phaser3-ai-chase']);

    // 创建纹理
    this.createTextures();

    // 创建玩家 (绿色方块)
    this.player = this.physics.add.sprite(width / 2, height / 2, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(300);

    // 创建AI (蓝色方块)
    const aiStartX = this.rng.between(50, width - 50);
    const aiStartY = this.rng.between(50, height - 50);
    this.ai = this.physics.add.sprite(aiStartX, aiStartY, 'aiTex');
    this.ai.setCollideWorldBounds(true);
    this.aiSpeed = 360;

    // 创建物品组 (黄色圆形)
    this.items = this.physics.add.group();
    for (let i = 0; i < this.targetScore; i++) {
      const x = this.rng.between(50, width - 50);
      const y = this.rng.between(50, height - 50);
      const item = this.items.create(x, y, 'itemTex');
      item.setCircle(10);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // UI文本
    this.scoreText = this.add.text(16, 16, `收集: ${this.score}/${this.targetScore}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 提示文本
    this.add.text(16, height - 40, '方向键/WASD移动 | 收集5个黄色物品获胜 | 避开蓝色AI', {
      fontSize: '16px',
      fill: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
  }

  createTextures() {
    // 玩家纹理 (绿色方块)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // AI纹理 (蓝色方块)
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x0066ff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('aiTex', 32, 32);
    aiGraphics.destroy();

    // 物品纹理 (黄色圆形)
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(10, 10, 10);
    itemGraphics.generateTexture('itemTex', 20, 20);
    itemGraphics.destroy();
  }

  update(time, delta) {
    if (this.gameState !== 'playing') {
      return;
    }

    // 玩家移动控制
    const acceleration = 600;
    const drag = 500;

    this.player.setDrag(drag);

    let moving = false;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setAccelerationX(-acceleration);
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setAccelerationX(acceleration);
      moving = true;
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setAccelerationY(-acceleration);
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setAccelerationY(acceleration);
      moving = true;
    } else {
      this.player.setAccelerationY(0);
    }

    // AI追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`收集: ${this.score}/${this.targetScore}`);

    // 检查胜利条件
    if (this.score >= this.targetScore) {
      this.gameState = 'won';
      this.endGame('胜利！', '#00ff00');
    }
  }

  hitByAI(player, ai) {
    this.gameState = 'lost';
    this.endGame('失败！', '#ff0000');
  }

  endGame(message, color) {
    // 停止所有移动
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.ai.setVelocity(0, 0);

    // 显示结果
    this.statusText.setText(message);
    this.statusText.setStyle({ fill: color });
    this.statusText.setVisible(true);

    // 禁用输入
    this.input.keyboard.enabled = false;

    // 3秒后重启
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 暴露全局变量用于测试验证
window.getGameState = () => {
  const scene = game.scene.scenes[0];
  return {
    state: scene.gameState,
    score: scene.score,
    targetScore: scene.targetScore,
    playerX: scene.player?.x,
    playerY: scene.player?.y,
    aiX: scene.ai?.x,
    aiY: scene.ai?.y,
    itemsRemaining: scene.items?.getChildren().length || 0
  };
};