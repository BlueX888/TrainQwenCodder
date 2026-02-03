class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.isWin = false;
    this.REQUIRED_ITEMS = 3;
    this.AI_SPEED = 300;
    this.PLAYER_SPEED = 200;
  }

  preload() {
    // 使用 Graphics 生成纹理，不依赖外部资源
    this.generateTextures();
  }

  generateTextures() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成 AI 纹理（紫色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x9933ff, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 生成物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 设置固定随机种子以保证确定性
    Phaser.Math.RND.sow(['phaser-ai-chase-game']);

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI
    this.ai = this.physics.add.sprite(700, 500, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    this.spawnItems();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}/${this.REQUIRED_ITEMS}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 添加游戏说明
    this.add.text(16, 50, 'Use Arrow Keys to move\nCollect 3 items to win\nAvoid the purple AI!', {
      fontSize: '16px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  spawnItems() {
    // 在随机位置生成 3 个物品
    const positions = [
      { x: 200, y: 300 },
      { x: 600, y: 200 },
      { x: 400, y: 450 }
    ];

    // 使用固定种子打乱位置
    Phaser.Utils.Array.Shuffle(positions);

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCollideWorldBounds(true);
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    // 收集物品
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/${this.REQUIRED_ITEMS}`);

    // 检查是否获胜
    if (this.score >= this.REQUIRED_ITEMS) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver) return;

    // 被 AI 碰到，游戏失败
    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.isWin = true;
    this.physics.pause();
    this.player.setTint(0x00ff00);
    this.gameOverText.setText('YOU WIN!');
    this.gameOverText.setStyle({ fill: '#00ff00' });
    this.gameOverText.setVisible(true);
  }

  loseGame() {
    this.gameOver = true;
    this.isWin = false;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.gameOverText.setText('GAME OVER!');
    this.gameOverText.setStyle({ fill: '#ff0000' });
    this.gameOverText.setVisible(true);
  }

  update(time, delta) {
    if (this.gameOver) return;

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.PLAYER_SPEED);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.PLAYER_SPEED);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.PLAYER_SPEED);
    }

    // AI 追踪玩家（速度 300）
    this.physics.moveToObject(this.ai, this.player, this.AI_SPEED);
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证接口（用于测试）
if (typeof window !== 'undefined') {
  window.getGameState = function() {
    const scene = game.scene.scenes[0];
    return {
      score: scene.score,
      gameOver: scene.gameOver,
      isWin: scene.isWin,
      requiredItems: scene.REQUIRED_ITEMS,
      aiSpeed: scene.AI_SPEED
    };
  };
}