class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0; // 可验证状态
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成AI纹理（青色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ffff, 1);
    aiGraphics.fillCircle(20, 20, 20);
    aiGraphics.generateTexture('ai', 40, 40);
    aiGraphics.destroy();

    // 生成收集物纹理（黄色星形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 - 90) * Math.PI / 180;
      const x = 16 + Math.cos(angle) * 16;
      const y = 16 + Math.sin(angle) * 16;
      if (i === 0) {
        itemGraphics.moveTo(x, y);
      } else {
        itemGraphics.lineTo(x, y);
      }
    }
    itemGraphics.closePath();
    itemGraphics.fillPath();
    itemGraphics.generateTexture('item', 32, 32);
    itemGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成收集物位置（确定性）
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 400, y: 450 }
    ];

    positions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setCollideWorldBounds(true);
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：玩家收集物品
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    // 碰撞检测：AI碰到玩家
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 3', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.resultText = this.add.text(width / 2, height / 2, '', {
      fontSize: '48px',
      fill: '#ffffff'
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);
  }

  update(time, delta) {
    if (this.gameOver) {
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

    // AI追踪玩家，速度360
    this.physics.moveToObject(this.ai, this.player, 360);
  }

  collectItem(player, item) {
    // 收集物品
    item.destroy();
    this.score++;
    this.scoreText.setText('Score: ' + this.score + ' / 3');

    // 检查胜利条件
    if (this.score >= 3) {
      this.gameWon = true;
      this.gameOver = true;
      this.endGame('YOU WIN!', '#00ff00');
    }
  }

  hitByAI(player, ai) {
    // 被AI碰到，游戏失败
    if (!this.gameOver) {
      this.gameOver = true;
      this.gameWon = false;
      this.endGame('GAME OVER!', '#ff0000');
    }
  }

  endGame(message, color) {
    // 停止所有物理对象
    this.player.setVelocity(0);
    this.ai.setVelocity(0);
    this.physics.pause();

    // 显示结果
    this.resultText.setText(message);
    this.resultText.setColor(color);
    this.resultText.setVisible(true);

    // 添加重启提示
    this.time.delayedCall(1000, () => {
      const restartText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 60,
        'Press SPACE to restart',
        { fontSize: '24px', fill: '#ffffff' }
      );
      restartText.setOrigin(0.5);

      // 空格键重启
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
      });
    });
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