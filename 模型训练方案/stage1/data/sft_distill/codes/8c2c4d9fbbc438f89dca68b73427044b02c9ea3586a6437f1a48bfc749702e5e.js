class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.aiSpeed = 300;
    this.targetScore = 3;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（紫色方块）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x9932cc, 1);
    aiGraphics.fillRect(0, 0, 32, 32);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建物品纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI敌人
    this.ai = this.physics.add.sprite(700, 300, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保可重现）
    const itemPositions = [
      { x: 400, y: 150 },
      { x: 250, y: 450 },
      { x: 600, y: 400 }
    ];

    itemPositions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCircle(12); // 设置圆形碰撞体
    });

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
      this.ai,
      this.hitAI,
      null,
      this
    );

    // 创建UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 3', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 添加说明文本
    this.add.text(16, 50, 'Use Arrow Keys to Move\nCollect 3 items to win\nAvoid the purple AI!', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

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
    this.physics.moveToObject(this.ai, this.player, this.aiSpeed);
  }

  collectItem(player, item) {
    // 销毁物品
    item.destroy();

    // 增加分数
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / ${this.targetScore}`);

    // 检查胜利条件
    if (this.score >= this.targetScore) {
      this.winGame();
    }
  }

  hitAI(player, ai) {
    if (!this.gameOver) {
      this.loseGame();
    }
  }

  winGame() {
    this.gameWon = true;
    this.gameOver = true;

    // 停止所有物体
    this.player.setVelocity(0);
    this.ai.setVelocity(0);

    // 显示胜利文本
    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00' });

    console.log('Game Won! Final Score:', this.score);
  }

  loseGame() {
    this.gameOver = true;

    // 停止所有物体
    this.player.setVelocity(0);
    this.ai.setVelocity(0);

    // 显示失败文本
    this.statusText.setText('GAME OVER\nAI Caught You!');
    this.statusText.setStyle({ fill: '#ff0000' });

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