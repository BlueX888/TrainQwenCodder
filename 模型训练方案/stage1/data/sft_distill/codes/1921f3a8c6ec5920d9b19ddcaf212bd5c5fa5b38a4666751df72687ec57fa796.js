class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.seed = 12345; // 固定随机种子
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子
    Phaser.Math.RND.sow([this.seed]);

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（紫色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x9900ff, 1);
    aiGraphics.fillCircle(20, 20, 20);
    aiGraphics.generateTexture('ai', 40, 40);
    aiGraphics.destroy();

    // 创建收集物品纹理（黄色星形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.lineStyle(2, 0xffa500, 1);
    // 绘制五角星
    const points = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      points.push(new Phaser.Math.Vector2(
        16 + Math.cos(angle) * 12,
        16 + Math.sin(angle) * 12
      ));
    }
    itemGraphics.fillPoints(points, true);
    itemGraphics.strokePoints(points, true);
    itemGraphics.generateTexture('item', 32, 32);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    this.createItems();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 3', {
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

    // 添加游戏说明
    this.add.text(16, 50, 'Use Arrow Keys to move\nCollect 3 items to win\nAvoid the purple AI!', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  createItems() {
    // 使用固定种子生成3个收集物品
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 450 },
      { x: 700, y: 200 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setScale(1);
    });
  }

  collectItem(player, item) {
    if (this.gameOver) return;

    // 销毁收集到的物品
    item.destroy();
    
    // 增加分数
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / 3`);

    // 检查是否获胜
    if (this.score >= 3) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    if (this.gameOver) return;

    // 游戏失败
    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.physics.pause();
    
    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);

    console.log('Game Result: WIN - Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.physics.pause();
    
    this.statusText.setText('GAME OVER!');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);

    console.log('Game Result: LOSE - Score:', this.score);
  }

  update(time, delta) {
    if (this.gameOver) return;

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

    // AI追踪玩家（速度300）
    this.physics.moveToObject(this.ai, this.player, 300);
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

// 导出状态供验证（可选）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    gameOver: scene.gameOver,
    gameWon: scene.gameWon,
    playerPosition: scene.player ? { x: scene.player.x, y: scene.player.y } : null,
    aiPosition: scene.ai ? { x: scene.ai.x, y: scene.ai.y } : null,
    itemsRemaining: scene.items ? scene.items.getLength() : 0
  };
};