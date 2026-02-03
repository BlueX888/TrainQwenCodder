class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.gameOver = false;
    this.score = 0;
  }

  preload() {
    // 创建玩家纹理（绿色圆形）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();
  }

  create() {
    // 添加背景
    this.add.rectangle(400, 300, 800, 600, 0x222222);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);
    this.player.setMaxVelocity(200);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 在场景周围随机位置生成12个敌人
    const positions = [
      { x: 100, y: 100 }, { x: 700, y: 100 }, { x: 100, y: 500 }, { x: 700, y: 500 },
      { x: 400, y: 50 }, { x: 400, y: 550 }, { x: 50, y: 300 }, { x: 750, y: 300 },
      { x: 200, y: 200 }, { x: 600, y: 200 }, { x: 200, y: 400 }, { x: 600, y: 400 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.5);
    });

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示状态文本
    this.statusText = this.add.text(16, 50, 'Status: Playing', {
      fontSize: '20px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    });

    // 游戏说明
    this.add.text(400, 570, 'Use Arrow Keys to Move - Avoid Red Enemies!', {
      fontSize: '18px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 记录游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = (time - this.startTime) / 1000;
    this.score = Math.floor(this.survivalTime * 10);
    this.timeText.setText(`Time: ${this.survivalTime.toFixed(1)}s | Score: ${this.score}`);

    // 玩家移动控制
    const acceleration = 300;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 敌人追踪玩家
    this.enemies.getChildren().forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 80);
    });
  }

  handleCollision(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    this.physics.pause();

    // 更新状态文本
    this.statusText.setText('Status: Game Over!');
    this.statusText.setColor('#ff0000');

    // 显示游戏结束信息
    const gameOverText = this.add.text(400, 300, 
      `GAME OVER!\n\nSurvival Time: ${this.survivalTime.toFixed(2)}s\nFinal Score: ${this.score}\n\nPress R to Restart`, 
      {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 20, y: 20 }
      }
    );
    gameOverText.setOrigin(0.5);

    // 玩家变暗
    this.player.setTint(0x888888);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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