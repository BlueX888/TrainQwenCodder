class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.ITEMS_TO_WIN = 20;
    this.AI_SPEED = 360;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家（蓝色方块）
    this.player = this.physics.add.sprite(100, 100, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建AI敌人（绿色方块）
    this.enemy = this.physics.add.sprite(700, 500, 'enemyTex');
    this.enemy.setCollideWorldBounds(true);

    // 创建物品组（黄色圆点）
    this.items = this.physics.add.group();
    this.createItems();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

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
      this.enemy,
      this.hitEnemy,
      null,
      this
    );

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 20', {
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

    // 添加游戏说明
    this.add.text(16, 50, 'Use Arrow Keys to Move\nCollect 20 items to win!\nAvoid the green AI!', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemyTex', 32, 32);
    enemyGraphics.destroy();

    // 创建物品纹理（黄色圆点）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(8, 8, 8);
    itemGraphics.generateTexture('itemTex', 16, 16);
    itemGraphics.destroy();
  }

  createItems() {
    // 使用固定种子生成物品位置（确保确定性）
    const seed = 12345;
    let rng = this.createSeededRandom(seed);

    for (let i = 0; i < this.ITEMS_TO_WIN; i++) {
      // 生成随机位置，避免边缘
      const x = rng() * (800 - 100) + 50;
      const y = rng() * (600 - 100) + 50;
      
      const item = this.items.create(x, y, 'itemTex');
      item.setCollideWorldBounds(true);
    }
  }

  // 简单的种子随机数生成器（确保确定性）
  createSeededRandom(seed) {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / ${this.ITEMS_TO_WIN}`);

    // 检查是否获胜
    if (this.score >= this.ITEMS_TO_WIN) {
      this.gameWon = true;
      this.endGame('YOU WIN!', '#00ff00');
    }
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) return;

    this.endGame('GAME OVER!\nAI Caught You!', '#ff0000');
  }

  endGame(message, color) {
    this.gameOver = true;
    this.player.setVelocity(0, 0);
    this.enemy.setVelocity(0, 0);

    this.statusText.setText(message);
    this.statusText.setStyle({ fill: color });
    this.statusText.setVisible(true);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动控制
    const speed = 300;
    this.player.setVelocity(0, 0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // AI追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.AI_SPEED);

    // 让AI面向玩家方向（可选的视觉效果）
    const angle = Phaser.Math.Angle.Between(
      this.enemy.x,
      this.enemy.y,
      this.player.x,
      this.player.y
    );
    this.enemy.rotation = angle;
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