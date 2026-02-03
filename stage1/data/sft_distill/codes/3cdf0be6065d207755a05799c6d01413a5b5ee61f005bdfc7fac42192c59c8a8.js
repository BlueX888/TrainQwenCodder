class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.targetScore = 15;
  }

  preload() {
    // 使用 Graphics 生成纹理，不依赖外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（紫色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x8800ff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆点）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.generateTexture('item', 16, 16);
    itemGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(300, 300);
    this.player.setDrag(500, 500);

    // 创建 AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    this.createItems();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

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

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, 'Score: 0/15', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    this.statusText.setVisible(false);

    this.instructionText = this.add.text(400, 580, 'Use WASD or Arrow Keys to move. Collect 15 items to win!', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createItems() {
    // 使用固定种子生成物品位置（确保可重现）
    const seed = 12345;
    let currentSeed = seed;
    
    const seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    for (let i = 0; i < this.targetScore; i++) {
      const x = 50 + seededRandom() * 700;
      const y = 50 + seededRandom() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCollideWorldBounds(true);
    }
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/${this.targetScore}`);

    // 检查胜利条件
    if (this.score >= this.targetScore) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver) return;
    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.physics.pause();
    
    this.statusText.setText('YOU WIN!');
    this.statusText.setFill('#00ff00');
    this.statusText.setVisible(true);

    this.instructionText.setText('Press SPACE to restart');
    
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.resetGame();
    });
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.physics.pause();
    
    this.player.setTint(0xff0000);
    
    this.statusText.setText('GAME OVER!');
    this.statusText.setFill('#ff0000');
    this.statusText.setVisible(true);

    this.instructionText.setText('Press SPACE to restart');
    
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.resetGame();
    });
  }

  resetGame() {
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动控制
    const acceleration = 600;
    
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

    // AI 追踪玩家逻辑
    const aiSpeed = 360;
    this.physics.moveToObject(this.ai, this.player, aiSpeed);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);