class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.collectiblesTotal = 5;
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（青色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ffff, 1);
    aiGraphics.fillCircle(16, 16, 16);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建收集物纹理（黄色星星形状）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(200, 200);

    // 创建 AI 角色
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);
    this.aiSpeed = 360;

    // 创建收集物品组
    this.collectibles = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保行为确定性）
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 400, y: 100 }
    ];

    for (let i = 0; i < this.collectiblesTotal; i++) {
      const item = this.collectibles.create(positions[i].x, positions[i].y, 'item');
      item.setCircle(12);
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);

    // 碰撞检测：玩家与 AI
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建 UI 文本
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

    // 添加边界
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 800, 600);
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

    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / ${this.collectiblesTotal}`);

    if (this.score >= this.collectiblesTotal) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    this.loseGame();
  }

  winGame() {
    this.gameWon = true;
    this.physics.pause();
    this.statusText.setText('YOU WIN!\nCollected all items!');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);
    
    // 输出验证信息
    console.log('Game Won! Final score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.statusText.setText('GAME OVER!\nCaught by AI!');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);
    
    // 输出验证信息
    console.log('Game Over! Score:', this.score);
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

// 暴露游戏状态供验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    gameOver: scene.gameOver,
    gameWon: scene.gameWon,
    playerPosition: {
      x: scene.player?.x,
      y: scene.player?.y
    },
    aiPosition: {
      x: scene.ai?.x,
      y: scene.ai?.y
    }
  };
};