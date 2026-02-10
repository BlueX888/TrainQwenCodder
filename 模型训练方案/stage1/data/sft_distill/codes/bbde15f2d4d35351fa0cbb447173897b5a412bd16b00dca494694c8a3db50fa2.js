class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.score = 0;
    this.targetScore = 12;
    this.gameOver = false;
    this.gameWon = false;
    this.aiSpeed = 80;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（绿色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ff00, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆圈）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI 角色
    this.ai = this.physics.add.sprite(700, 500, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确定性）
    const seed = 12345;
    const random = this.createSeededRandom(seed);
    
    for (let i = 0; i < this.targetScore; i++) {
      const x = random() * 700 + 50; // 50 到 750
      const y = random() * 500 + 50; // 50 到 550
      const item = this.items.create(x, y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 12', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动控制
    const playerSpeed = 160;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / ${this.targetScore}`);

    // 检查是否获胜
    if (this.score >= this.targetScore) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.statusText.setText('YOU WIN!');
    this.statusText.setFill('#00ff00');
    this.statusText.setVisible(true);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.statusText.setText('GAME OVER!');
    this.statusText.setFill('#ff0000');
    this.statusText.setVisible(true);
  }

  // 创建确定性随机数生成器
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
}

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

const game = new Phaser.Game(config);

// 暴露场景实例以便验证状态
game.scene.scenes[0].events.on('create', () => {
  window.gameScene = game.scene.scenes[0];
});