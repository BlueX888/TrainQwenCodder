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
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建 AI 纹理（灰色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x808080, 1);
    aiGraphics.fillCircle(16, 16, 16);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 创建收集物品纹理（黄色星形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 - 90) * Math.PI / 180;
      const x = 12 + Math.cos(angle) * 12;
      const y = 12 + Math.sin(angle) * 12;
      if (i === 0) {
        itemGraphics.moveTo(x, y);
      } else {
        itemGraphics.lineTo(x, y);
      }
    }
    itemGraphics.closePath();
    itemGraphics.fillPath();
    itemGraphics.generateTexture('item', 24, 24);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建 AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保确定性）
    const seed = 12345;
    let random = seed;
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    for (let i = 0; i < 5; i++) {
      const x = 100 + seededRandom() * 600;
      const y = 100 + seededRandom() * 400;
      const item = this.items.create(x, y, 'item');
      item.setScale(1);
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 碰撞检测：AI 碰到玩家
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 5', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏状态文本（初始隐藏）
    this.gameStatusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      align: 'center'
    });
    this.gameStatusText.setOrigin(0.5);
    this.gameStatusText.setVisible(false);
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

    // AI 追踪玩家（速度 360）
    this.physics.moveToObject(this.ai, this.player, 360);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 5');

    // 检查是否获胜
    if (this.score >= 5) {
      this.gameWon = true;
      this.player.setVelocity(0);
      this.ai.setVelocity(0);
      this.gameStatusText.setText('YOU WIN!');
      this.gameStatusText.setFill('#00ff00');
      this.gameStatusText.setVisible(true);
      console.log('Game Won! Final Score:', this.score);
    }
  }

  hitByAI(player, ai) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    this.gameOver = true;
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.player.setTint(0xff0000);
    this.gameStatusText.setText('GAME OVER\nCaught by AI!');
    this.gameStatusText.setFill('#ff0000');
    this.gameStatusText.setVisible(true);
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

new Phaser.Game(config);