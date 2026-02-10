class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.targetScore = 15;
  }

  preload() {
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

    // 创建收集物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 设置随机种子以保证可重现性
    Phaser.Math.RND.sow(['phaser3-ai-chase-game']);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI 敌人
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 生成 15 个随机位置的收集物品
    for (let i = 0; i < this.targetScore; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCollideWorldBounds(true);
    }

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 添加碰撞检测：AI 碰到玩家
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 创建 UI 文本
    this.scoreText = this.add.text(16, 16, `Score: 0/${this.targetScore}`, {
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

    // 添加说明文本
    this.add.text(16, 560, 'Arrow Keys to Move | Collect 15 items to Win | Avoid Green AI', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动控制
    const playerSpeed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // AI 追踪玩家，速度为 160
    this.physics.moveToObject(this.ai, this.player, 160);
  }

  collectItem(player, item) {
    // 移除收集的物品
    item.destroy();

    // 增加分数
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/${this.targetScore}`);

    // 检查是否获胜
    if (this.score >= this.targetScore) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    if (!this.gameOver) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameWon = true;
    this.gameOver = true;
    
    // 停止所有物理对象
    this.player.setVelocity(0);
    this.ai.setVelocity(0);

    // 显示胜利信息
    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);

    console.log('Game Won! Final Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;
    
    // 停止所有物理对象
    this.player.setVelocity(0);
    this.ai.setVelocity(0);

    // 显示失败信息
    this.statusText.setText('GAME OVER!');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);

    console.log('Game Over! Final Score:', this.score);
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

// 导出状态供测试验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}