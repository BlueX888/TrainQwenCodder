class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 使用Graphics程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（白色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0xffffff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.generateTexture('item', 16, 16);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(250, 250);
    this.player.setDrag(800, 800);

    // 创建AI敌人
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组（固定随机种子以保证确定性）
    this.items = this.physics.add.group();
    const seed = 12345; // 固定种子
    let rng = this.createSeededRandom(seed);
    
    for (let i = 0; i < 20; i++) {
      const x = rng() * 700 + 50; // 50-750
      const y = rng() * 500 + 50; // 50-550
      const item = this.items.create(x, y, 'item');
      item.setImmovable(true);
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 20', {
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
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);
  }

  // 简单的线性同余生成器（LCG）用于可重复的随机数
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 20');

    // 检查胜利条件
    if (this.score >= 20) {
      this.gameWon = true;
      this.gameOver = true;
      this.endGame('YOU WIN!');
    }
  }

  hitAI(player, ai) {
    if (this.gameOver) return;

    this.gameOver = true;
    this.gameWon = false;
    this.endGame('GAME OVER!');
  }

  endGame(message) {
    // 停止所有物理对象
    this.player.setVelocity(0, 0);
    this.ai.setVelocity(0, 0);
    
    // 显示结果
    this.statusText.setText(message);
    this.statusText.setVisible(true);

    // 输出可验证的状态
    console.log('Game ended:', {
      score: this.score,
      gameWon: this.gameWon,
      gameOver: this.gameOver
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动控制
    const acceleration = 800;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // AI追踪玩家（速度300）
    this.physics.moveToObject(this.ai, this.player, 300);
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