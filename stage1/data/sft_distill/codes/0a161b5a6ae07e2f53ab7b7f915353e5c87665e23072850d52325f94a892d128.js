class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（青色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x00ffff, 1);
    aiGraphics.fillCircle(20, 20, 20);
    aiGraphics.generateTexture('ai', 40, 40);
    aiGraphics.destroy();

    // 创建物品纹理（黄色星形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 144 - 90) * Math.PI / 180;
      const x = 16 + Math.cos(angle) * 12;
      const y = 16 + Math.sin(angle) * 12;
      if (i === 0) {
        itemGraphics.moveTo(x, y);
      } else {
        itemGraphics.lineTo(x, y);
      }
      const innerAngle = ((i * 144 + 72) - 90) * Math.PI / 180;
      const innerX = 16 + Math.cos(innerAngle) * 5;
      const innerY = 16 + Math.sin(innerAngle) * 5;
      itemGraphics.lineTo(innerX, innerY);
    }
    itemGraphics.closePath();
    itemGraphics.fillPath();
    itemGraphics.generateTexture('item', 32, 32);
    itemGraphics.destroy();
  }

  create() {
    // 重置游戏状态
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;

    // 创建边界
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(200, 200);

    // 创建AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保确定性）
    const itemPositions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 400, y: 500 }
    ];

    itemPositions.forEach(pos => {
      const item = this.items.create(pos.x, pos.y, 'item');
      item.setScale(1);
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitAI, null, this);

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 3', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建结果文本（初始隐藏）
    this.resultText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setVisible(false);

    // 创建重启提示文本
    this.restartText = this.add.text(400, 360, 'Press SPACE to restart', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    this.restartText.setOrigin(0.5);
    this.restartText.setVisible(false);

    // 添加空格键重启功能
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gameOver || this.gameWon) {
        this.scene.restart();
      }
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      // 游戏结束后停止所有移动
      this.player.setVelocity(0, 0);
      this.ai.setVelocity(0, 0);
      return;
    }

    // 玩家控制
    this.player.setVelocity(0, 0);

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

    // AI追踪玩家（速度360）
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
      this.resultText.setText('YOU WIN!');
      this.resultText.setFill('#00ff00');
      this.resultText.setVisible(true);
      this.restartText.setVisible(true);
    }
  }

  hitAI(player, ai) {
    // 被AI碰到失败
    if (!this.gameOver && !this.gameWon) {
      this.gameOver = true;
      this.resultText.setText('GAME OVER!');
      this.resultText.setFill('#ff0000');
      this.resultText.setVisible(true);
      this.restartText.setVisible(true);
      
      // 玩家变红表示失败
      this.player.setTint(0xff0000);
    }
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