class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.TARGET_SCORE = 20;
    this.AI_SPEED = 120;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成 AI 纹理（绿色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ff00, 1);
    aiGraphics.fillCircle(16, 16, 16);
    aiGraphics.generateTexture('ai', 32, 32);
    aiGraphics.destroy();

    // 生成收集物纹理（黄色星形）
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
      const innerAngle = ((i * 144 + 72) - 90) * Math.PI / 180;
      const innerX = 12 + Math.cos(innerAngle) * 5;
      const innerY = 12 + Math.sin(innerAngle) * 5;
      itemGraphics.lineTo(innerX, innerY);
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

    // 创建收集物组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成收集物位置（确定性）
    const seed = 12345;
    let random = seed;
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    for (let i = 0; i < this.TARGET_SCORE; i++) {
      const x = 50 + seededRandom() * 700;
      const y = 50 + seededRandom() * 500;
      const item = this.items.create(x, y, 'item');
      item.setCircle(12);
    }

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测
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

    // UI 文本
    this.scoreText = this.add.text(16, 16, `Score: 0/${this.TARGET_SCORE}`, {
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
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 玩家移动
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

    // AI 追踪玩家
    this.physics.moveToObject(this.ai, this.player, this.AI_SPEED);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/${this.TARGET_SCORE}`);

    if (this.score >= this.TARGET_SCORE) {
      this.winGame();
    }
  }

  hitByAI(player, ai) {
    this.loseGame();
  }

  winGame() {
    this.gameOver = true;
    this.gameWon = true;
    this.physics.pause();
    this.statusText.setText('YOU WIN!');
    this.statusText.setFill('#00ff00');
    this.statusText.setVisible(true);
  }

  loseGame() {
    this.gameOver = true;
    this.gameWon = false;
    this.physics.pause();
    this.statusText.setText('GAME OVER\nCaught by AI!');
    this.statusText.setFill('#ff0000');
    this.statusText.setVisible(true);
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

// 暴露状态变量用于验证
window.getGameState = () => {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    gameOver: scene.gameOver,
    gameWon: scene.gameWon,
    targetScore: scene.TARGET_SCORE,
    playerPos: { x: scene.player.x, y: scene.player.y },
    aiPos: { x: scene.ai.x, y: scene.ai.y },
    itemsRemaining: scene.items.getLength()
  };
};