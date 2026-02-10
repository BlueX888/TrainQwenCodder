class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.targetScore = 12;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建AI纹理（蓝色圆形）
    const aiGraphics = this.add.graphics();
    aiGraphics.fillStyle(0x0000ff, 1);
    aiGraphics.fillCircle(20, 20, 20);
    aiGraphics.generateTexture('ai', 40, 40);
    aiGraphics.destroy();

    // 创建收集物纹理（黄色星形）
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
      const innerAngle = (i * 144 + 72 - 90) * Math.PI / 180;
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

    // 创建AI
    this.ai = this.physics.add.sprite(100, 100, 'ai');
    this.ai.setCollideWorldBounds(true);

    // 创建收集物品组
    this.items = this.physics.add.group();
    
    // 使用固定种子生成物品位置（确保确定性）
    const seed = 12345;
    const positions = this.generateItemPositions(seed);
    
    for (let i = 0; i < this.targetScore; i++) {
      const item = this.items.create(positions[i].x, positions[i].y, 'item');
      item.setScale(1.2);
    }

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);
    this.physics.add.overlap(this.player, this.ai, this.hitByAI, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0 / 12', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏状态文本
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 初始化状态
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
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

    // AI追踪玩家（速度300）
    this.physics.moveToObject(this.ai, this.player, 300);
  }

  collectItem(player, item) {
    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score} / ${this.targetScore}`);

    // 检查是否获胜
    if (this.score >= this.targetScore) {
      this.gameWon = true;
      this.endGame('YOU WIN!', '#00ff00');
    }
  }

  hitByAI(player, ai) {
    if (!this.gameOver) {
      this.gameOver = true;
      this.endGame('GAME OVER!', '#ff0000');
    }
  }

  endGame(message, color) {
    // 停止所有移动
    this.player.setVelocity(0);
    this.ai.setVelocity(0);

    // 显示结束信息
    this.statusText.setText(message);
    this.statusText.setStyle({ fill: color });
    this.statusText.setVisible(true);

    // 禁用输入
    this.input.keyboard.enabled = false;

    // 输出最终状态到控制台
    console.log('=== Game End ===');
    console.log('Final Score:', this.score);
    console.log('Game Won:', this.gameWon);
    console.log('Game Over:', this.gameOver);
  }

  // 使用简单的伪随机数生成器确保确定性
  generateItemPositions(seed) {
    const positions = [];
    let random = seed;
    
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    const margin = 50;
    const attempts = 100;

    for (let i = 0; i < this.targetScore; i++) {
      let validPosition = false;
      let attempt = 0;
      let x, y;

      while (!validPosition && attempt < attempts) {
        x = margin + seededRandom() * (800 - 2 * margin);
        y = margin + seededRandom() * (600 - 2 * margin);

        // 确保不与玩家和AI初始位置太近
        const distToPlayer = Phaser.Math.Distance.Between(x, y, 400, 300);
        const distToAI = Phaser.Math.Distance.Between(x, y, 100, 100);
        
        // 确保物品之间有一定距离
        let tooClose = false;
        for (let pos of positions) {
          if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < 60) {
            tooClose = true;
            break;
          }
        }

        if (distToPlayer > 80 && distToAI > 80 && !tooClose) {
          validPosition = true;
        }
        attempt++;
      }

      positions.push({ x, y });
    }

    return positions;
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