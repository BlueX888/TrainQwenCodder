class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（青色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ffff, 1);
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
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保确定性）
    const seed = 12345;
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < 5; i++) {
      const x = 100 + random() * 600;
      const y = 100 + random() * 400;
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // UI 文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 5', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 初始化随机数生成器状态
    this.randomState = seed;
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    }

    // AI 追踪玩家，速度 360
    this.physics.moveToObject(this.ai, this.player, 360);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 5');

    if (this.score >= 5) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    this.loseGame();
  }

  winGame() {
    this.gameWon = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.statusText.setText('YOU WIN!');
    this.statusText.setFill('#00ff00');
    this.statusText.setVisible(true);
  }

  loseGame() {
    this.gameOver = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.statusText.setText('GAME OVER');
    this.statusText.setFill('#ff0000');
    this.statusText.setVisible(true);
  }

  // 简单的伪随机数生成器（确保确定性）
  seededRandom(seed) {
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

new Phaser.Game(config);